from django.contrib import admin
from .models import Conversation, Message, MessageReadStatus


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'task', 'is_active', 'last_message_at', 'created_at']
    list_filter = ['is_active']
    search_fields = ['participants__username', 'task__title']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-last_message_at']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'conversation', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read']
    search_fields = ['sender__username', 'content']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'read_at']
    search_fields = ['user__username']
    readonly_fields = ['read_at']