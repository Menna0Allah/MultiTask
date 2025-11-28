from django.contrib import admin
from .models import ChatSession, ChatMessage


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'session_type', 'is_active', 'started_at']
    list_filter = ['session_type', 'is_active']
    search_fields = ['user__username']
    readonly_fields = ['started_at', 'last_message_at']
    ordering = ['-started_at']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'sender', 'message_preview', 'created_at']
    list_filter = ['sender']
    search_fields = ['message', 'session__user__username']
    readonly_fields = ['created_at']
    ordering = ['created_at']
    
    def message_preview(self, obj):
        return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'