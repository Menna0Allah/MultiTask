from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/create/', views.ConversationCreateView.as_view(), name='conversation-create'),
    path('conversations/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('conversations/<int:conversation_id>/mark-read/', views.MarkAsReadView.as_view(), name='mark-as-read'),
    
    # Messages
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/messages/send/', views.MessageCreateView.as_view(), name='message-create'),
    
    # Statistics
    path('statistics/', views.messaging_statistics, name='messaging-statistics'),
]