from django.urls import path
from . import views

urlpatterns = [
    # Task recommendations (for freelancers)
    path('tasks/', views.RecommendedTasksView.as_view(), name='recommended-tasks'),

    # Service offering suggestions (for all users)
    path('service-offerings/', views.get_service_offerings, name='service-offerings'),

    # Freelancer discovery (for clients) - NEW ENDPOINT
    path('freelancers/', views.discover_freelancers, name='discover-freelancers'),

    # Freelancer recommendations (for task owners)
    path('freelancers/<int:task_id>/', views.RecommendedFreelancersView.as_view(), name='recommended-freelancers'),

    # User preferences
    path('preferences/', views.UserPreferenceView.as_view(), name='user-preferences'),

    # Onboarding
    path('onboarding/', views.complete_onboarding, name='complete-onboarding'),
    path('onboarding/status/', views.onboarding_status, name='onboarding-status'),

    # Skills API
    path('skills/', views.get_skills, name='get-skills'),
    path('skills/my/', views.get_user_skills, name='get-user-skills'),
    path('skills/update/', views.update_user_skills, name='update-user-skills'),

    # Categories for onboarding
    path('categories/', views.get_categories, name='get-categories'),
]