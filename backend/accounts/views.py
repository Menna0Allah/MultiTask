from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Q
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserDetailSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
    PublicUserSerializer,
    PortfolioItemSerializer,
    PortfolioItemUpdateSerializer
)
from .models import PortfolioItem

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
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['city', 'country', 'is_verified']
    search_fields = ['username', 'first_name', 'last_name', 'skills']
    ordering_fields = ['average_rating', 'total_reviews', 'created_at']
    ordering = ['-average_rating']

    def get_queryset(self):
        queryset = User.objects.filter(is_active=True)

        # Handle user_type filter with case-insensitivity and include 'both'
        user_type = self.request.query_params.get('user_type', '').lower()
        if user_type:
            if user_type == 'freelancer':
                # Include both 'freelancer' and 'both' users
                queryset = queryset.filter(
                    Q(user_type__iexact='freelancer') | Q(user_type__iexact='both')
                )
            elif user_type == 'client':
                # Include both 'client' and 'both' users
                queryset = queryset.filter(
                    Q(user_type__iexact='client') | Q(user_type__iexact='both')
                )
            else:
                queryset = queryset.filter(user_type__iexact=user_type)

        return queryset

    @extend_schema(
        summary="List users",
        description="Get list of users with optional filters",
        parameters=[
            OpenApiParameter('user_type', OpenApiTypes.STR, description='Filter by user type (freelancer, client, both)'),
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


# ==============================================================================
# Email Verification Views
# ==============================================================================
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string


class ResendVerificationEmailView(APIView):
    """Resend email verification link"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {'detail': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

            # Check if already verified
            if user.is_email_verified:
                return Response(
                    {'detail': 'Email is already verified'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Generate verification token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Create verification link
            verification_link = f"{settings.FRONTEND_URL}/verify-email?token={token}&uid={uid}&email={email}"

            # Send email
            subject = 'Verify Your Email - MultiTask'
            message = f"""
            Hi {user.first_name or user.username},

            Please verify your email address by clicking the link below:

            {verification_link}

            This link will expire in 24 hours.

            If you didn't create an account on MultiTask, please ignore this email.

            Best regards,
            The MultiTask Team
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response(
                {'detail': 'Verification email sent successfully'},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response(
                {'detail': 'If this email exists, a verification link has been sent'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(f"Error sending verification email: {str(e)}")
            return Response(
                {'detail': 'Failed to send verification email. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VerifyEmailView(APIView):
    """Verify email address with token"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        uid = request.data.get('uid')

        if not token or not uid:
            return Response(
                {'detail': 'Token and UID are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'detail': 'Invalid or expired verification link'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark email as verified
            user.is_email_verified = True
            user.save()

            return Response(
                {'detail': 'Email verified successfully'},
                status=status.HTTP_200_OK
            )

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'detail': 'Invalid verification link'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ==============================================================================
# Password Reset Views
# ==============================================================================

class PasswordResetRequestView(APIView):
    """Request password reset email"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response(
                {'detail': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Create reset link
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}&uid={uid}"

            # Send email
            subject = 'Password Reset - MultiTask'
            message = f"""
            Hi {user.first_name or user.username},

            You requested to reset your password. Click the link below to reset it:

            {reset_link}

            This link will expire in 24 hours.

            If you didn't request this, please ignore this email.

            Best regards,
            The MultiTask Team
            """

            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )

            return Response(
                {'detail': 'Password reset email sent successfully'},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            # Don't reveal if email exists for security
            return Response(
                {'detail': 'If this email exists, a password reset link has been sent'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            print(f"Error sending password reset email: {str(e)}")
            return Response(
                {'detail': 'Failed to send password reset email. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        uid = request.data.get('uid')
        new_password = request.data.get('new_password')
        new_password2 = request.data.get('new_password2')

        if not all([token, uid, new_password, new_password2]):
            return Response(
                {'detail': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != new_password2:
            return Response(
                {'detail': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'detail': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response(
                    {'detail': 'Invalid or expired reset link'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Set new password
            user.set_password(new_password)
            user.save()

            return Response(
                {'detail': 'Password reset successfully'},
                status=status.HTTP_200_OK
            )

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'detail': 'Invalid reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )


# ==============================================================================
# Portfolio Views
# ==============================================================================

class PortfolioItemListCreateView(generics.ListCreateAPIView):
    """
    List all portfolio items for a user or create a new one
    GET: /api/auth/users/{user_id}/portfolio/
    POST: /api/auth/portfolio/
    """
    serializer_class = PortfolioItemSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # If viewing a specific user's portfolio
        user_id = self.kwargs.get('user_id')
        if user_id:
            return PortfolioItem.objects.filter(user_id=user_id)
        # Otherwise, return the authenticated user's portfolio
        return PortfolioItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PortfolioItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a portfolio item
    GET/PUT/PATCH/DELETE: /api/auth/portfolio/{id}/
    """
    queryset = PortfolioItem.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PortfolioItemUpdateSerializer
        return PortfolioItemSerializer

    def get_queryset(self):
        # Users can only access their own portfolio items
        return PortfolioItem.objects.filter(user=self.request.user)


class UserPortfolioListView(generics.ListAPIView):
    """
    Public view to list a user's portfolio items
    GET: /api/auth/users/{username}/portfolio/
    """
    serializer_class = PortfolioItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        username = self.kwargs.get('username')
        return PortfolioItem.objects.filter(user__username=username)


# ==============================================================================
# Account Deletion View
# ==============================================================================

class DeleteAccountView(APIView):
    """
    Delete user account permanently
    """
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Delete account",
        description="Permanently delete the authenticated user's account",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'password': {'type': 'string', 'description': 'Current password for verification'},
                    'confirmation': {'type': 'string', 'description': 'Must be "DELETE" to confirm'},
                },
                'required': ['password', 'confirmation']
            }
        },
        responses={200: {'description': 'Account deleted successfully'}}
    )
    def post(self, request):
        password = request.data.get('password')
        confirmation = request.data.get('confirmation')

        # Validate password
        if not password:
            return Response(
                {'error': 'Password is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(password):
            return Response(
                {'error': 'Incorrect password'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate confirmation
        if confirmation != 'DELETE':
            return Response(
                {'error': 'Please type DELETE to confirm account deletion'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for active tasks
        active_tasks = request.user.posted_tasks.filter(
            status__in=['OPEN', 'IN_PROGRESS']
        ).count()

        active_applications = request.user.applications.filter(
            status='ACCEPTED',
            task__status='IN_PROGRESS'
        ).count()

        if active_tasks > 0:
            return Response(
                {'error': f'You have {active_tasks} active task(s). Please complete or cancel them before deleting your account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if active_applications > 0:
            return Response(
                {'error': f'You have {active_applications} active job(s) in progress. Please complete them before deleting your account.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Delete the user
        user = request.user
        username = user.username

        # Soft delete - mark as inactive instead of hard delete
        user.is_active = False
        user.email = f"deleted_{user.id}_{user.email}"  # Prevent email reuse issues
        user.save()

        # Log the deletion
        import logging
        logger = logging.getLogger('accounts')
        logger.info(f"User account deleted: {username} (ID: {user.id})")

        return Response({
            'message': 'Your account has been successfully deleted.'
        }, status=status.HTTP_200_OK)