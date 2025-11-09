from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    # Additional fields beyond the default User model
    email = models.EmailField(unique=True)

    bio = models.TextField(max_length=500, blank=True)
    
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        null=True, 
        blank=True
    )
    phone_number = models.CharField(max_length=20, blank=True)
    
    # User type choices
    USER_TYPE_CHOICES = [
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('both', 'Both'),
    ]
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPE_CHOICES, 
        default='client'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email as username
    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = ['username']  # Required for createsuperuser
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email