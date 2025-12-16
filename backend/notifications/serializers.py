from rest_framework import serializers
from .models import Notification, NotificationPreference
from accounts.models import User


class NotificationSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message',
            'task_id', 'application_id', 'message_id', 'sender_id', 'sender',
            'link', 'is_read', 'read_at', 'created_at', 'time_ago'
        ]
        read_only_fields = ['id', 'created_at', 'read_at', 'sender', 'time_ago']

    def get_sender(self, obj):
        if obj.sender_id:
            try:
                user = User.objects.get(id=obj.sender_id)
                return {
                    'id': user.id,
                    'username': user.username,
                    'profile_picture': user.profile_picture.url if user.profile_picture else None
                }
            except User.DoesNotExist:
                return None
        return None

    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta

        now = timezone.now()
        diff = now - obj.created_at

        if diff < timedelta(minutes=1):
            return 'Just now'
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f'{minutes} min ago' if minutes == 1 else f'{minutes} mins ago'
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f'{hours} hour ago' if hours == 1 else f'{hours} hours ago'
        elif diff < timedelta(days=7):
            days = diff.days
            return f'{days} day ago' if days == 1 else f'{days} days ago'
        elif diff < timedelta(days=30):
            weeks = diff.days // 7
            return f'{weeks} week ago' if weeks == 1 else f'{weeks} weeks ago'
        else:
            return obj.created_at.strftime('%b %d, %Y')


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_task_applications', 'email_task_updates', 'email_messages',
            'email_task_reminders', 'email_marketing',
            'push_task_applications', 'push_task_updates', 'push_messages',
            'push_task_reminders'
        ]
