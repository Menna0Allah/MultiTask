from django.urls import path
from . import views

urlpatterns = [
    # Chat sessions
    path('sessions/', views.ChatSessionListView.as_view(), name='chat-sessions'),
    path('sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('sessions/<int:session_id>/end/', views.EndSessionView.as_view(), name='end-session'),
    
    # Chat
    path('chat/', views.ChatView.as_view(), name='chat'),
    
    # Task extraction & suggestions
    path('sessions/<int:session_id>/extract-task/', views.ExtractTaskInfoView.as_view(), name='extract-task'),
    path('suggest-category/', views.SuggestCategoryView.as_view(), name='suggest-category'),
    
    # Rating
    path('messages/<int:message_id>/rate/', views.RateMessageView.as_view(), name='rate-message'),
    
    # Statistics
    path('statistics/', views.chatbot_statistics, name='chatbot-statistics'),
]