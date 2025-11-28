from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message, MessageReadStatus
from accounts.serializers import PublicUserSerializer

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for messages
    """
    sender = PublicUserSerializer(read_only=True)
    is_mine = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'message_type', 'content',
            'attachment', 'is_read', 'read_at', 'is_mine', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sender', 'is_read', 'read_at', 'created_at', 'updated_at']
    
    def get_is_mine(self, obj):
        """Check if message is from current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False


class MessageCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating messages
    """
    
    class Meta:
        model = Message
        fields = ['content', 'message_type', 'attachment']
    
    def validate_content(self, value):
        """Validate message content"""
        if not value.strip():
            raise serializers.ValidationError('Message cannot be empty')
        return value.strip()
    
    def validate_attachment(self, value):
        """Validate attachment size"""
        if value and value.size > 10 * 1024 * 1024:  # 10MB limit
            raise serializers.ValidationError('File size cannot exceed 10MB')
        return value


class ConversationSerializer(serializers.ModelSerializer):
    """
    Serializer for conversations
    """
    participants = PublicUserSerializer(many=True, read_only=True)
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    task_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'other_participant', 'task', 'task_title',
            'last_message_content', 'last_message_at', 'last_message_sender',
            'last_message', 'unread_count', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = fields
    
    def get_other_participant(self, obj):
        """Get the other participant in conversation"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.get_other_participant(request.user)
            if other:
                return PublicUserSerializer(other).data
        return None
    
    def get_last_message(self, obj):
        """Get last message details"""
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'id': last_msg.id,
                'content': last_msg.content[:100],
                'sender_id': last_msg.sender.id,
                'created_at': last_msg.created_at,
                'is_read': last_msg.is_read
            }
        return None
    
    def get_unread_count(self, obj):
        """Get unread message count for current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0
    
    def get_task_title(self, obj):
        """Get related task title"""
        if obj.task:
            return obj.task.title
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    """
    Detailed conversation serializer with messages
    """
    participants = PublicUserSerializer(many=True, read_only=True)
    other_participant = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)
    task_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = [
            'id', 'participants', 'other_participant', 'task', 'task_info',
            'messages', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = fields
    
    def get_other_participant(self, obj):
        """Get the other participant"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            other = obj.get_other_participant(request.user)
            if other:
                return PublicUserSerializer(other).data
        return None
    
    def get_task_info(self, obj):
        """Get related task info"""
        if obj.task:
            return {
                'id': obj.task.id,
                'title': obj.task.title,
                'status': obj.task.status
            }
        return None


class ConversationCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a conversation
    """
    participant_id = serializers.IntegerField(required=True)
    task_id = serializers.IntegerField(required=False, allow_null=True)
    initial_message = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    
    def validate_participant_id(self, value):
        """Validate participant exists"""
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('User does not exist')
        return value
    
    def validate_task_id(self, value):
        """Validate task exists"""
        if value:
            from tasks.models import Task
            try:
                Task.objects.get(id=value)
            except Task.DoesNotExist:
                raise serializers.ValidationError('Task does not exist')
        return value