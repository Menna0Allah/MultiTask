from django.db import models
from django.conf import settings

# Import skill models
from .skill_model import Skill, UserSkill

class UserPreference(models.Model):
    """
    Store user preferences for better recommendations
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='preferences'
    )

    # Onboarding
    onboarding_completed = models.BooleanField(
        default=False,
        help_text="Whether user has completed the onboarding survey"
    )
    onboarding_completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the user completed onboarding"
    )

    # Interests (from onboarding survey)
    interests = models.JSONField(
        blank=True,
        null=True,
        help_text="Array of interest/category IDs the user is interested in"
    )

    # Preferred categories (stored as comma-separated IDs) - LEGACY
    preferred_categories = models.TextField(
        blank=True,
        null=True,
        help_text="Comma-separated category IDs (legacy, use interests instead)"
    )

    # Task type preferences
    preferred_task_types = models.JSONField(
        blank=True,
        null=True,
        help_text="Array of preferred task types (PHYSICAL, DIGITAL, HYBRID)"
    )

    # Budget preferences
    min_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    max_budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Location preferences
    preferred_location = models.CharField(max_length=200, blank=True, null=True)
    max_distance = models.IntegerField(
        null=True,
        blank=True,
        help_text="Maximum distance in km"
    )

    # Work type preferences
    prefer_remote = models.BooleanField(default=False)
    prefer_physical = models.BooleanField(default=True)

    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_preferences'
        verbose_name = 'User Preference'
        verbose_name_plural = 'User Preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.username}"


class RecommendationLog(models.Model):
    """
    Log recommendations shown to users (for analytics and improvement)
    """
    
    RECOMMENDATION_TYPE_CHOICES = [
        ('TASK', 'Task Recommendation'),
        ('FREELANCER', 'Freelancer Recommendation'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recommendation_logs'
    )
    
    recommendation_type = models.CharField(
        max_length=20,
        choices=RECOMMENDATION_TYPE_CHOICES
    )
    
    # What was recommended (stored as JSON string)
    recommended_items = models.TextField(help_text="JSON array of recommended item IDs")
    
    # Scores (stored as JSON string)
    recommendation_scores = models.TextField(
        blank=True,
        null=True,
        help_text="JSON object with scores"
    )
    
    # Algorithm used
    algorithm_used = models.CharField(
        max_length=50,
        default='hybrid',
        help_text="e.g., 'tfidf', 'semantic', 'hybrid'"
    )
    
    # User interaction
    clicked_items = models.TextField(
        blank=True,
        null=True,
        help_text="JSON array of clicked item IDs"
    )
    applied_items = models.TextField(
        blank=True,
        null=True,
        help_text="JSON array of applied item IDs"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'recommendation_logs'
        verbose_name = 'Recommendation Log'
        verbose_name_plural = 'Recommendation Logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['recommendation_type']),
        ]
    
    def __str__(self):
        return f"{self.recommendation_type} for {self.user.username} at {self.created_at}" 