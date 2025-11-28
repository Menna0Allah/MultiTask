from django.urls import path
from . import views

urlpatterns = [
    # Task recommendations (for freelancers)
    path('tasks/', views.RecommendedTasksView.as_view(), name='recommended-tasks'),
    
    # Freelancer recommendations (for task owners)
    path('freelancers/<int:task_id>/', views.RecommendedFreelancersView.as_view(), name='recommended-freelancers'),
    
    # User preferences
    path('preferences/', views.UserPreferenceView.as_view(), name='user-preferences'),
]