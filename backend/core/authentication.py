import jwt
import logging
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from jwt import ExpiredSignatureError, DecodeError

from apps.users.models import UserProfile

logger = logging.getLogger(__name__)


class JWTAuthentication(BaseAuthentication):
    """
    JWT authentication using HS256 signed tokens.
    Validates Bearer tokens from Authorization header.
    """

    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")

        if not auth_header:
            return None

        if not auth_header.startswith("Bearer "):
            return None

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            raise AuthenticationFailed("Invalid Authorization header format")

        try:
            # ✅ VERIFY SIGNATURE + EXPIRATION
            decoded = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=["HS256"],
            )

            user_id = decoded.get("sub")
            email = decoded.get("email")

            if not user_id or not email:
                logger.warning(f"JWT token missing required fields: user_id={user_id}, email={email}")
                raise AuthenticationFailed("Invalid token payload")

            # OPTIONAL: validate user exists in DB
            user_obj = UserProfile.objects.filter(auth_id=user_id).first()

            if not user_obj:
                logger.warning(f"UserProfile not found for auth_id={user_id}")
                raise AuthenticationFailed("User not found")

            logger.info(f"JWT authentication successful for user={user_obj.email}, role={user_obj.rol}")

            user = JWTUser(
                user_id=user_obj.auth_id,
                email=user_obj.email,
                role=user_obj.rol,
            )

            return (user, token)

        except ExpiredSignatureError:
            logger.warning("JWT token expired")
            raise AuthenticationFailed("Token expired")

        except DecodeError as e:
            logger.warning(f"JWT decode error: {str(e)}")
            raise AuthenticationFailed("Invalid token")

        except Exception as e:
            logger.error(f"JWT authentication error: {str(e)}")
            raise AuthenticationFailed("Authentication failed")

    def authenticate_header(self, request):
        return "Bearer"


class JWTUser:
    def __init__(self, user_id, email=None, role=None):
        self.id = user_id
        self.email = email
        self.role = role
        self.is_authenticated = True
        self.is_active = True

    def __str__(self):
        return f"JWTUser({self.id})"