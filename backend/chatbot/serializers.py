from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for chat messages
    """
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session', 'sender', 'message', 'ai_model_used',
            'response_time_ms', 'detected_intent', 'extracted_entities',
            'user_rating', 'created_at'
        ]
        read_only_fields = fields


class ChatSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for chat sessions with messages
    """
    messages = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()
    last_user_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'user', 'session_type', 'context_data', 'is_active',
            'started_at', 'last_message_at', 'ended_at', 'messages',
            'message_count', 'last_user_message'
        ]
        read_only_fields = fields
    
    def get_message_count(self, obj):
        """Get total message count"""
        return obj.messages.count()
    
    def get_last_user_message(self, obj):
        """Get last user message preview"""
        last_msg = obj.messages.filter(sender='USER').order_by('-created_at').first()
        if last_msg:
            preview = last_msg.message[:50]
            return preview + "..." if len(last_msg.message) > 50 else preview
        return None


class ChatSessionListSerializer(serializers.ModelSerializer):
    """
    Serializer for chat session list (without messages)
    """
    message_count = serializers.SerializerMethodField()
    last_user_message = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'session_type', 'is_active', 'started_at',
            'last_message_at', 'message_count', 'last_user_message'
        ]
        read_only_fields = fields
    
    def get_message_count(self, obj):
        """Get total message count"""
        return obj.messages.count()
    
    def get_last_user_message(self, obj):
        """Get last user message preview"""
        last_msg = obj.messages.filter(sender='USER').order_by('-created_at').first()
        if last_msg:
            preview = last_msg.message[:50]
            return preview + "..." if len(last_msg.message) > 50 else preview
        return None


class ChatRequestSerializer(serializers.Serializer):
    """
    Serializer for chat request
    """
    message = serializers.CharField(required=True, max_length=2000)
    session_id = serializers.IntegerField(required=False, allow_null=True)
    context = serializers.JSONField(required=False, default=dict)
    
    def validate_message(self, value):
        """Validate message is not empty"""
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty')
        return value.strip()


class TaskExtractionSerializer(serializers.Serializer):
    """
    Serializer for extracted task information
    """
    title = serializers.CharField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_null=True)
    category = serializers.CharField(required=False, allow_null=True)
    budget = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    location = serializers.CharField(required=False, allow_null=True)


class CategorySuggestionSerializer(serializers.Serializer):
    """
    Serializer for category suggestion request
    """
    description = serializers.CharField(required=True, max_length=2000)
    
    def validate_description(self, value):
        """Validate description is not empty"""
        if not value.strip():
            raise serializers.ValidationError('Description cannot be empty')
        return value.strip()


class MessageRatingSerializer(serializers.Serializer):
    """
    Serializer for rating a message
    """
    rating = serializers.IntegerField(min_value=1, max_value=5, required=True)