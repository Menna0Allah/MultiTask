from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['id', 'recipient', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['recipient__username', 'title', 'message']
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    list_per_page = 25

    fieldsets = (
        ('Basic Information', {
            'fields': ('recipient', 'notification_type', 'title', 'message')
        }),
        ('Related Objects', {
            'fields': ('task_id', 'application_id', 'message_id', 'sender_id', 'link')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_task_applications', 'push_task_applications', 'created_at']
    search_fields = ['user__username', 'user__email']
    list_per_page = 25
