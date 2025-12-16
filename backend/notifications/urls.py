from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notifications
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('clear-all/', views.clear_all_notifications, name='clear-all'),

    # Preferences
    path('preferences/', views.NotificationPreferenceView.as_view(), name='preferences'),
]
