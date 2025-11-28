from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    
    # Tasks
    path('', views.TaskListView.as_view(), name='task-list'),
    path('create/', views.TaskCreateView.as_view(), name='task-create'),
    path('my-tasks/', views.MyTasksView.as_view(), name='my-tasks'),
    path('<int:pk>/', views.TaskDetailView.as_view(), name='task-detail'),
    path('<int:pk>/update/', views.TaskUpdateView.as_view(), name='task-update'),
    path('<int:pk>/delete/', views.TaskDeleteView.as_view(), name='task-delete'),
    
    # Task status
    path('<int:task_id>/complete/', views.TaskCompleteView.as_view(), name='task-complete'),
    path('<int:task_id>/cancel/', views.TaskCancelView.as_view(), name='task-cancel'),
    
    # Applications
    path('<int:task_id>/apply/', views.TaskApplicationCreateView.as_view(), name='task-apply'),
    path('<int:task_id>/applications/', views.TaskApplicationListView.as_view(), name='task-applications'),
    path('my-applications/', views.MyApplicationsView.as_view(), name='my-applications'),
    path('applications/<int:application_id>/accept/', views.ApplicationAcceptView.as_view(), name='application-accept'),
    path('applications/<int:application_id>/reject/', views.ApplicationRejectView.as_view(), name='application-reject'),
    
    # Reviews
    path('<int:task_id>/review/', views.ReviewCreateView.as_view(), name='review-create'),
    path('<int:task_id>/reviews/', views.TaskReviewsView.as_view(), name='task-reviews'),
    path('users/<str:username>/reviews/', views.ReviewListView.as_view(), name='user-reviews'),
    
    # Statistics
    path('statistics/', views.task_statistics, name='task-statistics'),
    path('my-statistics/', views.my_task_statistics, name='my-task-statistics'),
]