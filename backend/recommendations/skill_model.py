"""
Skill model for better recommendation system
"""
from django.db import models


class Skill(models.Model):
    """
    Predefined skills for users to select
    Better than free-text for matching and recommendations
    """

    SKILL_CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('creative', 'Creative'),
        ('business', 'Business'),
        ('manual', 'Manual Labor'),
        ('service', 'Service'),
        ('education', 'Education'),
        ('health', 'Health & Wellness'),
        ('other', 'Other'),
    ]

    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Skill name (e.g., 'Python Programming', 'Graphic Design')"
    )
    slug = models.SlugField(max_length=100, unique=True)
    category = models.CharField(
        max_length=20,
        choices=SKILL_CATEGORY_CHOICES,
        default='other'
    )
    description = models.TextField(blank=True, null=True)

    # For matching with task categories
    related_task_categories = models.ManyToManyField(
        'tasks.Category',
        blank=True,
        related_name='related_skills',
        help_text="Task categories this skill is relevant to"
    )

    # Metadata
    is_active = models.BooleanField(default=True)
    usage_count = models.IntegerField(
        default=0,
        help_text="How many users have this skill (for popularity sorting)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'skills'
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'
        ordering = ['-usage_count', 'name']
        indexes = [
            models.Index(fields=['category', '-usage_count']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    """
    Many-to-Many relationship between Users and Skills
    Allows for additional metadata like proficiency level
    """

    PROFICIENCY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ]

    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='user_skills'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='user_skills'
    )

    proficiency = models.CharField(
        max_length=20,
        choices=PROFICIENCY_CHOICES,
        default='intermediate'
    )

    # Years of experience
    years_experience = models.IntegerField(
        null=True,
        blank=True,
        help_text="Years of experience with this skill"
    )

    # Primary skill (user's main expertise)
    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_skills'
        verbose_name = 'User Skill'
        verbose_name_plural = 'User Skills'
        unique_together = ['user', 'skill']
        ordering = ['-is_primary', '-proficiency', 'skill__name']
        indexes = [
            models.Index(fields=['user', 'is_primary']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.skill.name} ({self.proficiency})"
