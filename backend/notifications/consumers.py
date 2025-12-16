from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    """

    async def connect(self):
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
            return

        # Create a group for this user's notifications
        self.group_name = f'notifications_{self.user.id}'

        # Join notification group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

        # Send initial unread count
        unread_count = await self.get_unread_count()
        await self.send_json({
            'type': 'unread_count',
            'count': unread_count
        })

    async def disconnect(self, close_code):
        # Leave notification group
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive_json(self, content):
        """
        Handle incoming messages from WebSocket
        """
        message_type = content.get('type')

        if message_type == 'mark_read':
            notification_id = content.get('notification_id')
            await self.mark_notification_read(notification_id)
        elif message_type == 'get_unread_count':
            unread_count = await self.get_unread_count()
            await self.send_json({
                'type': 'unread_count',
                'count': unread_count
            })

    async def send_notification(self, event):
        """
        Send notification to WebSocket
        """
        notification = event['notification']
        await self.send_json({
            'type': 'new_notification',
            'notification': notification
        })

        # Also send updated unread count
        unread_count = await self.get_unread_count()
        await self.send_json({
            'type': 'unread_count',
            'count': unread_count
        })

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Notification
        return Notification.objects.filter(
            recipient=self.user,
            is_read=False
        ).count()

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        from .models import Notification
        try:
            notification = Notification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.mark_as_read()
            return True
        except Notification.DoesNotExist:
            return False
