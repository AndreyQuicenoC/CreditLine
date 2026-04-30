from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
import jwt
from django.conf import settings
from apps.users.models import UserProfile
from apps.users.serializers import UserProfileSerializer
import logging

logger = logging.getLogger(__name__)


def get_user_id_from_token(request):
    """Extract user ID from JWT token in Authorization header."""
    auth_header = request.META.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None

    token = auth_header.split(' ')[1]

    try:
        # Decode JWT without verification (Supabase signature is verified by middleware)
        # The middleware ensures the token is valid
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded.get('sub')  # 'sub' is the user ID in Supabase JWT
    except Exception as e:
        logger.error(f"Error decoding token: {str(e)}")
        return None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get the authenticated user's profile.

    Returns user profile data from user_profiles table.
    Authentication is handled by Supabase JWT verification.
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
