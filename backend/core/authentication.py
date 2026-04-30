import jwt
import logging
from django.conf import settings
from rest_framework import status
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)


class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT authentication backend for DRF.
    Validates JWT tokens from Authorization header (Bearer token).
    """

    def authenticate(self, request):
        """
        Authenticate request using JWT token from Authorization header.
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if not auth_header:
            return None  # No authentication provided

        # Check if it's a Bearer token
        if not auth_header.startswith('Bearer '):
            return None

        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed('Invalid Authorization header format')

        try:
            # Decode JWT without signature verification (development mode)
            # In production, verify with Supabase or other auth provider
            decoded = jwt.decode(
                token,
                options={"verify_signature": False}
            )

            user_id = decoded.get('sub')
            email = decoded.get('email')

            if not user_id:
                raise AuthenticationFailed('Invalid token: missing user ID')

            # Create a simple user object for DRF
            # This satisfies the IsAuthenticated permission class
            user = JWTUser(user_id=user_id, email=email)
            return (user, token)

        except jwt.DecodeError as e:
            logger.error(f"JWT decode error: {str(e)}")
            raise AuthenticationFailed('Invalid token')
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            raise AuthenticationFailed('Token validation failed')

    def authenticate_header(self, request):
        """Return authentication header name."""
        return 'Bearer'


class JWTUser:
    """
    Minimal user object for JWT authentication.
    Satisfies DRF's IsAuthenticated permission requirements.
    """

    def __init__(self, user_id, email=None):
        self.id = user_id
        self.email = email
        self.is_authenticated = True
        self.is_active = True

    def __str__(self):
        return f"JWTUser({self.id})"
