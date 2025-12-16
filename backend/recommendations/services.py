"""
STRUCTURED SKILL-BASED RECOMMENDATION SYSTEM WITH SAFE CACHING
==============================================================

This version includes graceful fallbacks for missing dependencies
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    
import numpy as np
from django.conf import settings
from django.db.models import Q, Count, Prefetch
from django.core.cache import cache
import logging

from tasks.models import Task, TaskApplication
from accounts.models import User

logger = logging.getLogger('recommendations')

# Cache timeout for recommendations (5 minutes)
RECOMMENDATION_CACHE_TIMEOUT = 300


class StructuredRecommendationService:
    """
    Structured Skill-Based Recommendation System with safe caching
    """

    def __init__(self):
        """Initialize the recommendation service with error handling"""
        try:
            model_name = getattr(settings, 'RECOMMENDATION_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')

            if not SENTENCE_TRANSFORMERS_AVAILABLE:
                logger.warning("sentence-transformers not available, using fallback")
                self.semantic_model = None
                return

            # Try to get from cache first
            self.semantic_model = cache.get('sentence_transformer_model')

            if self.semantic_model is None:
                logger.info(f"Loading sentence transformer model: {model_name}")
                self.semantic_model = SentenceTransformer(model_name)
                try:
                    cache.set('sentence_transformer_model', self.semantic_model, 86400)
                    logger.info("Model loaded and cached successfully")
                except Exception as e:
                    logger.warning(f"Failed to cache model: {e}")
        except Exception as e:
            logger.error(f"Error initializing recommendation service: {e}")
            self.semantic_model = None

    def recommend_tasks_for_freelancer(self, user, limit=None, use_cache=True):
        """
        Recommend tasks using STRUCTURED SKILL ID MATCHING as primary factor

        Includes COLD START ALGORITHM for new users without skills/preferences

        Safe version with error handling
        """
        if user.user_type not in ["freelancer", "both"]:
            raise ValueError("User is not a freelancer")

        if limit is None:
            limit = getattr(settings, 'MAX_RECOMMENDATIONS', 10)

        # Check cache first (if enabled) - with error handling
        if use_cache:
            try:
                cache_key = f'recommendations_user_{user.id}_limit_{limit}'
                cached_recommendations = cache.get(cache_key)

                if cached_recommendations:
                    logger.info(f"✓ Returning cached recommendations for {user.username}")
                    return cached_recommendations
            except Exception as e:
                logger.warning(f"Cache read error: {e}, generating fresh recommendations")

        try:
            logger.info(f"[RECOMMENDATION] Generating fresh recommendations for: {user.username}")

            self._current_user = user

            # Check if user has skills (for cold start detection)
            user_skill_ids = self._get_user_skill_ids(user)
            has_skills = len(user_skill_ids) > 0

            # Check if user has completed onboarding
            has_onboarding = self._check_onboarding_status(user)

            # COLD START: No skills + No onboarding
            if not has_skills and not has_onboarding:
                logger.info(f"[COLD START] User {user.username} has no skills/preferences. Using cold start algorithm...")
                return self._cold_start_recommendations(user, limit, use_cache)

            # STEP 1: Filter tasks (location-based)
            filtered_tasks = self._filter_tasks_for_user(user)

            if not filtered_tasks.exists():
                logger.info("No tasks passed filtering, using cold start fallback")
                return self._cold_start_recommendations(user, limit, use_cache)

            logger.info(f"Filtered to {filtered_tasks.count()} tasks")
            logger.info(f"User has {len(user_skill_ids)} structured skills: {user_skill_ids}")

            # STEP 2: Score each task using STRUCTURED matching
            ranked_tasks = self._rank_tasks_by_structure(
                filtered_tasks,
                user,
                user_skill_ids
            )

            # STEP 3: Return top N
            top_tasks = ranked_tasks[:limit]

            # Attach match_score to each task
            result = []
            for item in top_tasks:
                match_percentage = int(item['final_score'] * 100)
                match_percentage = max(1, min(100, match_percentage))
                item['task'].match_score = match_percentage
                result.append(item['task'])

            # Cache the results - with error handling
            if use_cache:
                try:
                    cache_key = f'recommendations_user_{user.id}_limit_{limit}'
                    cache.set(cache_key, result, RECOMMENDATION_CACHE_TIMEOUT)
                    logger.info(f"✓ Cached recommendations for {user.username} (5 min TTL)")
                except Exception as e:
                    logger.warning(f"Cache write error: {e}")

            return result

        except Exception as e:
            logger.error(f"Recommendation error: {e}", exc_info=True)
            return self._cold_start_recommendations(user, limit, use_cache)

    def _check_onboarding_status(self, user):
        """Check if user has completed onboarding"""
        try:
            from .models import UserPreference
            prefs = UserPreference.objects.filter(user=user, onboarding_completed=True).first()
            return prefs is not None
        except Exception as e:
            logger.warning(f"Error checking onboarding status: {e}")
            return False

    def _cold_start_recommendations(self, user, limit, use_cache=True):
        """
        COLD START ALGORITHM

        For new users without skills or preferences, recommend based on:
        1. Location match (same city as user)
        2. Popularity (most viewed/applied tasks)
        3. Recency (newest tasks first)
        4. Budget range (mid-range tasks)

        This ensures new users see relevant, quality content immediately
        """
        logger.info(f"[COLD START] Generating cold start recommendations for {user.username}")

        try:
            # Base queryset: OPEN tasks only
            queryset = Task.objects.filter(status='OPEN').select_related('category', 'client')

            # Exclude tasks user already applied to
            try:
                applied_task_ids = TaskApplication.objects.filter(
                    freelancer=user
                ).values_list('task_id', flat=True)
                queryset = queryset.exclude(id__in=applied_task_ids)
            except:
                pass

            # Exclude user's own tasks
            queryset = queryset.exclude(client=user)

            # Build scoring components
            from django.db.models import Q, F, Case, When, IntegerField, Value

            # Location scoring
            location_score = Case(
                # Same city = +50 points
                When(city__iexact=user.city, then=Value(50)),
                # Remote tasks = +30 points
                When(is_remote=True, then=Value(30)),
                # Other locations = 0 points
                default=Value(0),
                output_field=IntegerField()
            )

            # Popularity scoring (views + applications * 2)
            # Applications worth more than views
            popularity_score = F('views_count') + (F('applications_count') * 2)

            # Annotate with scores
            queryset = queryset.annotate(
                location_score=location_score,
                popularity_score=popularity_score,
                # Combined score: location (40%) + popularity (30%) + recency (30%)
                cold_start_score=(
                    F('location_score') * 4 +  # Location weight: 4x
                    F('popularity_score') +     # Popularity weight: 1x
                    Value(0)                     # Recency handled by ordering
                )
            )

            # Order by score, then by creation date (newest first)
            queryset = queryset.order_by('-cold_start_score', '-created_at')

            # Get top N tasks
            tasks = list(queryset[:limit])

            # Add default match_score for cold start (60% - indicates partial match)
            for task in tasks:
                task.match_score = 60

            logger.info(f"[COLD START] Returning {len(tasks)} tasks for {user.username}")
            logger.info(f"  Location: {user.city or 'Not set'}")
            logger.info(f"  Strategy: Location + Popularity + Recency")

            # Cache if enabled
            if use_cache:
                try:
                    cache_key = f'recommendations_user_{user.id}_limit_{limit}'
                    cache.set(cache_key, tasks, RECOMMENDATION_CACHE_TIMEOUT)
                    logger.info(f"✓ Cached cold start recommendations (5 min TTL)")
                except Exception as e:
                    logger.warning(f"Cache write error: {e}")

            return tasks

        except Exception as e:
            logger.error(f"Cold start error: {e}", exc_info=True)
            # Ultimate fallback: just return recent tasks
            return list(Task.objects.filter(status='OPEN').order_by('-created_at')[:limit])

    def _get_user_skill_ids(self, user):
        """
        Get set of user's structured skill IDs with safe caching
        """
        try:
            cache_key = f'user_skills_{user.id}'
            cached_skills = cache.get(cache_key)

            if cached_skills is not None:
                logger.debug(f"Using cached skills for {user.username}")
                return cached_skills
        except Exception as e:
            logger.warning(f"Cache error for user skills: {e}")

        try:
            from .skill_model import UserSkill

            user_skills = UserSkill.objects.filter(user=user).values_list('skill_id', flat=True)
            skill_ids = set(user_skills)

            # Try to cache - but don't fail if cache is down
            try:
                cache.set(cache_key, skill_ids, 1800)
                logger.debug(f"Cached skills for {user.username}: {skill_ids}")
            except Exception as e:
                logger.warning(f"Failed to cache user skills: {e}")

            return skill_ids
        except Exception as e:
            logger.error(f"Error getting user skills: {e}")
            return set()

    def _get_task_skill_ids(self, task):
        """Get set of task's required skill IDs with error handling"""
        try:
            skill_ids = task.required_skills.values_list('id', flat=True)
            return set(skill_ids)
        except Exception as e:
            logger.debug(f"Error getting task skills: {e}")
            return set()

    def _rank_tasks_by_structure(self, tasks, user, user_skill_ids):
        """
        Rank tasks using STRUCTURED data as primary factor
        """
        ranked_tasks = []

        # Build task texts for tiebreaker
        task_list = list(tasks.prefetch_related('required_skills'))
        task_texts = [self._build_task_text(task) for task in task_list]

        # Build user profile text (for tiebreaker only)
        user_text = self._build_minimal_user_text(user)

        # Calculate text similarity (tiebreaker)
        text_similarities = self._calculate_text_similarity(user_text, task_texts)

        for i, task in enumerate(task_list):
            # STEP 1: SKILL ID MATCHING (PRIMARY)
            task_skill_ids = self._get_task_skill_ids(task)
            skill_match_count = len(user_skill_ids & task_skill_ids)

            # Skill boost based on ID matches
            if skill_match_count >= 3:
                skill_boost = 10.0
                logger.info(f"[SKILL MATCH 10.0x] Task {task.id} '{task.title[:30]}' matches {skill_match_count} skills")
            elif skill_match_count == 2:
                skill_boost = 7.0
                logger.info(f"[SKILL MATCH 7.0x] Task {task.id} '{task.title[:30]}' matches {skill_match_count} skills")
            elif skill_match_count == 1:
                skill_boost = 5.0
                logger.info(f"[SKILL MATCH 5.0x] Task {task.id} '{task.title[:30]}' matches {skill_match_count} skills")
            else:
                if task_skill_ids:
                    skill_boost = 0.1
                    logger.debug(f"[NO SKILL MATCH 0.1x] Task {task.id} has skills but user doesn't match")
                else:
                    skill_boost = 1.0
                    logger.debug(f"[NO REQUIRED SKILLS 1.0x] Task {task.id} has no skill requirements")

            # STEP 2: LOCATION MATCHING (SECONDARY)
            location_boost = self._calculate_location_boost(task, user)

            # STEP 3: TEXT SIMILARITY (TIEBREAKER)
            text_similarity = text_similarities[i] if text_similarities is not None else 0.5

            # FINAL SCORE CALCULATION
            final_score = skill_boost * location_boost * (0.1 + text_similarity * 0.9)

            # Normalize to 0-1 range with better scaling for user-friendly percentages
            # Max theoretical: 10 * 2.5 * 1.0 = 25.0
            # But we normalize by 15.0 to show higher percentages for good matches
            normalized_score = min(1.0, final_score / 15.0)

            ranked_tasks.append({
                'task': task,
                'skill_match_count': skill_match_count,
                'skill_boost': skill_boost,
                'location_boost': location_boost,
                'text_similarity': text_similarity,
                'final_score': normalized_score,
                'raw_score': final_score
            })

            logger.debug(f"Task {task.id}: Skills={skill_boost:.1f}x, Location={location_boost:.1f}x, Text={text_similarity:.2f}, Final={normalized_score:.2f}")

        # Sort by final score (descending)
        ranked_tasks.sort(key=lambda x: x['raw_score'], reverse=True)

        logger.info(f"Ranked {len(ranked_tasks)} tasks by structured data")
        return ranked_tasks

    def _calculate_location_boost(self, task, user):
        """Calculate location boost factor"""
        try:
            if task.city and user.city:
                if task.city.lower() == user.city.lower():
                    logger.info(f"[LOCATION MATCH 2.5x] Task {task.id} in {task.city}")
                    return 2.5
                elif getattr(task, 'is_remote', False):
                    logger.debug(f"[REMOTE 1.8x] Task {task.id} is remote")
                    return 1.8
                else:
                    logger.debug(f"[LOCATION MISMATCH 0.2x] Task {task.id}")
                    return 0.2
            elif getattr(task, 'is_remote', False):
                logger.debug(f"[REMOTE 2.0x] Task {task.id} is remote")
                return 2.0
            else:
                return 1.0
        except Exception as e:
            logger.warning(f"Error calculating location boost: {e}")
            return 1.0

    def _build_minimal_user_text(self, user):
        """Build minimal user text for tiebreaking"""
        parts = []

        try:
            if hasattr(user, 'bio') and user.bio:
                parts.append(user.bio)

            if hasattr(user, 'skills') and user.skills:
                parts.append(user.skills)

            if not parts:
                city = getattr(user, 'city', 'Egypt')
                parts.append(f"Freelancer in {city or 'Egypt'}")
        except Exception as e:
            logger.warning(f"Error building user text: {e}")
            parts.append("Freelancer")

        return ' '.join(parts)

    def _build_task_text(self, task):
        """Build task text for similarity matching"""
        parts = []
        
        try:
            parts.append(task.title)
            parts.append(task.description)

            if hasattr(task, 'category') and task.category:
                parts.append(task.category.name)

            if hasattr(task, 'location') and task.location:
                parts.append(task.location)
        except Exception as e:
            logger.warning(f"Error building task text: {e}")

        return ' '.join(parts) if parts else "Task"

    def _calculate_text_similarity(self, user_text, task_texts):
        """Calculate text similarity with fallback"""
        try:
            if not self.semantic_model or not SENTENCE_TRANSFORMERS_AVAILABLE:
                logger.debug("Semantic model not available, using fallback similarity")
                return np.full(len(task_texts), 0.5)  # Neutral similarity

            user_embedding = self.semantic_model.encode(user_text)
            task_embeddings = self.semantic_model.encode(task_texts)

            similarities = cosine_similarity(
                [user_embedding],
                task_embeddings
            )[0]

            return similarities

        except Exception as e:
            logger.error(f"Text similarity error: {e}")
            return np.full(len(task_texts), 0.5)  # Fallback to neutral

    def _filter_tasks_for_user(self, user):
        """Filter tasks by location"""
        try:
            # Get tasks user already applied to
            applied_task_ids = TaskApplication.objects.filter(
                freelancer=user
            ).values_list('task_id', flat=True)

            # Base query
            queryset = Task.objects.exclude(
                id__in=applied_task_ids
            ).exclude(
                client=user
            ).filter(
                status='OPEN'
            ).select_related('category', 'client')

            # Location filter
            try:
                from .models import UserPreference
                prefs = UserPreference.objects.get(user=user)
                location = prefs.preferred_location or user.city
            except:
                location = user.city

            if location:
                queryset = queryset.filter(
                    Q(city__iexact=location) |
                    Q(is_remote=True)
                )
                logger.info(f"Location filter: {location} or REMOTE")

            logger.info(f"Filtered tasks: {queryset.count()} match location criteria")

            return queryset
        except Exception as e:
            logger.error(f"Error filtering tasks: {e}", exc_info=True)
            return Task.objects.filter(status='OPEN')

    def recommend_service_offerings(self, user, limit=5):
        """
        Recommend services the USER could OFFER based on:
        1. Categories they frequently request (they understand that market)
        2. Skills they have
        3. High-demand categories in their location
        4. Services with good earning potential

        This is NOT about recommending other clients/freelancers,
        but suggesting what services the user themselves could provide.
        """
        try:
            from tasks.models import Category
            from django.db.models import Count, Avg, Q

            logger.info(f"[SERVICE OFFERINGS] Generating suggestions for {user.username}")

            # Get user's skills
            user_skill_ids = self._get_user_skill_ids(user)

            # Analyze user's request history (what they post as client)
            user_posted_categories = Task.objects.filter(
                client=user
            ).values('category').annotate(
                count=Count('id')
            ).order_by('-count')[:3]

            frequent_category_ids = [item['category'] for item in user_posted_categories if item['category']]

            logger.info(f"  User frequently requests: {frequent_category_ids}")
            logger.info(f"  User has {len(user_skill_ids)} skills")

            # Get categories with high demand (many open tasks)
            high_demand_categories = Category.objects.filter(
                is_active=True
            ).annotate(
                open_task_count=Count('tasks', filter=Q(tasks__status='OPEN')),
                avg_budget=Avg('tasks__budget', filter=Q(tasks__status='OPEN'))
            ).filter(
                open_task_count__gte=3  # At least 3 open tasks
            ).order_by('-open_task_count')

            # Score each category
            category_scores = []

            for category in high_demand_categories:
                score = 0
                reasons = []

                # 1. User frequently requests this (40 points) - they know the market!
                if category.id in frequent_category_ids:
                    score += 40
                    request_count = next((item['count'] for item in user_posted_categories if item['category'] == category.id), 0)
                    reasons.append(f"You've requested this {request_count} times")

                # 2. User has matching skills (30 points)
                if user_skill_ids and hasattr(category, 'related_skills'):
                    category_skill_ids = set(category.related_skills.values_list('id', flat=True))
                    matching_skills = user_skill_ids.intersection(category_skill_ids)
                    if matching_skills:
                        skill_match_score = min(30, len(matching_skills) * 10)
                        score += skill_match_score
                        reasons.append(f"{len(matching_skills)} matching skills")

                # 3. High demand (20 points max)
                demand_score = min(20, category.open_task_count * 2)
                score += demand_score
                reasons.append(f"{category.open_task_count} open tasks")

                # 4. Good average budget (10 points max)
                if category.avg_budget:
                    budget_score = min(10, int(category.avg_budget / 1000))
                    score += budget_score
                    reasons.append(f"Avg {int(category.avg_budget)} EGP")

                if score > 0:
                    category_scores.append({
                        'category': category,
                        'score': score,
                        'reasons': reasons,
                        'open_tasks': category.open_task_count,
                        'avg_budget': category.avg_budget or 0
                    })

            # Sort by score
            category_scores.sort(key=lambda x: x['score'], reverse=True)

            # Take top results
            top_offerings = category_scores[:limit]

            # Format results for API
            results = []
            for item in top_offerings:
                results.append({
                    'id': item['category'].id,
                    'name': item['category'].name,
                    'slug': item['category'].slug,
                    'description': item['category'].description,
                    'icon': item['category'].icon,
                    'match_score': min(100, item['score']),
                    'reasons': item['reasons'],
                    'opportunity': {
                        'open_tasks': item['open_tasks'],
                        'avg_budget': int(item['avg_budget']),
                        'potential': 'High' if item['score'] >= 50 else 'Medium' if item['score'] >= 30 else 'Good'
                    }
                })

            logger.info(f"[SERVICE OFFERINGS] Generated {len(results)} suggestions")
            for r in results:
                logger.info(f"  {r['name']}: {r['match_score']}% - {', '.join(r['reasons'])}")

            return results

        except Exception as e:
            logger.error(f"Error generating service offerings: {e}", exc_info=True)
            return []

    def clear_user_cache(self, user):
        """Manually clear all cache entries for a user"""
        try:
            for limit in [5, 10, 15, 20, 50]:
                cache_key = f'recommendations_user_{user.id}_limit_{limit}'
                cache.delete(cache_key)
            
            skill_cache_key = f'user_skills_{user.id}'
            cache.delete(skill_cache_key)
            
            logger.info(f"🔄 Manually cleared all caches for {user.username}")
        except Exception as e:
            logger.warning(f"Error clearing cache: {e}")

    def log_recommendation(self, user, recommendation_type, items):
        """Log recommendation for analytics"""
        try:
            from .models import RecommendationLog

            if items:
                item_ids = [item.id for item in items if hasattr(item, 'id')]
            else:
                item_ids = []

            # Create log entry  
            RecommendationLog.objects.create(
                user=user,
                recommendation_type=recommendation_type,
                recommended_items=str(item_ids),  # Convert to string for TextField
                algorithm_used='structured_skills'
            )

            logger.info(f"Logged {len(item_ids)} {recommendation_type} recommendations for {user.username}")

        except Exception as e:
            logger.warning(f"Failed to log recommendation: {e}")

    def recommend_freelancers_for_task(self, task, limit=None):
        """Recommend freelancers for a task"""
        if limit is None:
            limit = getattr(settings, 'MAX_RECOMMENDATIONS', 10)

        try:
            logger.info(f"[FREELANCER REC] Finding freelancers for task: {task.title}")

            task_skill_ids = self._get_task_skill_ids(task)
            logger.info(f"Task requires {len(task_skill_ids)} skills: {task_skill_ids}")

            freelancers = User.objects.filter(
                user_type__in=['freelancer', 'both']
            ).exclude(id=task.client.id)

            if task.city and not getattr(task, 'is_remote', False):
                freelancers = freelancers.filter(
                    Q(city__iexact=task.city) | Q(city__isnull=True)
                )

            scored_freelancers = []

            for freelancer in freelancers:
                freelancer_skill_ids = self._get_user_skill_ids(freelancer)
                skill_match_count = len(task_skill_ids & freelancer_skill_ids)

                if task_skill_ids:
                    skill_score = skill_match_count / len(task_skill_ids)
                else:
                    skill_score = 0.5

                location_score = 1.0
                if task.city and freelancer.city:
                    if task.city.lower() == freelancer.city.lower():
                        location_score = 1.5

                rating_score = float(freelancer.average_rating) / 5.0 if freelancer.average_rating else 0.5

                final_score = skill_score * 0.6 + rating_score * 0.3 + (location_score - 1.0) * 0.1

                scored_freelancers.append({
                    'freelancer': freelancer,
                    'score': final_score,
                    'skill_match_count': skill_match_count
                })

            scored_freelancers.sort(key=lambda x: x['score'], reverse=True)
            top_freelancers = [item['freelancer'] for item in scored_freelancers[:limit]]

            logger.info(f"Recommended {len(top_freelancers)} freelancers for task {task.id}")
            return top_freelancers

        except Exception as e:
            logger.error(f"Freelancer recommendation error: {e}", exc_info=True)
            return []

    def recommend_freelancers_for_client(self, client, limit=10):
        """
        Recommend freelancers for a client to discover and contact

        PROFESSIONAL MULTI-FACTOR MATCHING:
        1. Category Intelligence (40%) - Freelancers in categories client frequently posts
        2. Location Proximity (20%) - Same city or remote-capable providers
        3. Quality Score (20%) - Ratings, completion rate, experience
        4. Availability (10%) - Recently active, responsive providers
        5. Budget Compatibility (10%) - Rate ranges matching client's budget
        """
        try:
            logger.info(f"[FREELANCER DISCOVERY] Finding freelancers for client: {client.username}")

            # Get client's posting history to understand their needs
            from django.db.models import Count, Avg, Q
            from django.utils import timezone
            from datetime import timedelta

            # Analyze client's task posting patterns
            client_tasks = Task.objects.filter(client=client)

            # Get categories client frequently posts in
            frequent_categories = client_tasks.values('category').annotate(
                count=Count('id')
            ).order_by('-count')[:5]

            frequent_category_ids = [item['category'] for item in frequent_categories if item['category']]

            # Get average budget client usually posts
            avg_budget = client_tasks.aggregate(Avg('budget'))['budget__avg'] or 500

            logger.info(f"  Client frequent categories: {frequent_category_ids}")
            logger.info(f"  Client avg budget: {avg_budget} EGP")

            # Get all active freelancers
            freelancers = User.objects.filter(
                user_type__in=['freelancer', 'both'],
                is_active=True
            ).exclude(id=client.id)

            # Get freelancers with completed tasks (experienced)
            from django.db.models import Prefetch
            freelancers = freelancers.prefetch_related(
                Prefetch('task_applications',
                        queryset=TaskApplication.objects.filter(status='COMPLETED'))
            )

            scored_freelancers = []

            for freelancer in freelancers:
                score_components = {
                    'category': 0,
                    'location': 0,
                    'quality': 0,
                    'availability': 0,
                    'budget': 0
                }

                # 1. CATEGORY INTELLIGENCE (40 points)
                freelancer_skill_ids = self._get_user_skill_ids(freelancer)

                # Check if freelancer has skills matching client's frequent categories
                if frequent_category_ids:
                    # Get skills associated with client's frequent categories
                    from .skill_model import Skill
                    category_skills = Skill.objects.filter(
                        category__id__in=frequent_category_ids,
                        is_active=True
                    ).values_list('id', flat=True)

                    category_skill_ids = set(category_skills)
                    matching_skills = freelancer_skill_ids & category_skill_ids

                    if matching_skills:
                        # More matching skills = higher score
                        skill_match_ratio = len(matching_skills) / max(len(category_skill_ids), 1)
                        score_components['category'] = min(40, skill_match_ratio * 60)
                        logger.debug(f"  {freelancer.username}: {len(matching_skills)} category skill matches")

                # Also check if freelancer has completed tasks in those categories
                completed_in_categories = TaskApplication.objects.filter(
                    freelancer=freelancer,
                    status='COMPLETED',
                    task__category__id__in=frequent_category_ids
                ).count()

                if completed_in_categories > 0:
                    score_components['category'] += min(10, completed_in_categories * 2)
                    logger.debug(f"  {freelancer.username}: {completed_in_categories} completed tasks in client's categories")

                # 2. LOCATION PROXIMITY (20 points)
                if client.city and freelancer.city:
                    if client.city.lower() == freelancer.city.lower():
                        score_components['location'] = 20
                        logger.debug(f"  {freelancer.username}: Same city ({client.city})")
                    else:
                        score_components['location'] = 5  # Different city
                elif not freelancer.city:
                    # Freelancer location not set - assume flexible/remote
                    score_components['location'] = 15
                else:
                    score_components['location'] = 10  # Some location flexibility

                # 3. QUALITY SCORE (20 points)
                # Rating (max 10 points)
                if freelancer.average_rating:
                    rating_score = (float(freelancer.average_rating) / 5.0) * 10
                    score_components['quality'] += rating_score
                else:
                    score_components['quality'] += 5  # Neutral for new freelancers

                # Completion rate (max 10 points)
                total_applications = TaskApplication.objects.filter(freelancer=freelancer).count()
                completed_applications = TaskApplication.objects.filter(
                    freelancer=freelancer,
                    status='COMPLETED'
                ).count()

                if total_applications > 0:
                    completion_rate = completed_applications / total_applications
                    score_components['quality'] += completion_rate * 10
                    logger.debug(f"  {freelancer.username}: {completion_rate:.0%} completion rate")

                # 4. AVAILABILITY (10 points)
                # Check if freelancer has been active recently
                recent_activity = TaskApplication.objects.filter(
                    freelancer=freelancer,
                    created_at__gte=timezone.now() - timedelta(days=30)
                ).exists()

                if recent_activity:
                    score_components['availability'] = 10
                    logger.debug(f"  {freelancer.username}: Active in last 30 days")
                else:
                    # Check if user logged in recently (if you track this)
                    score_components['availability'] = 5

                # 5. BUDGET COMPATIBILITY (10 points)
                # This is tricky since freelancers don't have set rates in the current schema
                # We'll use completed task budgets as a proxy
                freelancer_avg_budget = TaskApplication.objects.filter(
                    freelancer=freelancer,
                    status='COMPLETED'
                ).aggregate(
                    avg=Avg('task__budget')
                )['avg']

                if freelancer_avg_budget:
                    # Check if freelancer's typical budget range matches client's
                    budget_diff_ratio = abs(freelancer_avg_budget - avg_budget) / avg_budget
                    if budget_diff_ratio < 0.3:  # Within 30%
                        score_components['budget'] = 10
                    elif budget_diff_ratio < 0.6:  # Within 60%
                        score_components['budget'] = 6
                    else:
                        score_components['budget'] = 3
                else:
                    score_components['budget'] = 5  # Neutral for new freelancers

                # Calculate total score
                total_score = sum(score_components.values())

                # Convert to 0-1 range for match percentage (max 100 points possible)
                match_percentage = int(min(100, total_score))

                # Only include freelancers with meaningful match (>15%)
                if match_percentage >= 15:
                    scored_freelancers.append({
                        'freelancer': freelancer,
                        'score': total_score,
                        'match_percentage': match_percentage,
                        'components': score_components
                    })

                    logger.debug(f"  {freelancer.username}: Total {total_score:.1f}/100 = {match_percentage}%")

            # Sort by score
            scored_freelancers.sort(key=lambda x: x['score'], reverse=True)

            # Attach match scores to freelancer objects
            results = []
            for item in scored_freelancers[:limit]:
                freelancer = item['freelancer']
                freelancer.match_score = item['match_percentage']
                freelancer.match_components = item['components']  # For debugging/display
                results.append(freelancer)

            logger.info(f"[FREELANCER DISCOVERY] Recommended {len(results)} freelancers for {client.username}")
            for i, freelancer in enumerate(results[:5]):
                logger.info(f"  #{i+1}: {freelancer.username} - {freelancer.match_score}% match")

            return results

        except Exception as e:
            logger.error(f"Freelancer discovery error: {e}", exc_info=True)
            return []


def get_recommendation_service():
    """Factory function to get recommendation service instance"""
    return StructuredRecommendationService()