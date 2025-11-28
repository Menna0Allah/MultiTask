from django.contrib import admin
from .models import UserPreference, RecommendationLog


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'min_budget', 'max_budget', 'preferred_location', 'updated_at']
    search_fields = ['user__username', 'preferred_location']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(RecommendationLog)
class RecommendationLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'recommendation_type', 'algorithm_used', 'created_at']
    list_filter = ['recommendation_type', 'algorithm_used']
    search_fields = ['user__username']
    readonly_fields = ['created_at']
    ordering = ['-created_at']