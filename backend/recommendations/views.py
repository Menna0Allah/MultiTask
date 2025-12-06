from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from tasks.models import Task
from tasks.serializers import PublicUserSerializer
from accounts.models import User
from .models import UserPreference
from .serializers import UserPreferenceSerializer, RecommendedTaskSerializer
from .services import get_recommendation_service
from django.core.cache import cache
import time

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
        
        # Get recommendations
        recommended_tasks = service.recommend_tasks_for_freelancer(user, limit=limit)
        
        # Log recommendations
        service.log_recommendation(
            user=user,
            recommendation_type='TASK',
            items=list(recommended_tasks)
        )
        
        return recommended_tasks
    
    @extend_schema(
        summary="Get recommended tasks",
        description="Get AI-powered task recommendations based on your profile and history",
        parameters=[
            OpenApiParameter('limit', OpenApiTypes.INT, description='Number of recommendations (max 50)')
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
        description="Update preferences to improve recommendations"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)