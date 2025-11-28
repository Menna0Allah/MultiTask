from rest_framework import serializers
from .models import UserPreference, RecommendationLog


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""
    
    class Meta:
        model = UserPreference
        fields = [
            'id', 'user', 'preferred_categories', 'min_budget', 'max_budget',
            'preferred_location', 'max_distance', 'prefer_remote', 'prefer_physical',
            'email_notifications', 'push_notifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RecommendationLogSerializer(serializers.ModelSerializer):
    """Serializer for recommendation logs"""
    
    class Meta:
        model = RecommendationLog
        fields = [
            'id', 'user', 'recommendation_type', 'recommended_items',
            'recommendation_scores', 'algorithm_used', 'clicked_items',
            'applied_items', 'created_at'
        ]
        read_only_fields = fields