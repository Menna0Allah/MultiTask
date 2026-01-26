from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Category,
    Task,
    TaskApplication,
    Review,
    TaskImage,
    SavedTask
)
from accounts.serializers import PublicUserSerializer

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for task categories"""
    tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon',
            'is_active', 'order', 'tasks_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_tasks_count(self, obj):
        return obj.tasks.filter(status='OPEN').count()


class TaskImageSerializer(serializers.ModelSerializer):
    """Serializer for task images"""
    
    class Meta:
        model = TaskImage
        fields = ['id', 'image', 'caption', 'order', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class TaskListSerializer(serializers.ModelSerializer):
    """Serializer for task list view (minimal data)"""
    client = PublicUserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    required_skills = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'client', 'category',
            'task_type', 'listing_type', 'budget', 'is_negotiable', 'location', 'city',
            'is_remote', 'deadline', 'status', 'views_count',
            'applications_count', 'required_skills', 'created_at'
        ]
        read_only_fields = fields

    def get_required_skills(self, obj):
        """Get required skills as list of IDs and names"""
        try:
            from recommendations.serializers import SkillSerializer
            skills = obj.required_skills.all()
            return SkillSerializer(skills, many=True).data
        except:
            return []


class TaskDetailSerializer(serializers.ModelSerializer):
    """Serializer for task detail view (full data)"""
    client = PublicUserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    assigned_to = PublicUserSerializer(read_only=True)
    images = TaskImageSerializer(many=True, read_only=True)
    is_applied = serializers.SerializerMethodField()
    can_apply = serializers.SerializerMethodField()
    required_skills = serializers.SerializerMethodField()
    escrow = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'client', 'category',
            'task_type', 'listing_type', 'budget', 'is_negotiable', 'location', 'city',
            'is_remote', 'deadline', 'estimated_duration', 'status',
            'assigned_to', 'image', 'images', 'views_count',
            'applications_count', 'required_skills', 'is_applied', 'can_apply',
            'requires_payment', 'payment_status', 'final_amount', 'escrow',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = fields

    def get_required_skills(self, obj):
        """Get required skills as list of IDs and names"""
        try:
            from recommendations.serializers import SkillSerializer
            skills = obj.required_skills.all()
            return SkillSerializer(skills, many=True).data
        except:
            return []
    
    def get_is_applied(self, obj):
        """Check if current user already applied"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return TaskApplication.objects.filter(
                task=obj,
                freelancer=request.user
            ).exists()
        return False
    
    def get_can_apply(self, obj):
        """Check if current user can apply"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Can't apply to own task
        if obj.client == user:
            return False
        
        # Must be freelancer
        if not user.is_freelancer:
            return False
        
        # Task must be open
        if obj.status != 'OPEN':
            return False
        
        # Already applied
        if self.get_is_applied(obj):
            return False

        return True

    def get_escrow(self, obj):
        """Get escrow details if exists"""
        try:
            if hasattr(obj, 'escrow'):
                from payments.serializers import EscrowSerializer
                return EscrowSerializer(obj.escrow).data
        except:
            pass
        return None


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating tasks"""
    images = TaskImageSerializer(many=True, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Import here to avoid circular imports and set queryset dynamically
        from recommendations.models import Skill
        self.fields['required_skills'] = serializers.PrimaryKeyRelatedField(
            many=True,
            queryset=Skill.objects.filter(is_active=True),
            required=False,
            help_text="List of skill IDs required for this task"
        )

    class Meta:
        model = Task
        fields = [
            'title', 'description', 'category', 'task_type',
            'budget', 'is_negotiable', 'location', 'city',
            'is_remote', 'deadline', 'estimated_duration', 'image', 'images',
            'required_skills'
        ]
    
    def validate_budget(self, value):
        """Validate budget is reasonable"""
        if value < 10:
            raise serializers.ValidationError(
                'Budget must be at least 10 USD'
            )
        if value > 100000:
            raise serializers.ValidationError(
                'Budget cannot exceed 100,000 USD'
            )
        return value
    
    def validate(self, attrs):
        """Validate task data"""
        task_type = attrs.get('task_type')
        location = attrs.get('location')
        is_remote = attrs.get('is_remote', False)
        
        # Physical tasks should have location
        if task_type == 'PHYSICAL' and not location and not is_remote:
            raise serializers.ValidationError({
                'location': 'Location is required for physical tasks'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create task with client from request"""
        images_data = validated_data.pop('images', [])
        required_skills = validated_data.pop('required_skills', [])
        validated_data['client'] = self.context['request'].user

        task = Task.objects.create(**validated_data)

        # Set required skills (many-to-many)
        if required_skills:
            task.required_skills.set(required_skills)

        # Create images
        for image_data in images_data:
            TaskImage.objects.create(task=task, **image_data)

        return task


class TaskApplicationSerializer(serializers.ModelSerializer):
    """Serializer for task applications"""
    freelancer = PublicUserSerializer(read_only=True)
    task = TaskListSerializer(read_only=True)
    
    class Meta:
        model = TaskApplication
        fields = [
            'id', 'task', 'freelancer', 'proposal', 'offered_price',
            'estimated_time', 'cover_letter', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'freelancer', 'status', 'created_at', 'updated_at']
    
    def validate_offered_price(self, value):
        """Validate offered price"""
        if value < 10:
            raise serializers.ValidationError('Price must be at least 10 USD')
        return value
    
    def create(self, validated_data):
        """Create application with freelancer from request"""
        validated_data['freelancer'] = self.context['request'].user
        return super().create(validated_data)


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews"""
    reviewer = PublicUserSerializer(read_only=True)
    reviewee = PublicUserSerializer(read_only=True)
    task = TaskListSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'task', 'reviewer', 'reviewee', 'rating', 'comment',
            'communication_rating', 'quality_rating', 'professionalism_rating',
            'is_public', 'is_verified', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reviewer', 'reviewee', 'task', 'is_verified',
            'created_at', 'updated_at'
        ]
    
    def validate_rating(self, value):
        """Validate rating is between 1-5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError('Rating must be between 1 and 5')
        return value
    
    def validate(self, attrs):
        """Validate detailed ratings if provided"""
        detailed_ratings = [
            attrs.get('communication_rating'),
            attrs.get('quality_rating'),
            attrs.get('professionalism_rating')
        ]

        for rating in detailed_ratings:
            if rating is not None and (rating < 1 or rating > 5):
                raise serializers.ValidationError(
                    'Detailed ratings must be between 1 and 5'
                )

        return attrs


class SavedTaskSerializer(serializers.ModelSerializer):
    """Serializer for saved/bookmarked tasks"""
    task = TaskListSerializer(read_only=True)
    task_id = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(),
        source='task',
        write_only=True
    )

    class Meta:
        model = SavedTask
        fields = [
            'id', 'task', 'task_id', 'note', 'created_at'
        ]
        read_only_fields = ['id', 'task', 'created_at']

    def create(self, validated_data):
        """Create saved task with user from request"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, attrs):
        """Ensure task isn't already saved"""
        user = self.context['request'].user
        task = attrs.get('task')

        if SavedTask.objects.filter(user=user, task=task).exists():
            raise serializers.ValidationError('You have already saved this task')

        return attrs