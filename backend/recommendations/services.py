"""
AI-Powered Recommendation System
Combines: Rule-based filtering + TF-IDF + Semantic similarity
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np
from django.conf import settings
from django.db.models import Q, Avg, Count
from django.core.cache import cache
import logging

from tasks.models import Task, TaskApplication
from accounts.models import User

logger = logging.getLogger('recommendations')


class RecommendationService:
    """
    Hybrid Recommendation System
    - Rule-based filtering
    - TF-IDF ranking
    - Semantic matching with Sentence Transformers
    """
    
    def __init__(self):
        """Initialize the recommendation service"""
        # Load sentence transformer model (cached locally after first download)
        model_name = settings.RECOMMENDATION_MODEL
        
        # Try to get from cache first
        self.semantic_model = cache.get('sentence_transformer_model')
        
        if self.semantic_model is None:
            logger.info(f"Loading sentence transformer model: {model_name}")
            self.semantic_model = SentenceTransformer(model_name)
            # Cache for 24 hours
            cache.set('sentence_transformer_model', self.semantic_model, 86400)
            logger.info("Model loaded and cached successfully")
    
    # =========================================================================
    # TASK RECOMMENDATIONS FOR FREELANCERS
    # =========================================================================
    
    def recommend_tasks_for_freelancer(self, user, limit=None):
        """
        Recommend tasks for a freelancer
        
        Args:
            user: Freelancer user object
            limit: Maximum number of recommendations (default from settings)
        
        Returns:
            QuerySet of recommended tasks
        """
        if limit is None:
            limit = settings.MAX_RECOMMENDATIONS
        
        try:
            logger.info(f"Generating task recommendations for user: {user.username}")
            
            # Step 1: Rule-based filtering
            filtered_tasks = self._filter_tasks_for_user(user)
            
            if not filtered_tasks.exists():
                logger.info("No tasks passed filtering, returning recent open tasks")
                return Task.objects.filter(status='OPEN').order_by('-created_at')[:limit]
            
            # Step 2: Build user profile text
            user_profile_text = self._build_user_profile_text(user)
            
            # Step 3: Hybrid scoring (TF-IDF + Semantic)
            ranked_tasks = self._hybrid_task_ranking(
                filtered_tasks,
                user_profile_text
            )
            
            # Step 4: Return top N tasks with scores
            top_ranked = ranked_tasks[:limit]

            # Attach match_score to each task object
            for item in top_ranked:
                # Convert score to percentage (0-100)
                match_percentage = int(item['score'] * 100)
                # Clamp between 1-100
                match_percentage = max(1, min(100, match_percentage))
                item['task'].match_score = match_percentage

            # Return list of tasks with match_score attribute attached
            return [item['task'] for item in top_ranked]
            
        except Exception as e:
            logger.error(f"Error in task recommendation: {str(e)}", exc_info=True)
            # Fallback: return recent open tasks
            return Task.objects.filter(status='OPEN').order_by('-created_at')[:limit]
    
    def _filter_tasks_for_user(self, user):
        """
        Rule-based filtering of tasks
        """
        # Get tasks user already applied to
        applied_task_ids = TaskApplication.objects.filter(
            freelancer=user
        ).values_list('task_id', flat=True)
        
        # Base query: exclude own tasks, applied tasks, and only OPEN status
        queryset = Task.objects.exclude(
            id__in=applied_task_ids
        ).exclude(
            client=user
        ).filter(
            status='OPEN'
        ).select_related('category', 'client')
        
        # Get user preferences if exists
        try:
            from .models import UserPreference
            prefs = UserPreference.objects.get(user=user)
            
            # Location filtering
            if prefs.preferred_location:
                queryset = queryset.filter(
                    Q(city__icontains=prefs.preferred_location) |
                    Q(is_remote=True)
                )
            
            # Budget filtering
            if prefs.min_budget:
                queryset = queryset.filter(budget__gte=prefs.min_budget)
            
            if prefs.max_budget:
                queryset = queryset.filter(budget__lte=prefs.max_budget)
            
            # Remote preference
            if prefs.prefer_remote and not prefs.prefer_physical:
                queryset = queryset.filter(Q(is_remote=True) | Q(task_type='DIGITAL'))
            
        except Exception as e:
            logger.debug(f"No user preferences found or error: {e}")
        
        return queryset
    
    def _build_user_profile_text(self, user):
        """
        Build text representation of user's profile and history
        """
        profile_parts = []
        
        # Bio and skills
        if user.bio:
            profile_parts.append(user.bio)
        
        if user.skills:
            profile_parts.append(user.skills)
        
        # Past task categories
        past_tasks = TaskApplication.objects.filter(
            freelancer=user,
            status='ACCEPTED'
        ).select_related('task__category')[:20]
        
        categories = [
            app.task.category.name
            for app in past_tasks
            if app.task.category
        ]
        
        if categories:
            profile_parts.append(' '.join(categories))
        
        # Past task titles/descriptions (weighted)
        task_texts = [
            f"{app.task.title} {app.task.description[:200]}"
            for app in past_tasks[:5]
        ]
        
        if task_texts:
            profile_parts.extend(task_texts)
        
        return ' '.join(profile_parts) if profile_parts else f"{user.username} freelancer"
    
    def _hybrid_task_ranking(self, tasks, user_profile_text):
        """
        Rank tasks using hybrid approach: TF-IDF + Semantic similarity
        """
        if not tasks.exists():
            return []
        
        # Build task texts
        task_list = list(tasks)
        task_texts = [
            self._build_task_text(task)
            for task in task_list
        ]
        
        # Calculate TF-IDF scores
        tfidf_scores = self._calculate_tfidf_scores(
            user_profile_text,
            task_texts
        )
        
        # Calculate semantic similarity scores
        semantic_scores = self._calculate_semantic_scores(
            user_profile_text,
            task_texts
        )
        
        # Combine scores with weights from settings
        weights = settings.RECOMMENDATION_WEIGHTS
        tfidf_weight = weights.get('tfidf', 0.4)
        semantic_weight = weights.get('semantic', 0.6)
        
        ranked_tasks = []
        for i, task in enumerate(task_list):
            combined_score = (
                tfidf_scores[i] * tfidf_weight +
                semantic_scores[i] * semantic_weight
            )
            
            # Boost score based on task freshness and budget
            boost = self._calculate_task_boost(task)
            final_score = combined_score * boost
            
            ranked_tasks.append({
                'task': task,
                'score': final_score,
                'tfidf_score': tfidf_scores[i],
                'semantic_score': semantic_scores[i],
                'boost': boost
            })
        
        # Sort by final score
        ranked_tasks.sort(key=lambda x: x['score'], reverse=True)
        
        logger.info(f"Ranked {len(ranked_tasks)} tasks")
        return ranked_tasks
    
    def _build_task_text(self, task):
        """Build text representation of a task"""
        parts = [
            task.title,
            task.description,
        ]
        
        if task.category:
            parts.append(task.category.name)
        
        if task.location:
            parts.append(task.location)
        
        parts.append(task.task_type)
        
        return ' '.join(parts)
    
    def _calculate_tfidf_scores(self, user_text, task_texts):
        """
        Calculate TF-IDF similarity scores
        """
        try:
            corpus = [user_text] + task_texts
            
            vectorizer = TfidfVectorizer(
                max_features=settings.TFIDF_MAX_FEATURES,
                stop_words='english',
                ngram_range=(1, 2)  # Unigrams and bigrams
            )
            
            tfidf_matrix = vectorizer.fit_transform(corpus)
            
            # User vector vs all task vectors
            user_vector = tfidf_matrix[0:1]
            task_vectors = tfidf_matrix[1:]
            
            similarities = cosine_similarity(user_vector, task_vectors)[0]
            
            return similarities
            
        except Exception as e:
            logger.error(f"TF-IDF calculation error: {e}")
            return np.zeros(len(task_texts))
    
    def _calculate_semantic_scores(self, user_text, task_texts):
        """
        Calculate semantic similarity using sentence transformers
        """
        try:
            # Generate embeddings
            user_embedding = self.semantic_model.encode(user_text)
            task_embeddings = self.semantic_model.encode(task_texts)
            
            # Calculate cosine similarity
            similarities = cosine_similarity(
                [user_embedding],
                task_embeddings
            )[0]
            
            return similarities
            
        except Exception as e:
            logger.error(f"Semantic similarity calculation error: {e}")
            return np.zeros(len(task_texts))
    
    def _calculate_task_boost(self, task):
        """
        Calculate boost factor based on task properties
        """
        boost = 1.0
        
        # Recent tasks get a boost
        from django.utils import timezone
        from datetime import timedelta
        
        days_old = (timezone.now() - task.created_at).days
        if days_old < 1:
            boost *= 1.3
        elif days_old < 3:
            boost *= 1.2
        elif days_old < 7:
            boost *= 1.1
        
        # Tasks with fewer applications get a boost
        if task.applications_count < 3:
            boost *= 1.2
        elif task.applications_count < 5:
            boost *= 1.1
        
        # Higher budget tasks get a slight boost
        if task.budget > 1000:
            boost *= 1.1
        
        return boost
    
    # =========================================================================
    # FREELANCER RECOMMENDATIONS FOR TASKS
    # =========================================================================
    
    def recommend_freelancers_for_task(self, task, limit=None):
        """
        Recommend freelancers for a specific task
        
        Args:
            task: Task object
            limit: Maximum number of recommendations
        
        Returns:
            QuerySet of recommended freelancers
        """
        if limit is None:
            limit = settings.MAX_RECOMMENDATIONS
        
        try:
            logger.info(f"Generating freelancer recommendations for task: {task.title}")
            
            # Step 1: Filter eligible freelancers
            filtered_freelancers = self._filter_freelancers_for_task(task)
            
            if not filtered_freelancers.exists():
                logger.info("No freelancers passed filtering")
                return User.objects.none()
            
            # Step 2: Build task text
            task_text = self._build_task_text(task)
            
            # Step 3: Rank freelancers
            ranked_freelancers = self._rank_freelancers_for_task(
                filtered_freelancers,
                task_text,
                task
            )
            
            # Step 4: Return top N
            top_freelancer_ids = [item['freelancer'].id for item in ranked_freelancers[:limit]]
            
            return User.objects.filter(id__in=top_freelancer_ids)
            
        except Exception as e:
            logger.error(f"Error in freelancer recommendation: {str(e)}", exc_info=True)
            return User.objects.none()
    
    def _filter_freelancers_for_task(self, task):
        """
        Filter eligible freelancers for a task
        """
        # Get freelancers who already applied
        applied_freelancer_ids = TaskApplication.objects.filter(
            task=task
        ).values_list('freelancer_id', flat=True)
        
        # Base query: active freelancers who haven't applied
        queryset = User.objects.filter(
            user_type__in=['FREELANCER', 'BOTH'],
            is_active=True
        ).exclude(
            id__in=applied_freelancer_ids
        ).exclude(
            id=task.client_id
        )
        
        # Filter by location if task is physical
        if task.task_type == 'PHYSICAL' and not task.is_remote and task.city:
            queryset = queryset.filter(
                Q(city__iexact=task.city) |
                Q(city__icontains=task.city)
            )
        
        return queryset
    
    def _rank_freelancers_for_task(self, freelancers, task_text, task):
        """
        Rank freelancers for a task
        """
        if not freelancers.exists():
            return []
        
        freelancer_list = list(freelancers)
        
        # Build freelancer profile texts
        freelancer_texts = [
            self._build_user_profile_text(freelancer)
            for freelancer in freelancer_list
        ]
        
        # Calculate semantic similarity
        semantic_scores = self._calculate_semantic_scores_for_freelancers(
            task_text,
            freelancer_texts
        )
        
        # Rank with additional factors
        ranked_freelancers = []
        for i, freelancer in enumerate(freelancer_list):
            base_score = semantic_scores[i]
            
            # Rating boost
            rating_boost = 1.0 + (freelancer.average_rating / 10.0)
            
            # Experience boost (based on total reviews)
            experience_boost = 1.0 + min(freelancer.total_reviews / 50.0, 0.5)
            
            # Verification boost
            verification_boost = 1.2 if freelancer.is_verified else 1.0
            
            final_score = base_score * rating_boost * experience_boost * verification_boost
            
            ranked_freelancers.append({
                'freelancer': freelancer,
                'score': final_score,
                'semantic_score': semantic_scores[i],
                'rating_boost': rating_boost,
                'experience_boost': experience_boost
            })
        
        ranked_freelancers.sort(key=lambda x: x['score'], reverse=True)
        
        logger.info(f"Ranked {len(ranked_freelancers)} freelancers")
        return ranked_freelancers
    
    def _calculate_semantic_scores_for_freelancers(self, task_text, freelancer_texts):
        """
        Calculate semantic similarity for freelancers
        """
        try:
            task_embedding = self.semantic_model.encode(task_text)
            freelancer_embeddings = self.semantic_model.encode(freelancer_texts)
            
            similarities = cosine_similarity(
                [task_embedding],
                freelancer_embeddings
            )[0]
            
            return similarities
            
        except Exception as e:
            logger.error(f"Semantic similarity error: {e}")
            return np.zeros(len(freelancer_texts))
    
    # =========================================================================
    # LOGGING
    # =========================================================================
    
    def log_recommendation(self, user, recommendation_type, items, algorithm='hybrid'):
        """
        Log recommendations for analytics
        """
        try:
            from .models import RecommendationLog
            import json
            
            item_ids = [item.id for item in items]
            
            RecommendationLog.objects.create(
                user=user,
                recommendation_type=recommendation_type,
                recommended_items=json.dumps(item_ids),
                algorithm_used=algorithm
            )
            
        except Exception as e:
            logger.error(f"Error logging recommendation: {e}")


# Singleton instance
_recommendation_service = None

def get_recommendation_service():
    """Get or create recommendation service singleton"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service