from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    username = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        label='Confirm Password'
    )
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'user_type', 'phone_number',
            'city', 'country', 'bio', 'skills'
        ]
        extra_kwargs = {
            'user_type': {'required': True},
            'phone_number': {'required': False},
            'city': {'required': False},
            'country': {'required': False},
            'bio': {'required': False},
            'skills': {'required': False},
        }
    
    def validate(self, attrs):
        """Validate passwords match"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": "Password fields didn't match."
            })
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type=validated_data.get('user_type', 'CLIENT'),
            phone_number=validated_data.get('phone_number', ''),
            city=validated_data.get('city', ''),
            country=validated_data.get('country', ''),
            bio=validated_data.get('bio', ''),
            skills=validated_data.get('skills', ''),
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login (supports username OR email)
    """
    username_or_email = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Authenticate user with username or email"""
        username_or_email = attrs.get('username_or_email')
        password = attrs.get('password')
        
        # Try to find user by username or email
        user = None
        if '@' in username_or_email:
            # It's an email
            try:
                user_obj = User.objects.get(email=username_or_email)
                user = authenticate(
                    username=user_obj.username,
                    password=password
                )
            except User.DoesNotExist:
                pass
        else:
            # It's a username
            user = authenticate(
                username=username_or_email,
                password=password
            )
        
        if not user:
            raise serializers.ValidationError(
                'Invalid credentials. Please check your username/email and password.'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'This account has been deactivated.'
            )
        
        attrs['user'] = user
        return attrs


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer with additional user data
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['user_type'] = user.user_type
        token['full_name'] = user.get_full_name()
        
        return token


class UserDetailSerializer(serializers.ModelSerializer):
    """
    Detailed user serializer for profile viewing
    """
    full_name = serializers.SerializerMethodField()
    is_client = serializers.ReadOnlyField()
    is_freelancer = serializers.ReadOnlyField()
    total_tasks_posted = serializers.SerializerMethodField()
    total_tasks_completed = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'user_type', 'bio', 'profile_picture', 'phone_number',
            'city', 'country', 'skills', 'average_rating', 'total_reviews',
            'is_verified', 'is_client', 'is_freelancer',
            'total_tasks_posted', 'total_tasks_completed',
            'date_joined', 'created_at'
        ]
        read_only_fields = [
            'id', 'date_joined', 'created_at', 'average_rating',
            'total_reviews', 'is_verified'
        ]
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    
    def get_total_tasks_posted(self, obj):
        return obj.posted_tasks.count()
    
    def get_total_tasks_completed(self, obj):
        return obj.assigned_tasks.filter(status='COMPLETED').count()


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    """
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'bio', 'profile_picture',
            'phone_number', 'city', 'country', 'skills'
        ]
    
    def validate_profile_picture(self, value):
        """Validate image size"""
        if value and value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError(
                'Image file too large. Maximum size is 5MB.'
            )
        return value


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change
    """
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password2 = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        label='Confirm New Password'
    )
    
    def validate(self, attrs):
        """Validate new passwords match"""
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({
                "new_password": "Password fields didn't match."
            })
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password is correct"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value


class PublicUserSerializer(serializers.ModelSerializer):
    """
    Public user info (for displaying in task lists, etc.)
    """
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'profile_picture',
            'city', 'country', 'average_rating', 'total_reviews',
            'is_verified', 'user_type'
        ]
        read_only_fields = fields
    
    def get_full_name(self, obj):
        return obj.get_full_name()