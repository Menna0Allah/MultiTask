from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
import json

User = get_user_model()

class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for real-time chat
    """
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        
        # Reject if not authenticated
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Get conversation ID from URL
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Verify user is participant
        is_participant = await self.check_participant()
        if not is_participant:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Accept connection
        await self.accept()
        
        # Send connection success message
        await self.send_json({
            'type': 'connection_established',
            'message': 'Connected to chat'
        })
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    
    async def receive_json(self, content):
        """
        Receive message from WebSocket
        """
        message_type = content.get('type', 'chat_message')
        
        if message_type == 'chat_message':
            message_text = content.get('message', '')
            
            if not message_text.strip():
                await self.send_json({
                    'type': 'error',
                    'message': 'Message cannot be empty'
                })
                return
            
            # Save message to database
            message_data = await self.save_message(message_text)
            
            if message_data:
                # Broadcast to room group
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': message_data
                    }
                )
        
        elif message_type == 'typing':
            # Broadcast typing indicator
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user_id': self.user.id,
                    'username': self.user.username,
                    'is_typing': content.get('is_typing', False)
                }
            )
        
        elif message_type == 'mark_read':
            # Mark messages as read
            await self.mark_messages_read()
    
    async def chat_message(self, event):
        """Send message to WebSocket"""
        message = event['message']

        # Send to all participants (including sender for confirmation)
        await self.send_json({
            'type': 'chat_message',
            'message': message
        })
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        # Don't send typing indicator to the typer themselves
        if event['user_id'] != self.user.id:
            await self.send_json({
                'type': 'typing',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing']
            })
    
    @database_sync_to_async
    def check_participant(self):
        """Check if user is participant in conversation"""
        from .models import Conversation
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.participants.filter(id=self.user.id).exists()
        except Conversation.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_message(self, message_text):
        """Save message to database"""
        from .models import Conversation, Message
        from django.utils import timezone
        
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=message_text,
                message_type='TEXT'
            )
            
            # Update conversation
            conversation.last_message_content = message_text[:200]
            conversation.last_message_sender = self.user
            conversation.last_message_at = timezone.now()
            conversation.save()
            
            # Return message data with full sender object
            return {
                'id': message.id,
                'conversation': conversation.id,
                'sender': {
                    'id': self.user.id,
                    'username': self.user.username,
                    'email': self.user.email,
                    'profile_picture': self.user.profile_picture.url if self.user.profile_picture else None,
                    'user_type': self.user.user_type
                },
                'content': message.content,
                'message_type': message.message_type,
                'created_at': message.created_at.isoformat(),
                'is_read': message.is_read
            }
        except Exception as e:
            print(f"Error saving message: {e}")
            return None
    
    @database_sync_to_async
    def mark_messages_read(self):
        """Mark all messages from other user as read"""
        from .models import Message
        from django.utils import timezone
        
        Message.objects.filter(
            conversation_id=self.conversation_id,
            is_read=False
        ).exclude(sender=self.user).update(
            is_read=True,
            read_at=timezone.now()
        )