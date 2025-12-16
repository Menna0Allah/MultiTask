from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserDetailSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    PublicUserSerializer
)

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

User = get_user_model()

# ==============================================================================
# Google OAuth2 login view
# ==============================================================================
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

class GoogleLoginView(APIView):
    """
    Handle Google OAuth login with ID token from Google Sign-In
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            # Get the ID token from request
            token = request.data.get('id_token')

            if not token:
                return Response(
                    {'error': 'ID token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the ID token
            client_id = settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                client_id
            )

            # Get user info from token
            email = idinfo.get('email')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            if not email:
                return Response(
                    {'error': 'Email not found in token'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if user exists
            user = User.objects.filter(email=email).first()

            if not user:
                # Create new user
                username = email.split('@')[0]
                # Make username unique if already exists
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    user_type='client',  # Default type
                )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Login successful',
                'user': UserDetailSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            # Invalid token
            return Response(
                {'error': f'Invalid token: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Authentication failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ==============================================================================
# AUTHENTICATION VIEWS
# ==============================================================================

class RegisterView(generics.CreateAPIView):
    """
    Register a new user account
    
    Accepts:
    - username (unique)
    - email (unique)
    - password
    - password2 (confirmation)
    - first_name, last_name
    - user_type (CLIENT, FREELANCER, BOTH)
    - Optional: phone_number, city, country, bio, skills
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    @extend_schema(
        summary="Register new user",
        description="Create a new user account with email and username",
        responses={201: UserDetailSerializer}
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserDetailSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Login with username OR email
    
    Accepts:
    - username_or_email (can be either username or email)
    - password
    
    Returns JWT tokens and user details
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    @extend_schema(
        summary="User login",
        description="Login with username or email and password",
        request=LoginSerializer,
        responses={200: UserDetailSerializer}
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': UserDetailSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout user (blacklist refresh token)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="User logout",
        description="Logout and blacklist the refresh token",
        request=None,
        responses={200: {'description': 'Logout successful'}}
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token view with additional user data
    """
    serializer_class = CustomTokenObtainPairSerializer


# ==============================================================================
# PROFILE VIEWS
# ==============================================================================

class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Get or update current user profile
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserDetailSerializer
        return UserUpdateSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(
        summary="Get current user profile",
        description="Retrieve authenticated user's profile details"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        summary="Update current user profile",
        description="Update authenticated user's profile information"
    )
    def patch(self, request, *args, **kwargs):
        # Store old skills to check if changed
        old_skills = self.request.user.skills

        # Update profile normally
        response = super().patch(request, *args, **kwargs)

        # If skills field was updated, sync with UserSkill model
        if response.status_code == 200 and 'skills' in request.data:
            new_skills = request.data.get('skills', '')

            # Only update if skills actually changed
            if new_skills != old_skills:
                self._sync_user_skills(self.request.user, new_skills)

        return response

    def _sync_user_skills(self, user, skills_text):
        """
        Sync text skills field with UserSkill model
        This ensures structured skills match the text skills for better recommendations
        """
        from recommendations.skill_model import Skill, UserSkill

        # Parse skills from comma-separated text
        skill_names = [s.strip().lower() for s in skills_text.split(',') if s.strip()]

        # Clear existing UserSkill records
        UserSkill.objects.filter(user=user).delete()

        # Try to match text skills with database Skill objects
        matched_skills = []
        for skill_name in skill_names:
            # Try exact match first
            skill = Skill.objects.filter(
                name__iexact=skill_name,
                is_active=True
            ).first()

            if not skill:
                # Try partial match (e.g., "python" matches "Python Programming")
                skill = Skill.objects.filter(
                    name__icontains=skill_name,
                    is_active=True
                ).first()

            if skill:
                # Create UserSkill record
                UserSkill.objects.create(
                    user=user,
                    skill=skill,
                    proficiency='intermediate'
                )
                matched_skills.append(skill.name)

                # Update skill usage count
                skill.usage_count += 1
                skill.save(update_fields=['usage_count'])

        # Log what was matched
        import logging
        logger = logging.getLogger('recommendations')
        logger.info(f"Updated skills for {user.username}: {matched_skills}")

        return matched_skills


class ChangePasswordView(APIView):
    """
    Change user password
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(
        summary="Change password",
        description="Change authenticated user's password",
        request=ChangePasswordSerializer,
        responses={200: {'description': 'Password changed successfully'}}
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        # Change password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class UserDetailView(generics.RetrieveAPIView):
    """
    Get public user profile by ID or username
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'username'
    
    @extend_schema(
        summary="Get user profile",
        description="Retrieve public profile of any user by username"
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class UserListView(generics.ListAPIView):
    """
    List all users (with filters)
    """
    queryset = User.objects.filter(is_active=True)
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['user_type', 'city', 'country', 'is_verified']
    search_fields = ['username', 'first_name', 'last_name', 'skills']
    ordering_fields = ['average_rating', 'total_reviews', 'created_at']
    ordering = ['-average_rating']
    
    @extend_schema(
        summary="List users",
        description="Get list of users with optional filters",
        parameters=[
            OpenApiParameter('user_type', OpenApiTypes.STR, description='Filter by user type'),
            OpenApiParameter('city', OpenApiTypes.STR, description='Filter by city'),
            OpenApiParameter('search', OpenApiTypes.STR, description='Search in username, name, skills'),
        ]
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# ==============================================================================
# HELPER VIEWS
# ==============================================================================

@extend_schema(
    summary="Check username availability",
    description="Check if a username is available",
    parameters=[
        OpenApiParameter('username', OpenApiTypes.STR, OpenApiParameter.QUERY)
    ]
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_username(request):
    """Check if username is available"""
    username = request.query_params.get('username', '')
    
    if not username:
        return Response({
            'error': 'Username parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    is_available = not User.objects.filter(username=username).exists()
    
    return Response({
        'username': username,
        'available': is_available
    })


@extend_schema(
    summary="Check email availability",
    description="Check if an email is available",
    parameters=[
        OpenApiParameter('email', OpenApiTypes.STR, OpenApiParameter.QUERY)
    ]
)
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_email(request):
    """Check if email is available"""
    email = request.query_params.get('email', '')
    
    if not email:
        return Response({
            'error': 'Email parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    is_available = not User.objects.filter(email=email).exists()
    
    return Response({
        'email': email,
        'available': is_available
    })