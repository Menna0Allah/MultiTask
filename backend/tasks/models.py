from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Category(models.Model):
    """
    Task categories (e.g., Cleaning, Design, Programming)
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Icon class or emoji")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0, help_text="Display order")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name


class Task(models.Model):
    """
    Main Task model - posted by clients, applied by freelancers
    """
    
    # Status choices
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    # Task type
    TASK_TYPE_CHOICES = [
        ('PHYSICAL', 'Physical'),  # In-person task
        ('DIGITAL', 'Digital'),    # Remote task
        ('BOTH', 'Both'),
        ('ONE_TIME', 'One Time'),  # Legacy: One-time task
        ('RECURRING', 'Recurring'),  # Legacy: Recurring task
    ]

    # Listing type
    LISTING_TYPE_CHOICES = [
        ('task_request', 'Task Request'),  # Client needs work done
        ('service_offer', 'Service Offer'),  # Freelancer offers service
    ]

    # Basic information
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='posted_tasks'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='tasks'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    task_type = models.CharField(max_length=20, choices=TASK_TYPE_CHOICES, default='PHYSICAL')
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE_CHOICES, default='task_request')

    # Budget
    budget = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(10)],
        help_text="Budget in USD"
    )
    is_negotiable = models.BooleanField(default=True)
    
    # Location (for physical tasks)
    location = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    is_remote = models.BooleanField(default=False)
    
    # Timing
    deadline = models.DateTimeField(null=True, blank=True)
    estimated_duration = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="e.g., '2 hours', '3 days'"
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    # Assigned freelancer (when accepted)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_tasks'
    )
    
    # Attachments
    image = models.ImageField(upload_to='task_images/', null=True, blank=True)
    
    # Engagement metrics
    views_count = models.IntegerField(default=0)
    applications_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'tasks'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['client']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['city']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.client.username}"
    
    @property
    def is_open(self):
        return self.status == 'OPEN'
    
    @property
    def is_completed(self):
        return self.status == 'COMPLETED'


class TaskApplication(models.Model):
    """
    Freelancer applications to tasks
    """
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
        ('WITHDRAWN', 'Withdrawn'),
    ]
    
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='task_applications'
    )
    
    # Application details
    proposal = models.TextField(help_text="Freelancer's proposal")
    offered_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(10)]
    )
    estimated_time = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Estimated completion time"
    )
    
    # Cover letter / additional info
    cover_letter = models.TextField(blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'task_applications'
        verbose_name = 'Task Application'
        verbose_name_plural = 'Task Applications'
        ordering = ['-created_at']
        unique_together = ['task', 'freelancer']  # One application per freelancer per task
        indexes = [
            models.Index(fields=['task', 'status']),
            models.Index(fields=['freelancer', 'status']),
            models.Index(fields=['status', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.freelancer.username} → {self.task.title}"
    
    @property
    def is_pending(self):
        return self.status == 'PENDING'
    
    @property
    def is_accepted(self):
        return self.status == 'ACCEPTED'


class Review(models.Model):
    """
    Reviews and ratings between clients and freelancers after task completion
    """
    
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    reviewee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_received'
    )
    
    # Rating (1-5 stars)
    rating = models.IntegerField(
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    
    # Review text
    comment = models.TextField()
    
    # Review aspects (optional detailed ratings)
    communication_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    quality_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    professionalism_rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Flags
    is_public = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False, help_text="Verified purchase")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']
        unique_together = ['task', 'reviewer']  # One review per person per task
        indexes = [
            models.Index(fields=['reviewee', '-created_at']),
            models.Index(fields=['rating']),
            models.Index(fields=['task']),
        ]
    
    def __str__(self):
        return f"{self.reviewer.username} → {self.reviewee.username} ({self.rating}★)"


class TaskImage(models.Model):
    """
    Additional images for tasks (multiple images support)
    """
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='task_images/')
    caption = models.CharField(max_length=200, blank=True, null=True)
    order = models.IntegerField(default=0)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'task_images'
        ordering = ['order', 'uploaded_at']
    
    def __str__(self):
        return f"Image for {self.task.title}"