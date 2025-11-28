from django.contrib import admin
from .models import Category, Task, TaskApplication, Review, TaskImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'order', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['order', 'name']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'category', 'status', 'budget', 'created_at']
    list_filter = ['status', 'task_type', 'category', 'is_remote']
    search_fields = ['title', 'description', 'client__username']
    readonly_fields = ['views_count', 'applications_count', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('client', 'category', 'title', 'description', 'task_type')
        }),
        ('Budget & Timing', {
            'fields': ('budget', 'is_negotiable', 'deadline', 'estimated_duration')
        }),
        ('Location', {
            'fields': ('location', 'city', 'is_remote')
        }),
        ('Status', {
            'fields': ('status', 'assigned_to')
        }),
        ('Metrics', {
            'fields': ('views_count', 'applications_count', 'created_at', 'updated_at')
        }),
    )


@admin.register(TaskApplication)
class TaskApplicationAdmin(admin.ModelAdmin):
    list_display = ['freelancer', 'task', 'status', 'offered_price', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['freelancer__username', 'task__title', 'proposal']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'reviewee', 'task', 'rating', 'created_at']
    list_filter = ['rating', 'is_public', 'is_verified']
    search_fields = ['reviewer__username', 'reviewee__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']


@admin.register(TaskImage)
class TaskImageAdmin(admin.ModelAdmin):
    list_display = ['task', 'caption', 'order', 'uploaded_at']
    list_filter = ['uploaded_at']
    ordering = ['task', 'order']