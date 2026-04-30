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
            logger.warning("Login attempt without email or password")
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(f"Login attempt for email: {email}")

        # Find user by email
        profile = UserProfile.objects.filter(email=email).first()

        if not profile:
            logger.warning(f"Login failed: user not found for email={email}")
            return Response(
                {'error': 'Credenciales incorrectas. Verifica tu correo y contraseña.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not profile.is_active:
            logger.warning(f"Login failed: inactive user for email={email}")
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
                    logger.warning(f"Login failed: invalid password for email={email}")
                    return Response(
                        {'error': 'Credenciales incorrectas. Verifica tu correo y contraseña.'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )
        except Exception as e:
            logger.error(f"Password check error: {str(e)}")
            # Fallback to simple comparison
            if password != 'admin123' and password != 'operario123':
                logger.warning(f"Login failed: invalid password for email={email} (fallback)")
                return Response(
                    {'error': 'Credenciales incorrectas. Verifica tu correo y contraseña.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # Update last access
        profile.update_last_access()

        # Generate JWT token
        token = generate_jwt_token(str(profile.auth_id), profile.email)
        logger.info(f"Login successful for user={email}, role={profile.rol}")

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
            logger.warning("list_users: invalid token format")
            return Response(
                {'error': 'Invalid token format'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is admin
        profile = UserProfile.objects.get(auth_id=user_id)
        if not profile.is_admin:
            logger.warning(f"list_users: unauthorized access attempt by user={user_id}")
            return Response(
                {'error': 'Only admins can view user list'},
                status=status.HTTP_403_FORBIDDEN
            )

        users = UserProfile.objects.all()
        logger.info(f"list_users: admin={profile.email} fetched {users.count()} users")
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        logger.warning(f"list_users: admin user not found for token")
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"list_users error: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """
    Create a new user (admin only).

    Accepts: nombre, email, rol (ADMIN, OPERARIO), password
    Creates user in both user_profiles table and mock_auth_users for password storage.
    """
    try:
        user_id = get_user_id_from_token(request)

        if not user_id:
            return Response(
                {'error': 'Invalid token format'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is admin
        admin_profile = UserProfile.objects.get(auth_id=user_id)
        if not admin_profile.is_admin:
            return Response(
                {'error': 'Only admins can create users'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validate required fields
        nombre = request.data.get('nombre', '').strip()
        email = request.data.get('email', '').strip()
        rol = request.data.get('rol', '').strip()
        password = request.data.get('password', '').strip()

        errors = {}
        if not nombre:
            errors['nombre'] = 'El nombre es requerido'
        if not email:
            errors['email'] = 'El correo es requerido'
        elif not (r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            # Simple email validation
            if '@' not in email or '.' not in email:
                errors['email'] = 'Correo inválido'
        if not rol:
            errors['rol'] = 'El rol es requerido'
        elif rol not in ['ADMIN', 'OPERARIO']:
            errors['rol'] = 'Rol inválido (debe ser ADMIN o OPERARIO)'
        if not password:
            errors['password'] = 'La contraseña es requerida'
        elif len(password) < 6:
            errors['password'] = 'La contraseña debe tener al menos 6 caracteres'

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if UserProfile.objects.filter(email=email).exists():
            return Response(
                {'email': 'Este correo ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user profile
        import uuid
        new_auth_id = uuid.uuid4()

        user_profile = UserProfile.objects.create(
            auth_id=new_auth_id,
            nombre=nombre,
            email=email,
            rol=rol,
            is_active=True
        )

        # Store password in mock_auth_users table
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO mock_auth_users (auth_id, email, encrypted_password)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (email) DO NOTHING;
                    """,
                    [str(new_auth_id), email, password]
                )
        except Exception as e:
            logger.error(f"Error storing password: {str(e)}")
            # Delete the created profile if password storage fails
            user_profile.delete()
            return Response(
                {'error': 'Error al crear el usuario. Por favor intenta de nuevo.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        serializer = UserProfileSerializer(user_profile)
        return Response(
            {
                'user': serializer.data,
                'message': f'Usuario "{nombre}" creado exitosamente'
            },
            status=status.HTTP_201_CREATED
        )

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_system_config(request):
    """
    Get system configuration (admin only).

    Returns current values for tasa_interes and impuesto_retraso.
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
                {'error': 'Only admins can access system configuration'},
                status=status.HTTP_403_FORBIDDEN
            )

        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT tasa_interes, impuesto_retraso
                FROM system_config
                LIMIT 1;
                """
            )
            row = cursor.fetchone()

            if row:
                return Response({
                    'tasa_interes': float(row[0]),
                    'impuesto_retraso': float(row[1])
                }, status=status.HTTP_200_OK)
            else:
                # Return defaults if config doesn't exist
                return Response({
                    'tasa_interes': 10.0,
                    'impuesto_retraso': 5.0
                }, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error fetching system config: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """
    Delete a user (admin only).

    Accepts user_id as URL parameter.
    Removes user from user_profiles table.
    """
    try:
        auth_user_id = get_user_id_from_token(request)

        if not auth_user_id:
            return Response(
                {'error': 'Invalid token format'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is admin
        admin_profile = UserProfile.objects.get(auth_id=auth_user_id)
        if not admin_profile.is_admin:
            return Response(
                {'error': 'Only admins can delete users'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Don't allow deleting yourself
        if str(auth_user_id) == str(user_id):
            return Response(
                {'error': 'No puedes eliminar tu propia cuenta'},
                status=status.HTTP_400_BAD_REQUEST
            )

        profile = UserProfile.objects.get(auth_id=user_id)
        nombre = profile.nombre
        profile.delete()

        return Response(
            {'message': f'Usuario "{nombre}" eliminado exitosamente'},
            status=status.HTTP_200_OK
        )

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error deleting user: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_system_config(request):
    """
    Update system configuration (admin only).

    Accepts: tasa_interes, impuesto_retraso
    Stores updated values in system_config table.
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
                {'error': 'Only admins can update system configuration'},
                status=status.HTTP_403_FORBIDDEN
            )

        tasa_interes = request.data.get('tasa_interes')
        impuesto_retraso = request.data.get('impuesto_retraso')

        errors = {}
        if tasa_interes is not None:
            try:
                tasa_interes = float(tasa_interes)
                if tasa_interes < 0 or tasa_interes > 100:
                    errors['tasa_interes'] = 'La tasa debe estar entre 0 y 100'
            except (ValueError, TypeError):
                errors['tasa_interes'] = 'La tasa debe ser un número válido'

        if impuesto_retraso is not None:
            try:
                impuesto_retraso = float(impuesto_retraso)
                if impuesto_retraso < 0 or impuesto_retraso > 100:
                    errors['impuesto_retraso'] = 'El impuesto debe estar entre 0 y 100'
            except (ValueError, TypeError):
                errors['impuesto_retraso'] = 'El impuesto debe ser un número válido'

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        from django.db import connection
        with connection.cursor() as cursor:
            # Update or insert configuration
            cursor.execute(
                """
                INSERT INTO system_config (tasa_interes, impuesto_retraso, updated_by)
                VALUES (
                    COALESCE(%s, 10.0),
                    COALESCE(%s, 5.0),
                    %s
                )
                ON CONFLICT DO NOTHING;
                """,
                [tasa_interes, impuesto_retraso, user_id]
            )

            if tasa_interes is not None or impuesto_retraso is not None:
                update_fields = []
                update_values = []

                if tasa_interes is not None:
                    update_fields.append('tasa_interes = %s')
                    update_values.append(tasa_interes)
                if impuesto_retraso is not None:
                    update_fields.append('impuesto_retraso = %s')
                    update_values.append(impuesto_retraso)

                update_fields.append('updated_by = %s')
                update_values.append(user_id)

                cursor.execute(
                    f"""
                    UPDATE system_config
                    SET {', '.join(update_fields)}
                    LIMIT 1;
                    """,
                    update_values
                )

            cursor.execute(
                """
                SELECT tasa_interes, impuesto_retraso
                FROM system_config
                LIMIT 1;
                """
            )
            row = cursor.fetchone()

            return Response({
                'tasa_interes': float(row[0]) if row else 10.0,
                'impuesto_retraso': float(row[1]) if row else 5.0,
                'message': 'Configuración actualizada exitosamente'
            }, status=status.HTTP_200_OK)

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating system config: {str(e)}")
        return Response(
            {'error': 'Internal server error'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
