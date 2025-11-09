from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'user_type', 'is_staff', 'created_at']
    list_filter = ['user_type', 'is_staff', 'is_active']
    search_fields = ['email', 'username']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('bio', 'profile_picture', 'phone_number', 'user_type')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'bio', 'phone_number', 'user_type')
        }),
    )