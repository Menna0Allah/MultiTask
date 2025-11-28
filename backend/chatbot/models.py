from django.db import models
from django.conf import settings


class ChatSession(models.Model):
    """
    A chatbot conversation session
    """
    
    SESSION_TYPE_CHOICES = [
        ('GENERAL', 'General Help'),
        ('TASK_CREATION', 'Task Creation Help'),
        ('TASK_SEARCH', 'Task Search Help'),
        ('SUPPORT', 'Support'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chatbot_sessions'
    )
    
    session_type = models.CharField(
        max_length=20,
        choices=SESSION_TYPE_CHOICES,
        default='GENERAL'
    )
    
    # Session state (for multi-turn conversations)
    context_data = models.TextField(
        blank=True,
        null=True,
        help_text="JSON string storing conversation context"
    )
    
    # Session status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'chatbot_sessions'
        verbose_name = 'Chatbot Session'
        verbose_name_plural = 'Chatbot Sessions'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', '-started_at']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"Session {self.id} - {self.user.username} ({self.session_type})"


class ChatMessage(models.Model):
    """
    Individual messages in a chatbot session
    """
    
    SENDER_CHOICES = [
        ('USER', 'User'),
        ('BOT', 'Bot'),
    ]
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    
    # AI metadata
    ai_model_used = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="e.g., 'gemini-1.5-flash'"
    )
    response_time_ms = models.IntegerField(
        null=True,
        blank=True,
        help_text="Response time in milliseconds"
    )
    
    # Intent detection (optional)
    detected_intent = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="e.g., 'create_task', 'search_task'"
    )
    
    # Extracted entities (JSON string)
    extracted_entities = models.TextField(
        blank=True,
        null=True,
        help_text="JSON object with extracted information"
    )
    
    # Feedback
    user_rating = models.IntegerField(
        null=True,
        blank=True,
        help_text="User rating of bot response (1-5)"
    )
    
    # Timestamp
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chatbot_messages'
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
            models.Index(fields=['sender']),
        ]
    
    def __str__(self):
        preview = self.message[:50] + "..." if len(self.message) > 50 else self.message
        return f"{self.sender}: {preview}"