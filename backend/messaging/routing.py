from django.urls import path
from . import consumers
from notifications.consumers import NotificationConsumer

websocket_urlpatterns = [
    path('ws/chat/<int:conversation_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/notifications/', NotificationConsumer.as_asgi()),
]