from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    CustomTokenObtainPairView,
    ProfileView,
    ChangePasswordView,
    UserListView,
    UserDetailView,
    check_username,
    check_email,
    GoogleLoginView,
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # JWT tokens
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    # Public user info
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:username>/', UserDetailView.as_view(), name='user-detail'),
    
    # Helper endpoints
    path('check-username/', check_username, name='check-username'),
    path('check-email/', check_email, name='check-email'),
    
    # Social authentication (Google OAuth)
    path('google/', include('dj_rest_auth.registration.urls')),
    path('google/login/', GoogleLoginView.as_view(), name='google_login'),
    path('google/callback/', GoogleLoginView.as_view(), name='google_callback'),
]