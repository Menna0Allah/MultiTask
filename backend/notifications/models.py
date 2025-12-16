from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Notification(models.Model):
    """
    Notification model for user notifications
    """

    NOTIFICATION_TYPES = [
        ('task_application', 'Task Application'),
        ('application_accepted', 'Application Accepted'),
        ('application_rejected', 'Application Rejected'),
        ('task_completed', 'Task Completed'),
        ('task_cancelled', 'Task Cancelled'),
        ('new_message', 'New Message'),
        ('task_reminder', 'Task Reminder'),
        ('payment_received', 'Payment Received'),
        ('review_received', 'Review Received'),
        ('task_update', 'Task Update'),
        ('system', 'System Notification'),
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )

    title = models.CharField(max_length=255)
    message = models.TextField()

    # Optional related objects
    task_id = models.IntegerField(null=True, blank=True)
    application_id = models.IntegerField(null=True, blank=True)
    message_id = models.IntegerField(null=True, blank=True)
    sender_id = models.IntegerField(null=True, blank=True)

    # Link to navigate when clicked
    link = models.CharField(max_length=500, null=True, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
        ]

    def __str__(self):
        return f"{self.notification_type} for {self.recipient.username}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])

    @classmethod
    def create_notification(cls, recipient, notification_type, title, message,
                          task_id=None, application_id=None, message_id=None,
                          sender_id=None, link=None):
        """Helper method to create notifications"""
        return cls.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            task_id=task_id,
            application_id=application_id,
            message_id=message_id,
            sender_id=sender_id,
            link=link
        )


class NotificationPreference(models.Model):
    """
    User notification preferences
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='notification_preferences'
    )

    # Email notifications
    email_task_applications = models.BooleanField(default=True)
    email_task_updates = models.BooleanField(default=True)
    email_messages = models.BooleanField(default=True)
    email_task_reminders = models.BooleanField(default=True)
    email_marketing = models.BooleanField(default=False)

    # Push/In-app notifications
    push_task_applications = models.BooleanField(default=True)
    push_task_updates = models.BooleanField(default=True)
    push_messages = models.BooleanField(default=True)
    push_task_reminders = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Notification Preferences'

    def __str__(self):
        return f"Preferences for {self.user.username}"
