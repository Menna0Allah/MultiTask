from rest_framework import serializers
from .models import UserPreference, RecommendationLog
from tasks.serializers import TaskListSerializer


class RecommendedTaskSerializer(TaskListSerializer):
    """Serializer for recommended tasks with match score"""
    match_score = serializers.IntegerField(read_only=True)
    required_skills = serializers.SerializerMethodField()

    class Meta(TaskListSerializer.Meta):
        fields = TaskListSerializer.Meta.fields + ['match_score', 'required_skills']

    def get_required_skills(self, obj):
        """Extract skills from task description or return empty list"""
        # You can enhance this to parse actual skills from task data
        # For now, return empty list or parse from description
        return []


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