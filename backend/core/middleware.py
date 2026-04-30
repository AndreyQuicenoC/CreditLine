import logging
import jwt
from django.conf import settings
from django.http import JsonResponse
from rest_framework import status

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware:
    """Add security headers to all responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'

        # HSTS in production
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

        # Content Security Policy
        response['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'"

        return response


class LoggingMiddleware:
    """Log HTTP requests and responses."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request
        logger.info(f"{request.method} {request.path} - User: {request.user}")

        response = self.get_response(request)

        # Log response
        logger.info(f"Response: {response.status_code}")

        return response


class JWTValidationMiddleware:
    """Validate JWT tokens from Supabase Auth."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip validation for certain paths
        excluded_paths = ['/admin/', '/api-auth/']
        if any(request.path.startswith(path) for path in excluded_paths):
            return self.get_response(request)

        # Check for Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

            try:
                # Validate token (signature verification would happen here with Supabase public key)
                # For now, we just decode to extract user info
                decoded = jwt.decode(token, options={"verify_signature": False})

                # Store user info in request for later use
                request.user_id = decoded.get('sub')
                request.user_email = decoded.get('email')

            except jwt.DecodeError as e:
                logger.error(f"JWT decode error: {str(e)}")
                return JsonResponse(
                    {'error': 'Invalid token'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except Exception as e:
                logger.error(f"Token validation error: {str(e)}")
                return JsonResponse(
                    {'error': 'Token validation failed'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        return self.get_response(request)
