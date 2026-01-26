from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max
from drf_spectacular.utils import extend_schema

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer
)
from accounts.models import User
from tasks.models import Task


# ==============================================================================
# CONVERSATION VIEWS
# ==============================================================================

class ConversationListView(generics.ListAPIView):
    """
    List all conversations for current user
    """
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get user's conversations"""
        return Conversation.objects.filter(
            participants=self.request.user
        ).distinct().prefetch_related('participants').order_by('-last_message_at', '-created_at')
    
    @extend_schema(
        summary="List conversations",
        description="Get list of all conversations for current user"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ConversationDetailView(generics.RetrieveAPIView):
    """
    Get conversation details with messages
    """
    serializer_class = ConversationDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get user's conversations"""
        return Conversation.objects.filter(
            participants=self.request.user
        ).distinct().prefetch_related('participants', 'messages__sender')
    
    def retrieve(self, request, *args, **kwargs):
        """Get conversation and mark messages as read"""
        instance = self.get_object()
        
        # Mark all messages from other user as read
        Message.objects.filter(
            conversation=instance,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Get conversation",
        description="Get conversation details with all messages"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ConversationCreateView(APIView):
    """
    Create a new conversation
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Create conversation",
        description="Start a new conversation with another user",
        request=ConversationCreateSerializer,
        responses={201: ConversationDetailSerializer}
    )
    def post(self, request):
        """Create conversation"""
        serializer = ConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        participant_id = serializer.validated_data['participant_id']
        task_id = serializer.validated_data.get('task_id')
        initial_message = serializer.validated_data.get('initial_message')
        
        # Can't create conversation with self
        if participant_id == user.id:
            return Response({
                'error': 'Cannot create conversation with yourself'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        participant = get_object_or_404(User, id=participant_id)
        task = None
        if task_id:
            task = get_object_or_404(Task, id=task_id)
        
        # Check if conversation already exists
        # For conversations with a task
        if task:
            existing = Conversation.objects.filter(
                task=task
            ).filter(
                participants=user
            ).filter(
                participants=participant
            ).distinct().first()
        else:
            # For general conversations (no task), find by participants only
            # Get all conversations where user is a participant
            user_convs = Conversation.objects.filter(
                participants=user,
                task__isnull=True
            ).prefetch_related('participants')

            # Find conversation with exactly these two participants
            existing = None
            for conv in user_convs:
                participant_ids = set(conv.participants.values_list('id', flat=True))
                if participant_ids == {user.id, participant.id}:
                    existing = conv
                    break

        if existing:
            # Return existing conversation
            serializer = ConversationDetailSerializer(
                existing,
                context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Create new conversation
        conversation = Conversation.objects.create(task=task)
        conversation.participants.add(user, participant)
        
        # Send initial message if provided
        if initial_message:
            Message.objects.create(
                conversation=conversation,
                sender=user,
                content=initial_message,
                message_type='TEXT'
            )
            
            conversation.last_message_content = initial_message[:200]
            conversation.last_message_sender = user
            conversation.last_message_at = conversation.created_at
            conversation.save()
        
        serializer = ConversationDetailSerializer(
            conversation,
            context={'request': request}
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==============================================================================
# MESSAGE VIEWS
# ==============================================================================

class MessageListView(generics.ListAPIView):
    """
    List messages in a conversation
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get conversation messages"""
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=self.request.user
        )
        
        return Message.objects.filter(
            conversation=conversation
        ).select_related('sender').order_by('created_at')
    
    @extend_schema(
        summary="List messages",
        description="Get all messages in a conversation"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class MessageCreateView(generics.CreateAPIView):
    """
    Send a message in a conversation
    """
    serializer_class = MessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Create message"""
        conversation_id = self.kwargs['conversation_id']
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=self.request.user
        )
        
        # Create message
        message = serializer.save(
            conversation=conversation,
            sender=self.request.user
        )
        
        # Update conversation
        from django.utils import timezone
        conversation.last_message_content = message.content[:200]
        conversation.last_message_sender = self.request.user
        conversation.last_message_at = timezone.now()
        conversation.save()
        
        return message
    
    @extend_schema(
        summary="Send message",
        description="Send a message in a conversation"
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class MarkAsReadView(APIView):
    """
    Mark conversation messages as read
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Mark as read",
        description="Mark all messages in conversation as read"
    )
    def post(self, request, conversation_id):
        """Mark messages as read"""
        conversation = get_object_or_404(
            Conversation,
            id=conversation_id,
            participants=request.user
        )
        
        # Mark messages as read
        from django.utils import timezone
        updated = Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(sender=request.user).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'{updated} messages marked as read'
        })


# ==============================================================================
# STATISTICS
# ==============================================================================

@extend_schema(
    summary="Messaging statistics",
    description="Get messaging statistics for current user"
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def messaging_statistics(request):
    """Get messaging stats"""
    user = request.user

    conversations = Conversation.objects.filter(participants=user).distinct()
    
    # Count unread messages
    unread_count = Message.objects.filter(
        conversation__in=conversations,
        is_read=False
    ).exclude(sender=user).count()
    
    # Count total messages
    total_sent = Message.objects.filter(
        conversation__in=conversations,
        sender=user
    ).count()
    
    total_received = Message.objects.filter(
        conversation__in=conversations
    ).exclude(sender=user).count()
    
    stats = {
        'total_conversations': conversations.count(),
        'active_conversations': conversations.filter(is_active=True).count(),
        'unread_messages': unread_count,
        'total_messages_sent': total_sent,
        'total_messages_received': total_received,
        'total_messages': total_sent + total_received,
    }
    
    return Response(stats)