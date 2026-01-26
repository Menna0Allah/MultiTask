from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import Category, Task, TaskApplication, Review, SavedTask
from .serializers import (
    CategorySerializer,
    TaskListSerializer,
    TaskDetailSerializer,
    TaskCreateUpdateSerializer,
    TaskApplicationSerializer,
    ReviewSerializer,
    SavedTaskSerializer
)


# ==============================================================================
# CATEGORY VIEWS
# ==============================================================================

class CategoryListView(generics.ListAPIView):
    """
    List all active categories
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Disable pagination - return all categories

    @extend_schema(
        summary="List categories",
        description="Get list of all active task categories"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# ==============================================================================
# TASK VIEWS
# ==============================================================================

class TaskListView(generics.ListAPIView):
    """
    List all tasks with filters and search
    """
    serializer_class = TaskListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'task_type', 'category', 'city', 'is_remote']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'budget', 'deadline', 'applications_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get tasks with optional filters"""
        queryset = Task.objects.select_related('client', 'category').prefetch_related('required_skills').all()

        # Filter by budget range
        min_budget = self.request.query_params.get('min_budget')
        max_budget = self.request.query_params.get('max_budget')

        if min_budget:
            queryset = queryset.filter(budget__gte=min_budget)
        if max_budget:
            queryset = queryset.filter(budget__lte=max_budget)

        # Filter by required skills
        skills = self.request.query_params.getlist('skills[]')
        if skills:
            # Filter tasks that require ANY of the selected skills
            # Using distinct() to avoid duplicate results
            queryset = queryset.filter(required_skills__id__in=skills).distinct()

        return queryset
    
    @extend_schema(
        summary="List tasks",
        description="Get list of tasks with filters, search, and sorting",
        parameters=[
            OpenApiParameter('status', OpenApiTypes.STR, description='Filter by status (OPEN, IN_PROGRESS, etc)'),
            OpenApiParameter('task_type', OpenApiTypes.STR, description='Filter by type (PHYSICAL, DIGITAL, BOTH)'),
            OpenApiParameter('category', OpenApiTypes.INT, description='Filter by category ID'),
            OpenApiParameter('city', OpenApiTypes.STR, description='Filter by city'),
            OpenApiParameter('is_remote', OpenApiTypes.BOOL, description='Filter remote tasks'),
            OpenApiParameter('min_budget', OpenApiTypes.FLOAT, description='Minimum budget'),
            OpenApiParameter('max_budget', OpenApiTypes.FLOAT, description='Maximum budget'),
            OpenApiParameter('skills[]', OpenApiTypes.INT, description='Filter by skill IDs (can pass multiple)', many=True),
            OpenApiParameter('search', OpenApiTypes.STR, description='Search in title/description'),
            OpenApiParameter('ordering', OpenApiTypes.STR, description='Sort by field (created_at, budget, deadline)'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TaskDetailView(generics.RetrieveAPIView):
    """
    Get task details by ID
    """
    queryset = Task.objects.select_related('client', 'category', 'assigned_to').prefetch_related('images')
    serializer_class = TaskDetailSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        """Get task and increment view count"""
        instance = self.get_object()
        
        # Increment view count (only if not the client)
        if not request.user.is_authenticated or request.user != instance.client:
            instance.views_count += 1
            instance.save(update_fields=['views_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get task details",
        description="Retrieve detailed information about a specific task"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TaskCreateView(generics.CreateAPIView):
    """
    Create a new task (clients only)
    """
    serializer_class = TaskCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create task and set client"""
        # Check if user can post tasks
        if not self.request.user.is_client:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only clients can post tasks')
        
        serializer.save()
    
    @extend_schema(
        summary="Create task",
        description="Create a new task (client only)"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class TaskUpdateView(generics.UpdateAPIView):
    """
    Update task (owner only)
    """
    serializer_class = TaskCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow updating own tasks"""
        return Task.objects.filter(client=self.request.user)
    
    @extend_schema(
        summary="Update task",
        description="Update task details (owner only)"
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)


class TaskDeleteView(generics.DestroyAPIView):
    """
    Delete task (owner only)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only allow deleting own tasks"""
        return Task.objects.filter(client=self.request.user)
    
    @extend_schema(
        summary="Delete task",
        description="Delete a task (owner only)"
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)


class MyTasksView(generics.ListAPIView):
    """
    Get current user's posted tasks
    """
    serializer_class = TaskListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'status', 'budget']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get tasks posted by current user"""
        return Task.objects.filter(client=self.request.user).select_related('category')
    
    @extend_schema(
        summary="My posted tasks",
        description="Get list of tasks posted by current user"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# ==============================================================================
# TASK APPLICATION VIEWS
# ==============================================================================

class TaskApplicationCreateView(generics.CreateAPIView):
    """
    Apply to a task (freelancers only)
    """
    serializer_class = TaskApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create application and validate"""
        task = get_object_or_404(Task, id=self.kwargs['task_id'])
        user = self.request.user
        
        # Validation
        if not user.is_freelancer:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only freelancers can apply to tasks')
        
        if task.client == user:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You cannot apply to your own task')
        
        if task.status != 'OPEN':
            from rest_framework.exceptions import ValidationError
            raise ValidationError('This task is not open for applications')
        
        # Check if already applied
        if TaskApplication.objects.filter(task=task, freelancer=user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You have already applied to this task')
        
        # Save application
        application = serializer.save(task=task)
        
        # Update task applications count
        task.applications_count = task.applications.count()
        task.save(update_fields=['applications_count'])
    
    @extend_schema(
        summary="Apply to task",
        description="Submit application to a task (freelancer only)"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class TaskApplicationListView(generics.ListAPIView):
    """
    List applications for a task (task owner only)
    """
    serializer_class = TaskApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get applications for the task"""
        task = get_object_or_404(Task, id=self.kwargs['task_id'])
        
        # Only task owner can see applications
        if task.client != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only view applications for your own tasks')
        
        return TaskApplication.objects.filter(task=task).select_related('freelancer')
    
    @extend_schema(
        summary="List task applications",
        description="Get all applications for a specific task (owner only)"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class MyApplicationsView(generics.ListAPIView):
    """
    Get current user's applications
    """
    serializer_class = TaskApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['created_at', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get applications by current user"""
        return TaskApplication.objects.filter(
            freelancer=self.request.user
        ).select_related('task', 'task__client')
    
    @extend_schema(
        summary="My applications",
        description="Get list of applications submitted by current user"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ApplicationAcceptView(APIView):
    """
    Accept a task application (task owner only)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Accept application",
        description="Accept a freelancer's application (task owner only)"
    )
    def post(self, request, application_id):
        application = get_object_or_404(TaskApplication, id=application_id)
        task = application.task
        
        # Only task owner can accept
        if task.client != request.user:
            return Response({
                'error': 'Only the task owner can accept applications'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Task must be open
        if task.status != 'OPEN':
            return Response({
                'error': 'This task is not open'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Accept application
        application.status = 'ACCEPTED'
        application.save()

        # Update task - ALWAYS assign and move to IN_PROGRESS
        task.status = 'IN_PROGRESS'
        task.assigned_to = application.freelancer
        task.save()

        # Reject other applications
        TaskApplication.objects.filter(
            task=task
        ).exclude(id=application_id).update(status='REJECTED')

        return Response({
            'message': 'Application accepted successfully',
            'application': TaskApplicationSerializer(application).data
        })


class ApplicationRejectView(APIView):
    """
    Reject a task application (task owner only)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Reject application",
        description="Reject a freelancer's application (task owner only)"
    )
    def post(self, request, application_id):
        application = get_object_or_404(TaskApplication, id=application_id)
        task = application.task
        # Only task owner can reject
        if task.client != request.user:
            return Response({
                'error': 'Only the task owner can reject applications'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Reject application
        application.status = 'REJECTED'
        application.save()
        
        return Response({
            'message': 'Application rejected successfully',
            'application': TaskApplicationSerializer(application).data
        })


# ==============================================================================
# REVIEW VIEWS
# ==============================================================================

class ReviewCreateView(generics.CreateAPIView):
    """
    Create a review for a completed task
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create review and validate"""
        task = get_object_or_404(Task, id=self.kwargs['task_id'])
        user = self.request.user
        
        # Task must be completed
        if task.status != 'COMPLETED':
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You can only review completed tasks')
        
        # User must be part of the task (client or assigned freelancer)
        if user not in [task.client, task.assigned_to]:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You can only review tasks you were involved in')
        
        # Determine reviewee
        reviewee = task.assigned_to if user == task.client else task.client
        
        # Check if already reviewed
        if Review.objects.filter(task=task, reviewer=user).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You have already reviewed this task')
        
        # Save review
        review = serializer.save(
            task=task,
            reviewer=user,
            reviewee=reviewee,
            is_verified=True  # Mark as verified since task is completed
        )
        
        # Update reviewee's average rating
        self._update_user_rating(reviewee)
    
    def _update_user_rating(self, user):
        """Update user's average rating and review count"""
        reviews = Review.objects.filter(reviewee=user, is_public=True)
        avg_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
        
        user.average_rating = round(avg_rating, 2)
        user.total_reviews = reviews.count()
        user.save(update_fields=['average_rating', 'total_reviews'])
    
    @extend_schema(
        summary="Create review",
        description="Create a review for a completed task"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class ReviewListView(generics.ListAPIView):
    """
    List reviews for a user
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Get public reviews for a user"""
        username = self.kwargs['username']
        from accounts.models import User
        user = get_object_or_404(User, username=username)
        
        return Review.objects.filter(
            reviewee=user,
            is_public=True
        ).select_related('reviewer', 'task')
    
    @extend_schema(
        summary="List user reviews",
        description="Get all public reviews for a specific user"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class TaskReviewsView(generics.ListAPIView):
    """
    List reviews for a specific task
    """
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        """Get reviews for a task"""
        task_id = self.kwargs['task_id']
        return Review.objects.filter(
            task_id=task_id,
            is_public=True
        ).select_related('reviewer', 'reviewee')
    
    @extend_schema(
        summary="List task reviews",
        description="Get all reviews for a specific task"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# ==============================================================================
# TASK STATUS VIEWS
# ==============================================================================

class TaskCompleteView(APIView):
    """
    Mark task as completed (client only)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Complete task",
        description="Mark a task as completed (client only)"
    )
    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        
        # Only task owner can complete
        if task.client != request.user:
            return Response({
                'error': 'Only the task owner can mark it as completed'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Task must be in progress
        if task.status != 'IN_PROGRESS':
            return Response({
                'error': 'Only in-progress tasks can be completed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as completed
        from django.utils import timezone
        task.status = 'COMPLETED'
        task.completed_at = timezone.now()
        task.save()
        
        return Response({
            'message': 'Task marked as completed',
            'task': TaskDetailSerializer(task, context={'request': request}).data
        })


class TaskCancelView(APIView):
    """
    Cancel a task (client only)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Cancel task",
        description="Cancel a task (client only)"
    )
    def post(self, request, task_id):
        task = get_object_or_404(Task, id=task_id)
        
        # Only task owner can cancel
        if task.client != request.user:
            return Response({
                'error': 'Only the task owner can cancel the task'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Can only cancel open or in-progress tasks
        if task.status not in ['OPEN', 'IN_PROGRESS']:
            return Response({
                'error': 'Cannot cancel completed or already cancelled tasks'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cancel task
        task.status = 'CANCELLED'
        task.save()
        
        # Update all pending applications to withdrawn
        TaskApplication.objects.filter(
            task=task,
            status='PENDING'
        ).update(status='WITHDRAWN')
        
        return Response({
            'message': 'Task cancelled successfully',
            'task': TaskDetailSerializer(task, context={'request': request}).data
        })


# ==============================================================================
# STATISTICS VIEWS
# ==============================================================================

@extend_schema(
    summary="Task statistics",
    description="Get platform-wide task statistics"
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def task_statistics(request):
    """Get task statistics"""
    stats = {
        'total_tasks': Task.objects.count(),
        'open_tasks': Task.objects.filter(status='OPEN').count(),
        'in_progress_tasks': Task.objects.filter(status='IN_PROGRESS').count(),
        'completed_tasks': Task.objects.filter(status='COMPLETED').count(),
        'total_applications': TaskApplication.objects.count(),
        'categories_count': Category.objects.filter(is_active=True).count(),
        'average_budget': Task.objects.aggregate(Avg('budget'))['budget__avg'] or 0,
    }
    
    return Response(stats)


@extend_schema(
    summary="User task statistics",
    description="Get task statistics for current user"
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_task_statistics(request):
    """Get current user's task statistics"""
    user = request.user

    stats = {
        'posted_tasks': user.posted_tasks.count(),
        'open_tasks': user.posted_tasks.filter(status='OPEN').count(),
        'in_progress_tasks': user.posted_tasks.filter(status='IN_PROGRESS').count(),
        'completed_tasks': user.posted_tasks.filter(status='COMPLETED').count(),
        'applications_sent': user.task_applications.count(),
        'applications_accepted': user.task_applications.filter(status='ACCEPTED').count(),
        'applications_pending': user.task_applications.filter(status='PENDING').count(),
        'tasks_completed_as_freelancer': user.assigned_tasks.filter(status='COMPLETED').count(),
    }

    return Response(stats)


# ==============================================================================
# SAVED TASKS VIEWS
# ==============================================================================

class SavedTaskListCreateView(generics.ListCreateAPIView):
    """
    List user's saved tasks or save a new task
    """
    serializer_class = SavedTaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedTask.objects.filter(
            user=self.request.user
        ).select_related('task', 'task__client', 'task__category')

    @extend_schema(
        summary="List saved tasks",
        description="Get all tasks saved by the current user"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Save a task",
        description="Save/bookmark a task for later"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class SavedTaskDeleteView(APIView):
    """
    Unsave/remove a saved task
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Unsave task",
        description="Remove a task from saved tasks"
    )
    def delete(self, request, task_id):
        saved_task = SavedTask.objects.filter(
            user=request.user,
            task_id=task_id
        ).first()

        if not saved_task:
            return Response({
                'error': 'Task is not in your saved list'
            }, status=status.HTTP_404_NOT_FOUND)

        saved_task.delete()

        return Response({
            'message': 'Task removed from saved list'
        }, status=status.HTTP_200_OK)


@extend_schema(
    summary="Check if task is saved",
    description="Check if a specific task is saved by the current user"
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_task_saved(request, task_id):
    """Check if a task is saved by the current user"""
    is_saved = SavedTask.objects.filter(
        user=request.user,
        task_id=task_id
    ).exists()

    return Response({
        'is_saved': is_saved
    })


@extend_schema(
    summary="Toggle task saved status",
    description="Save or unsave a task (toggle)"
)
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_task_saved(request, task_id):
    """Toggle saved status of a task"""
    task = get_object_or_404(Task, id=task_id)

    saved_task = SavedTask.objects.filter(
        user=request.user,
        task=task
    ).first()

    if saved_task:
        # Unsave
        saved_task.delete()
        return Response({
            'is_saved': False,
            'message': 'Task removed from saved list'
        })
    else:
        # Save
        note = request.data.get('note', '')
        SavedTask.objects.create(
            user=request.user,
            task=task,
            note=note
        )
        return Response({
            'is_saved': True,
            'message': 'Task saved successfully'
        }, status=status.HTTP_201_CREATED)