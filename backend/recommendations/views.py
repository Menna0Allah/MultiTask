from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from tasks.models import Task, Category
from tasks.serializers import PublicUserSerializer, CategorySerializer
from accounts.models import User
from .models import UserPreference
from .skill_model import Skill, UserSkill
from .serializers import (
    UserPreferenceSerializer, RecommendedTaskSerializer, OnboardingSerializer,
    SkillSerializer, UserSkillSerializer, FreelancerDiscoverySerializer
)
from .services import get_recommendation_service
from django.core.cache import cache
from django.db import transaction
import time
import logging

logger = logging.getLogger(__name__)

# ==============================================================================
# TASK RECOMMENDATIONS
# ==============================================================================

class RecommendedTasksView(generics.ListAPIView):
    """
    Get AI-powered task recommendations for current user (freelancer)
    """
    serializer_class = RecommendedTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get recommended tasks using AI"""
        user = self.request.user
        
        # Check if user is freelancer
        if not user.is_freelancer:
            return Task.objects.none()
        
        # Get recommendation service
        service = get_recommendation_service()
        
        # Get limit from query params
        limit = int(self.request.query_params.get('limit', 10))
        limit = min(limit, 50)  # Max 50
        
        # Check if force_refresh is requested
        force_refresh = self.request.query_params.get('force_refresh', 'false').lower() == 'true'
        
        # Get recommendations (will use cache unless force_refresh)
        recommended_tasks = service.recommend_tasks_for_freelancer(
            user, 
            limit=limit,
            use_cache=not force_refresh
        )
        
        # Log recommendations
        service.log_recommendation(
            user=user,
            recommendation_type='TASK',
            items=list(recommended_tasks)
        )
        
        return recommended_tasks
    
    @extend_schema(
        summary="Get recommended tasks",
        description="Get AI-powered task recommendations based on your profile and history. Automatically refreshes when skills change.",
        parameters=[
            OpenApiParameter('limit', OpenApiTypes.INT, description='Number of recommendations (max 50)'),
            OpenApiParameter('force_refresh', OpenApiTypes.BOOL, description='Force refresh recommendations (bypass cache)')
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# ==============================================================================
# FREELANCER RECOMMENDATIONS
# ==============================================================================

class RecommendedFreelancersView(generics.ListAPIView):
    """
    Get AI-powered freelancer recommendations for a specific task
    """
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get recommended freelancers for a task"""
        user = self.request.user
        task_id = self.kwargs.get('task_id')
        
        # Get task
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return User.objects.none()
        
        # Only task owner can get recommendations
        if task.client != user:
            return User.objects.none()
        
        # Get recommendation service
        service = get_recommendation_service()
        
        # Get limit
        limit = int(self.request.query_params.get('limit', 10))
        limit = min(limit, 50)
        
        # Get recommendations
        recommended_freelancers = service.recommend_freelancers_for_task(task, limit=limit)
        
        # Log recommendations
        service.log_recommendation(
            user=user,
            recommendation_type='FREELANCER',
            items=list(recommended_freelancers)
        )
        
        return recommended_freelancers
    
    @extend_schema(
        summary="Get recommended freelancers",
        description="Get AI-powered freelancer recommendations for your task",
        parameters=[
            OpenApiParameter('limit', OpenApiTypes.INT, description='Number of recommendations (max 50)')
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# ==============================================================================
# SERVICE OFFERING RECOMMENDATIONS
# ==============================================================================

@extend_schema(
    summary="Get service offering suggestions",
    description="""
    Get AI-powered suggestions for services YOU could offer based on:
    - Categories you frequently request (you know that market!)
    - Your skills and expertise
    - High-demand services in the platform
    - Services with good earning potential

    This helps you discover new opportunities to earn by offering services.
    """,
    parameters=[
        OpenApiParameter('limit', OpenApiTypes.INT, description='Number of suggestions (default 5, max 10)')
    ],
    responses={200: {
        'type': 'array',
        'items': {
            'type': 'object',
            'properties': {
                'id': {'type': 'integer'},
                'name': {'type': 'string'},
                'slug': {'type': 'string'},
                'description': {'type': 'string'},
                'icon': {'type': 'string'},
                'match_score': {'type': 'integer', 'description': 'Relevance percentage (0-100)'},
                'reasons': {'type': 'array', 'items': {'type': 'string'}},
                'opportunity': {
                    'type': 'object',
                    'properties': {
                        'open_tasks': {'type': 'integer'},
                        'avg_budget': {'type': 'integer'},
                        'potential': {'type': 'string', 'enum': ['High', 'Medium', 'Good']}
                    }
                }
            }
        }
    }}
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_service_offerings(request):
    """
    Get personalized service offering suggestions
    """
    service = get_recommendation_service()

    # Get limit from query params
    limit = int(request.query_params.get('limit', 5))
    limit = min(limit, 10)  # Max 10 suggestions

    # Get service offering recommendations
    offerings = service.recommend_service_offerings(request.user, limit=limit)

    return Response(offerings, status=status.HTTP_200_OK)


# ==============================================================================
# FREELANCER DISCOVERY FOR CLIENTS
# ==============================================================================

@extend_schema(
    summary="Discover freelancers (for clients)",
    description="""
    Get AI-powered freelancer recommendations for clients.

    Uses professional multi-factor matching:
    - Category Intelligence (40%): Freelancers in categories you frequently post
    - Location Proximity (20%): Same city or remote-capable providers
    - Quality Score (20%): Ratings, completion rate, experience
    - Availability (10%): Recently active, responsive providers
    - Budget Compatibility (10%): Rate ranges matching your budget

    Perfect for discovering trusted professionals to hire.
    """,
    parameters=[
        OpenApiParameter('limit', OpenApiTypes.INT, description='Number of recommendations (default 10, max 50)')
    ],
    responses={200: PublicUserSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def discover_freelancers(request):
    """
    Discover freelancers for clients to hire

    Returns freelancers with match_score attribute based on:
    - Client's posting history
    - Location preferences
    - Budget compatibility
    - Freelancer quality and availability
    """
    service = get_recommendation_service()

    # Get limit from query params
    limit = int(request.query_params.get('limit', 10))
    limit = min(limit, 50)  # Max 50

    # Get freelancer recommendations
    freelancers = service.recommend_freelancers_for_client(request.user, limit=limit)

    # Serialize freelancers with enhanced fields
    serializer = FreelancerDiscoverySerializer(freelancers, many=True)

    # Log recommendations
    service.log_recommendation(
        user=request.user,
        recommendation_type='FREELANCER_DISCOVERY',
        items=freelancers
    )

    return Response(serializer.data, status=status.HTTP_200_OK)


# ==============================================================================
# USER PREFERENCES
# ==============================================================================

class UserPreferenceView(generics.RetrieveUpdateAPIView):
    """
    Get or update user preferences for better recommendations
    """
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Get or create user preference"""
        obj, created = UserPreference.objects.get_or_create(user=self.request.user)
        return obj
    
    @extend_schema(
        summary="Get user preferences",
        description="Get recommendation preferences"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
    
    @extend_schema(
        summary="Update user preferences",
        description="Update preferences to improve recommendations. Cache will auto-refresh."
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


# ==============================================================================
# ONBOARDING
# ==============================================================================

@extend_schema(
    summary="Complete onboarding survey",
    description="Submit onboarding preferences (interests + skills) to get personalized recommendations",
    request=OnboardingSerializer,
    responses={200: UserPreferenceSerializer}
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_onboarding(request):
    """
    Complete onboarding survey and save user preferences + skills
    Automatically clears recommendation cache
    """
    # Debug logging
    import logging
    logger_debug = logging.getLogger(__name__)
    logger_debug.info(f"Onboarding request data: {request.data}")

    serializer = OnboardingSerializer(data=request.data)

    if not serializer.is_valid():
        logger_debug.error(f"Onboarding validation errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Use transaction to ensure atomic operation
    with transaction.atomic():
        # Get or create user preferences
        prefs, created = UserPreference.objects.get_or_create(user=request.user)

        # Update preferences from onboarding
        prefs.interests = serializer.validated_data.get('interests')
        prefs.preferred_task_types = serializer.validated_data.get('preferred_task_types', [])
        prefs.prefer_remote = serializer.validated_data.get('prefer_remote', False)
        prefs.preferred_location = serializer.validated_data.get('preferred_location') or request.user.city
        prefs.min_budget = serializer.validated_data.get('min_budget')
        prefs.max_budget = serializer.validated_data.get('max_budget')

        # Mark onboarding as completed
        prefs.onboarding_completed = True
        from django.utils import timezone
        prefs.onboarding_completed_at = timezone.now()

        prefs.save()

        # Handle skills - Clear existing and add new
        skill_ids = serializer.validated_data.get('skills', [])

        # Remove existing user skills (signals will auto-clear cache)
        UserSkill.objects.filter(user=request.user).delete()

        # Add new skills
        skills_to_create = []
        for skill_id in skill_ids:
            try:
                skill = Skill.objects.get(id=skill_id, is_active=True)
                skills_to_create.append(UserSkill(
                    user=request.user,
                    skill=skill,
                    proficiency='intermediate'  # Default proficiency
                ))

                # Update skill usage count
                skill.usage_count += 1
                skill.save(update_fields=['usage_count'])

            except Skill.DoesNotExist:
                continue

        # Bulk create user skills (signals will fire and clear cache)
        if skills_to_create:
            UserSkill.objects.bulk_create(skills_to_create)

        # Update user's skills field (comma-separated for backward compatibility)
        skill_names = [skill.skill.name for skill in skills_to_create]
        request.user.skills = ', '.join(skill_names)
        request.user.save(update_fields=['skills'])

    logger.info(f"✓ Onboarding completed for {request.user.username}, cache auto-cleared")

    # Return updated preferences
    result_serializer = UserPreferenceSerializer(prefs)
    return Response({
        'message': 'Onboarding completed successfully! Recommendations will refresh automatically.',
        'preferences': result_serializer.data
    }, status=status.HTTP_200_OK)


@extend_schema(
    summary="Check onboarding status",
    description="Check if user has completed onboarding",
    responses={200: {'type': 'object', 'properties': {
        'completed': {'type': 'boolean'},
        'completed_at': {'type': 'string', 'format': 'date-time'}
    }}}
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def onboarding_status(request):
    """
    Check if user has completed onboarding
    """
    try:
        prefs = UserPreference.objects.get(user=request.user)
        return Response({
            'completed': prefs.onboarding_completed,
            'completed_at': prefs.onboarding_completed_at
        })
    except UserPreference.DoesNotExist:
        return Response({
            'completed': False,
            'completed_at': None
        })


# ==============================================================================
# SKILLS API
# ==============================================================================

@extend_schema(
    summary="Get all available skills",
    description="Get list of all skills users can select during onboarding",
    parameters=[
        OpenApiParameter('category', OpenApiTypes.STR, description='Filter by skill category'),
        OpenApiParameter('search', OpenApiTypes.STR, description='Search skills by name')
    ]
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_skills(request):
    """
    Get all available skills, optionally filtered by category
    """
    queryset = Skill.objects.filter(is_active=True)

    # Filter by category
    category = request.query_params.get('category')
    if category:
        queryset = queryset.filter(category=category)

    # Search by name
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(name__icontains=search)

    # Order by usage count and name
    queryset = queryset.order_by('-usage_count', 'name')

    serializer = SkillSerializer(queryset, many=True)
    return Response(serializer.data)


@extend_schema(
    summary="Get all categories",
    description="Get list of all task categories for onboarding",
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_categories(request):
    """
    Get all active categories for onboarding
    """
    categories = Category.objects.filter(is_active=True).order_by('order', 'name')
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)


@extend_schema(
    summary="Get user's skills",
    description="Get current user's skills with proficiency levels"
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_skills(request):
    """
    Get user's current skills
    """
    user_skills = UserSkill.objects.filter(user=request.user).select_related('skill')
    serializer = UserSkillSerializer(user_skills, many=True)
    return Response(serializer.data)


@extend_schema(
    summary="Update user's skills",
    description="Update user's skills by providing skill IDs. Recommendations will automatically refresh.",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'skill_ids': {
                    'type': 'array',
                    'items': {'type': 'integer'},
                    'description': 'Array of Skill IDs to assign to user'
                }
            },
            'required': ['skill_ids']
        }
    },
    responses={200: UserSkillSerializer(many=True)}
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_user_skills(request):
    """
    Update user's skills using structured Skill IDs
    
    Automatically clears recommendation cache via signals

    Professional approach: Client sends skill IDs, not text
    """
    logger.info(f"Skill update request from {request.user.username}")
    logger.info(f"Request data: {request.data}")

    skill_ids = request.data.get('skill_ids', [])

    if not isinstance(skill_ids, list):
        logger.error(f"skill_ids is not a list: {type(skill_ids)}")
        return Response(
            {'error': 'skill_ids must be an array'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Filter out None/null values and convert to integers
    try:
        skill_ids = [int(id) for id in skill_ids if id is not None]
    except (ValueError, TypeError) as e:
        logger.error(f"Invalid skill ID format: {e}")
        return Response(
            {'error': 'All skill IDs must be valid integers'},
            status=status.HTTP_400_BAD_REQUEST
        )

    logger.info(f"Validating skill IDs: {skill_ids}")

    # Validate that all skill IDs exist and are active
    valid_skills = Skill.objects.filter(id__in=skill_ids, is_active=True)
    valid_skill_ids = set(valid_skills.values_list('id', flat=True))

    logger.info(f"Valid skill IDs found: {valid_skill_ids}")

    invalid_ids = set(skill_ids) - valid_skill_ids
    if invalid_ids:
        logger.error(f"Invalid skill IDs: {invalid_ids}")
        return Response(
            {'error': f'Invalid skill IDs: {list(invalid_ids)}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Use transaction for atomicity
    with transaction.atomic():
        # Clear existing skills (signals will auto-clear cache)
        UserSkill.objects.filter(user=request.user).delete()
        logger.info(f"Deleted old skills for {request.user.username}")

        # Create new skill associations
        user_skills_to_create = [
            UserSkill(
                user=request.user,
                skill_id=skill_id,
                proficiency='intermediate'  # Default
            )
            for skill_id in skill_ids
        ]

        # Bulk create will trigger signals for each skill
        UserSkill.objects.bulk_create(user_skills_to_create)
        logger.info(f"Created {len(user_skills_to_create)} new skills")

        # Update user's text skills field for backward compatibility
        skill_names = [skill.name for skill in valid_skills]
        request.user.skills = ', '.join(skill_names)
        request.user.save(update_fields=['skills'])

        logger.info(f"✓ Updated skills for {request.user.username}: {skill_names}")
        logger.info(f"✓ Cache auto-cleared by signals")

    # Return updated skills
    user_skills = UserSkill.objects.filter(user=request.user).select_related('skill')
    serializer = UserSkillSerializer(user_skills, many=True)

    return Response({
        'message': 'Skills updated successfully! Recommendations will refresh automatically.',
        'skills': serializer.data
    }, status=status.HTTP_200_OK)