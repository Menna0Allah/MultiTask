from rest_framework import serializers
from .models import UserPreference, RecommendationLog
from .skill_model import Skill, UserSkill
from tasks.serializers import TaskListSerializer
from tasks.models import TaskApplication


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
            'id', 'user', 'onboarding_completed', 'onboarding_completed_at',
            'interests', 'preferred_task_types', 'preferred_categories',
            'min_budget', 'max_budget', 'preferred_location', 'max_distance',
            'prefer_remote', 'prefer_physical', 'email_notifications',
            'push_notifications', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'onboarding_completed_at']


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for skills"""

    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'slug', 'category', 'description',
            'is_active', 'usage_count'
        ]
        read_only_fields = ['id', 'slug', 'usage_count']


class UserSkillSerializer(serializers.ModelSerializer):
    """Serializer for user skills with proficiency"""
    skill = SkillSerializer(read_only=True)  # Nest full skill object

    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill',
            'proficiency', 'years_experience', 'is_primary'
        ]
        read_only_fields = ['id']


class OnboardingSerializer(serializers.Serializer):
    """Serializer for onboarding survey - MUST select interests and skills"""

    # Required: Categories/interests
    interests = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Array of category IDs user is interested in (REQUIRED - at least 1)",
        allow_empty=False
    )

    # Required: Skills
    skills = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="Array of skill IDs the user has (REQUIRED - at least 1)",
        allow_empty=False
    )

    # Optional: Task preferences
    preferred_task_types = serializers.ListField(
        child=serializers.ChoiceField(choices=['PHYSICAL', 'DIGITAL', 'HYBRID']),
        help_text="Preferred task types",
        required=False,
        allow_empty=True
    )

    # Optional: Location preferences
    prefer_remote = serializers.BooleanField(default=False, required=False)
    preferred_location = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        help_text="Preferred work location (city)"
    )

    # Optional: Budget preferences
    min_budget = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    max_budget = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )

    def validate_interests(self, value):
        """Ensure at least one interest is selected"""
        if len(value) < 1:
            raise serializers.ValidationError("Please select at least one area of interest")
        if len(value) > 15:
            raise serializers.ValidationError("Please select no more than 15 interests")
        return value

    def validate_skills(self, value):
        """Ensure at least one skill is selected"""
        if len(value) < 1:
            raise serializers.ValidationError("Please select at least one skill")
        if len(value) > 20:
            raise serializers.ValidationError("Please select no more than 20 skills")
        return value


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


class FreelancerDiscoverySerializer(serializers.Serializer):
    """
    Enhanced serializer for freelancer discovery with additional computed fields
    """
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)
    full_name = serializers.SerializerMethodField()
    profile_picture = serializers.CharField(read_only=True, allow_null=True)
    city = serializers.CharField(read_only=True, allow_null=True)
    country = serializers.CharField(read_only=True, allow_null=True)
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2, read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    user_type = serializers.CharField(read_only=True)

    # Enhanced fields for discovery
    bio = serializers.CharField(read_only=True, allow_blank=True, allow_null=True)
    skills = serializers.SerializerMethodField()
    tasks_completed = serializers.SerializerMethodField()
    match_score = serializers.IntegerField(read_only=True)

    def get_full_name(self, obj):
        """Get user's full name"""
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        return obj.username

    def get_skills(self, obj):
        """Get user's skills as array"""
        if hasattr(obj, 'skills') and obj.skills:
            # Convert comma-separated string to array
            return [s.strip() for s in obj.skills.split(',') if s.strip()]
        return []

    def get_tasks_completed(self, obj):
        """Get count of completed tasks"""
        try:
            return TaskApplication.objects.filter(
                freelancer=obj,
                status='COMPLETED'
            ).count()
        except:
            return 0