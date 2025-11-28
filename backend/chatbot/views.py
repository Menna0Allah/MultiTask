from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
from drf_spectacular.utils import extend_schema
import time
from django.db import models 
from .models import ChatSession, ChatMessage
from .serializers import ChatSessionSerializer, ChatMessageSerializer, ChatRequestSerializer
from .services import get_chatbot_service


# ==============================================================================
# CHAT VIEWS
# ==============================================================================

class ChatSessionListView(generics.ListAPIView):
    """
    List user's chat sessions
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get current user's sessions"""
        return ChatSession.objects.filter(user=self.request.user).order_by('-last_message_at')
    
    @extend_schema(
        summary="List chat sessions",
        description="Get list of user's chatbot sessions"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ChatSessionDetailView(generics.RetrieveAPIView):
    """
    Get chat session with messages
    """
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get current user's sessions"""
        return ChatSession.objects.filter(user=self.request.user)
    
    @extend_schema(
        summary="Get chat session",
        description="Get chat session details with all messages"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class ChatView(APIView):
    """
    Send message to chatbot and get response
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Chat with AI",
        description="Send a message to the AI chatbot and get a response",
        request=ChatRequestSerializer,
        responses={200: ChatMessageSerializer(many=True)}
    )
    def post(self, request):
        """Send message and get response"""
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        message_text = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id')
        context = serializer.validated_data.get('context', {})
        
        # Get or create session
        if session_id:
            session = get_object_or_404(ChatSession, id=session_id, user=user)
        else:
            session = ChatSession.objects.create(
                user=user,
                session_type='GENERAL'
            )
        
        # Save user message
        user_message = ChatMessage.objects.create(
            session=session,
            sender='USER',
            message=message_text
        )
        
        # Get conversation history
        history = list(session.messages.order_by('created_at').values('sender', 'message'))
        
        # Add user context
        context['user_type'] = user.user_type
        
        # Get chatbot service
        chatbot = get_chatbot_service()
        
        # Analyze intent
        intent = chatbot.analyze_intent(message_text)
        user_message.detected_intent = intent
        user_message.save(update_fields=['detected_intent'])
        
        # Generate response
        start_time = time.time()
        bot_response = chatbot.get_response(
            user_message=message_text,
            conversation_history=history[:-1],  # Exclude current message
            context=context
        )
        response_time_ms = int((time.time() - start_time) * 1000)
        
        # Save bot message
        bot_message = ChatMessage.objects.create(
            session=session,
            sender='BOT',
            message=bot_response,
            ai_model_used=settings.GEMINI_MODEL,
            response_time_ms=response_time_ms,
            detected_intent=intent
        )
        
        # Update session
        session.last_message_at = bot_message.created_at
        session.save(update_fields=['last_message_at'])
        
        # Return both messages
        return Response({
            'session_id': session.id,
            'messages': [
                ChatMessageSerializer(user_message).data,
                ChatMessageSerializer(bot_message).data
            ]
        }, status=status.HTTP_200_OK)


class ExtractTaskInfoView(APIView):
    """
    Extract task information from conversation
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Extract task info",
        description="Extract task information from a conversation"
    )
    def post(self, request, session_id):
        """Extract task info from session"""
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        # Get conversation text
        messages = session.messages.order_by('created_at')
        conversation = '\n'.join([
            f"{msg.sender}: {msg.message}"
            for msg in messages
        ])
        
        # Extract info
        chatbot = get_chatbot_service()
        task_info = chatbot.extract_task_info(conversation)
        
        if task_info:
            return Response({
                'success': True,
                'task_info': task_info
            })
        else:
            return Response({
                'success': False,
                'message': 'Could not extract task information'
            }, status=status.HTTP_400_BAD_REQUEST)


class SuggestCategoryView(APIView):
    """
    Suggest category for task description
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Suggest category",
        description="Get AI category suggestion based on task description"
    )
    def post(self, request):
        """Suggest category"""
        description = request.data.get('description', '')
        
        if not description:
            return Response({
                'error': 'Description is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        chatbot = get_chatbot_service()
        category = chatbot.suggest_category(description)
        
        return Response({
            'suggested_category': category
        })


class EndSessionView(APIView):
    """
    End a chat session
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="End chat session",
        description="Mark a chat session as ended"
    )
    def post(self, request, session_id):
        """End session"""
        session = get_object_or_404(ChatSession, id=session_id, user=request.user)
        
        from django.utils import timezone
        session.is_active = False
        session.ended_at = timezone.now()
        session.save()
        
        return Response({
            'message': 'Session ended successfully'
        })


class RateMessageView(APIView):
    """
    Rate a bot message
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Rate message",
        description="Rate a chatbot message (1-5 stars)"
    )
    def post(self, request, message_id):
        """Rate message"""
        message = get_object_or_404(
            ChatMessage,
            id=message_id,
            session__user=request.user,
            sender='BOT'
        )
        
        rating = request.data.get('rating')
        
        if not rating or rating < 1 or rating > 5:
            return Response({
                'error': 'Rating must be between 1 and 5'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        message.user_rating = rating
        message.save(update_fields=['user_rating'])
        
        return Response({
            'message': 'Rating saved successfully',
            'rating': rating
        })


# ==============================================================================
# STATISTICS
# ==============================================================================

@extend_schema(
    summary="Chatbot statistics",
    description="Get chatbot usage statistics"
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def chatbot_statistics(request):
    """Get chatbot stats"""
    user = request.user
    
    sessions = ChatSession.objects.filter(user=user)
    messages = ChatMessage.objects.filter(session__user=user)
    
    stats = {
        'total_sessions': sessions.count(),
        'active_sessions': sessions.filter(is_active=True).count(),
        'total_messages': messages.count(),
        'user_messages': messages.filter(sender='USER').count(),
        'bot_messages': messages.filter(sender='BOT').count(),
        'average_response_time_ms': messages.filter(
            sender='BOT',
            response_time_ms__isnull=False
        ).aggregate(
            avg_time=models.Avg('response_time_ms')
        )['avg_time'] or 0,
        'average_rating': messages.filter(
            sender='BOT',
            user_rating__isnull=False
        ).aggregate(
            avg_rating=models.Avg('user_rating')
        )['avg_rating'] or 0,
    }
    
    return Response(stats)