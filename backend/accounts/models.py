from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser
    """
    # Additional fields beyond the default User model
    email = models.EmailField(unique=True)

    bio = models.TextField(max_length=500, blank=True, null=True)
    
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', 
        null=True, 
        blank=True
    )

    phone_number = models.CharField(max_length=20, blank=True, null=True)

    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # User type choices
    USER_TYPE_CHOICES = [
        ('client', 'Client'),
        ('freelancer', 'Freelancer'),
        ('both', 'Both'),
        ('admin', 'Admin'),
    ]
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPE_CHOICES, 
        default='client'
    )

    skills = models.TextField(blank=True, null=True, help_text="Comma-separated skills")
    
    average_rating = models.DecimalField(
        max_digits=3, 
        decimal_places=2, 
        default=0.00,
        help_text="Average rating from reviews"
    )
    total_reviews = models.IntegerField(default=0)
    
    is_verified = models.BooleanField(default=False)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.email})"
    
    def get_full_name(self):
        """Return the user's full name or username"""
        full_name = super().get_full_name()
        return full_name if full_name else self.username
    
    @property
    def is_client(self):
        return self.user_type in ['CLIENT', 'BOTH']
    
    @property
    def is_freelancer(self):
        return self.user_type in ['FREELANCER', 'BOTH']
        