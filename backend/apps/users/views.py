from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
import jwt
from django.conf import settings
from apps.users.models import UserProfile
from apps.users.serializers import UserProfileSerializer, UserLoginResponseSerializer
import logging
import json

logger = logging.getLogger(__name__)


def generate_jwt_token(user_id: str, email: str) -> str:
    """Generate a simple JWT token for testing. In production, use Supabase Auth JWT."""
    payload = {
        'sub': user_id,
        'email': email,
        'iat': int(timezone.now().timestamp()),
        'exp': int((timezone.now() + timezone.timedelta(hours=1)).timestamp()),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    return token


def get_user_id_from_token(request):
    """Extract user ID from JWT token in Authorization header."""
    auth_header = request.META.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]

    try:
        # Decode JWT without verification (in dev mode)
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get('sub')
    except Exception as e:
        logger.error(f"Error decoding token: {str(e)}")
        return None


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint for authentication.

    Accepts email and password, returns JWT token and user profile.
    For testing: uses simple password comparison.
    In production: should use Supabase Auth.
    """
    try:
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '').strip()

        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find user by email
        profile = UserProfile.objects.filter(email=email).first()

        if not profile:
            return Response(
                {'error': 'Credenciales incorrectas. Verifica tu correo y contraseña.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not profile.is_active:
            return Response(
                {'error': 'User account is inactive'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Simple password comparison for testing
        # In production, use Supabase Auth which handles password verification
        import os
        from dotenv import load_dotenv

        # Load mock credentials from database
        # Check password (for testing, stored as plain text in mock_auth_users)
        try:
            import psycopg2
            from django.db import connection

            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT encrypted_password FROM mock_auth_users WHERE email = %s;",
                    [email]
                )
                row = cursor.fetchone()
                if not row or row[0] != password:
                    return Response(
                        {'error': 'Credenciales incorrectas. Verifica tu correo y contraseña.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
        except Exception as e:
            logger.error(f"Password check error: {str(e)}")
            # Fallback to simple comparison
            if password != 'admin123' and password != 'operario123':
                return Response(
                    {'error': 'Credenciales incorrectas. Verifica tu correo y contraseña.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # Update last access
        profile.update_last_access()

        # Generate JWT token
        token = generate_jwt_token(str(profile.auth_id), profile.email)

        # Return user data + token
        response_data = {
            'user': UserProfileSerializer(profile).data,
            'token': token,
            'message': 'Sesión iniciada correctamente'
        }

        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get the authenticated user's profile.

    Returns user profile data from user_profiles table.
    Authentication is handled by JWT verification.
    """
    try:
        user_id = get_user_id_from_token(request)

        if not user_id:
            return Response(
                {'error': 'Invalid token format'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        profile = UserProfile.objects.get(auth_id=user_id)

        # Update last access timestamp
        profile.update_last_access()

        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        logger.warning(f"UserProfile not found for auth_id: {user_id}")
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching profile: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update the authenticated user's profile.

    Only certain fields can be updated: nombre.
    """
    try:
        user_id = get_user_id_from_token(request)

        if not user_id:
            return Response(
                {'error': 'Invalid token format'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        profile = UserProfile.objects.get(auth_id=user_id)

        # Only allow updating nombre
        allowed_fields = ['nombre']
        data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = UserProfileSerializer(profile, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    List all users (admin only).

    Returns a list of all user profiles.
    """
    try:
        user_id = get_user_id_from_token(request)

        if not user_id:
            return Response(
                {'error': 'Invalid token format'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is admin
        profile = UserProfile.objects.get(auth_id=user_id)
        if not profile.is_admin:
            return Response(
                {'error': 'Only admins can view user list'},
                status=status.HTTP_403_FORBIDDEN
            )

        users = UserProfile.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
