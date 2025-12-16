from django.db.models.signals import post_save
from django.dispatch import receiver
from tasks.models import TaskApplication
from messaging.models import Message
from .models import Notification
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


@receiver(post_save, sender=TaskApplication)
def create_application_notification(sender, instance, created, **kwargs):
    """Create notification when someone applies to a task"""
    if created:
        task = instance.task
        client = task.client

        notification = Notification.create_notification(
            recipient=client,
            notification_type='task_application',
            title='New Task Application',
            message=f'{instance.freelancer.username} applied to your task "{task.title}"',
            task_id=task.id,
            application_id=instance.id,
            sender_id=instance.freelancer.id,
            link=f'/tasks/{task.id}'
        )

        # Send via WebSocket
        send_notification_via_websocket(client.id, notification)

    # Notify freelancer when application status changes
    elif instance.status in ['ACCEPTED', 'REJECTED']:
        notification_type = 'application_accepted' if instance.status == 'ACCEPTED' else 'application_rejected'
        title = 'Application Accepted!' if instance.status == 'ACCEPTED' else 'Application Update'
        message = f'Your application for "{instance.task.title}" has been {instance.status.lower()}'

        notification = Notification.create_notification(
            recipient=instance.freelancer,
            notification_type=notification_type,
            title=title,
            message=message,
            task_id=instance.task.id,
            application_id=instance.id,
            sender_id=instance.task.client.id,
            link=f'/tasks/{instance.task.id}'
        )

        # Send via WebSocket
        send_notification_via_websocket(instance.freelancer.id, notification)


@receiver(post_save, sender=Message)
def create_message_notification(sender, instance, created, **kwargs):
    """Create notification for new messages"""
    if created:
        # Get the other participant in the conversation
        participants = instance.conversation.participants.exclude(id=instance.sender.id)

        for recipient in participants:
            notification = Notification.create_notification(
                recipient=recipient,
                notification_type='new_message',
                title='New Message',
                message=f'{instance.sender.username} sent you a message',
                message_id=instance.id,
                sender_id=instance.sender.id,
                link=f'/messages?conversation={instance.conversation.id}'
            )

            # Send via WebSocket
            send_notification_via_websocket(recipient.id, notification)


def send_notification_via_websocket(user_id, notification):
    """Send notification to user via WebSocket"""
    from .serializers import NotificationSerializer

    channel_layer = get_channel_layer()
    serializer = NotificationSerializer(notification)

    try:
        async_to_sync(channel_layer.group_send)(
            f'notifications_{user_id}',
            {
                'type': 'send_notification',
                'notification': serializer.data
            }
        )
    except Exception as e:
        print(f"Error sending notification via WebSocket: {e}")
