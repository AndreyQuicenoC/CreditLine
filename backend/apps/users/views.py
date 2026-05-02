from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
import jwt
import re
from django.conf import settings
from functools import lru_cache
from apps.users.models import UserProfile
from apps.users.serializers import UserProfileSerializer, UserLoginResponseSerializer
import logging
import json
from supabase import create_client

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_supabase_admin_client():
    """Return a cached Supabase admin client when production credentials are set."""
    supabase_url = getattr(settings, "SUPABASE_URL", "")
    service_role_key = getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not service_role_key:
        return None

    try:
        return create_client(supabase_url, service_role_key)
    except Exception as exc:
        logger.info(f"Supabase admin client unavailable: {str(exc)}")
        return None


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
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check mock_auth_users for stored password (tests store plaintext for simplicity)
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT encrypted_password FROM mock_auth_users WHERE email = %s;", [email])
                row = cursor.fetchone()
        except Exception as e:
            logger.error(f"Error reading mock_auth_users: {e}")
            return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not row:
            logger.warning(f"Login failed: no auth record for email={email}")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        stored_password = row[0]
        if password != stored_password:
            logger.warning(f"Login failed: invalid password for email={email}")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Fetch user profile by email
        try:
            profile = UserProfile.objects.get(email=email)
        except UserProfile.DoesNotExist:
            logger.warning(f"UserProfile not found for email={email}")
            return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

        # Update last access and return token
        profile.update_last_access()
        token = generate_jwt_token(str(profile.auth_id), profile.email)
        logger.info(f"Login successful for user={email}, role={profile.rol}")
        response_data = {
            'user': UserProfileSerializer(profile).data,
            'token': token,
            'message': 'Login successful'
        }
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Log request info for debugging when an unexpected error occurs
        try:
            body = request.body.decode('utf-8', errors='replace')
        except Exception:
            body = '<unreadable>'
        logger.error(f"Login error: {str(e)} | Content-Type: {request.META.get('CONTENT_TYPE')} | Body: {body}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    """
    Get the authenticated user's profile.

    Returns user profile data from user_profiles table.
    Authentication is handled by JWT verification.
    """
    try:
        user_id = request.user.id

        if not user_id:
            return Response(
                {'error': 'Invalid authentication'},
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
        user_id = request.user.id

        if not user_id:
            return Response(
                {'error': 'Invalid authentication'},
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


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def edit_user(request, user_id):
    """
    Edit another user's profile (admin only).

    Allows admin to update nombre and rol of another user.
    """
    try:
        admin_id = request.user.id

        if not admin_id:
            return Response(
                {'error': 'Invalid authentication'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Check if user is admin
        admin_profile = UserProfile.objects.get(auth_id=admin_id)
        if not admin_profile.is_admin:
            logger.warning(f"edit_user: unauthorized access attempt by user={admin_id}")
            return Response(
                {'error': 'Only admins can edit users'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get the user to edit
        target_profile = UserProfile.objects.get(auth_id=user_id)

        # Allow updating nombre, rol and email
        allowed_fields = ['nombre', 'rol', 'email']
        data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = UserProfileSerializer(target_profile, data=data, partial=True)
        if serializer.is_valid():
            new_email = data.get('email')
            if new_email and new_email != target_profile.email:
                supabase_admin = get_supabase_admin_client()
                if supabase_admin is not None:
                    try:
                        supabase_admin.auth.admin.update_user_by_id(user_id, {'email': new_email})
                    except Exception as e:
                        logger.warning(f"edit_user: could not update Supabase auth user: {str(e)}")
                        return Response(
                            {'error': 'No se pudo actualizar el correo en autenticación'},
                            status=status.HTTP_502_BAD_GATEWAY,
                        )

            updated_profile = serializer.save()
            # If email was changed, also update mock_auth_users table if present
            if 'email' in data:
                try:
                    from django.db import connection
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "UPDATE mock_auth_users SET email = %s WHERE auth_id = %s;",
                            [data['email'], user_id]
                        )
                except Exception as e:
                    # It's okay if mock_auth_users doesn't exist in some envs
                    logger.info(f"edit_user: could not update mock_auth_users: {str(e)}")

            logger.info(f"edit_user: admin={admin_profile.email} edited user={updated_profile.email}")
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'User profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error editing user: {str(e)}")
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
        # request.user is already authenticated by JWTAuthentication
        if not request.user or not hasattr(request.user, 'id'):
            logger.warning("list_users: invalid user object")
            return Response(
                {'error': 'Invalid authentication'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user_id = request.user.id

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
        user_id = request.user.id

        if not user_id:
            return Response(
                {'error': 'Invalid authentication'},
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
        elif not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            # Validate email format
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
            logger.warning(f"create_user validation failed: {errors}")
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if UserProfile.objects.filter(email=email).exists():
            return Response(
                {'email': 'Este correo ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user in user_profiles. In production environments with mock_auth_users,
        # we could also store password there, but for simplicity in dev/test, we focus on UserProfile.
        import uuid
        
        new_auth_id = uuid.uuid4()

        try:
            profile = UserProfile.objects.create(
                auth_id=new_auth_id,
                nombre=nombre,
                email=email,
                rol=rol,
                is_active=True,
            )
            logger.info(f"Created UserProfile for {email} (auth_id={new_auth_id})")

            # Optionally, try to store password in mock_auth_users if it exists
            try:
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute(
                        "INSERT INTO mock_auth_users (auth_id, email, encrypted_password) VALUES (%s, %s, %s);",
                        [str(new_auth_id), email, password]
                    )
                    logger.info(f"Also stored password in mock_auth_users for {email}")
            except Exception as e:
                # mock_auth_users doesn't exist or has different schema; that's okay
                logger.info(f"Skipped mock_auth_users storage: {str(e)}")

            serializer = UserProfileSerializer(profile)
            return Response({'user': serializer.data, 'message': f'Usuario "{nombre}" creado exitosamente'}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            return Response({'error': f'Error al crear el usuario: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    If system_config table doesn't exist, returns defaults.
    """
    try:
        user_id = request.user.id

        if not user_id:
            return Response(
                {'error': 'Invalid authentication'},
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
        from django.db.utils import ProgrammingError
        
        try:
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
        except ProgrammingError:
            # Table doesn't exist; return defaults
            logger.info("system_config table doesn't exist, returning defaults")
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
        auth_user_id = request.user.id

        if not auth_user_id:
            return Response(
                {'error': 'Invalid authentication'},
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
        user_id = request.user.id

        if not user_id:
            return Response(
                {'error': 'Invalid authentication'},
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
            logger.warning(f"update_system_config validation failed: {errors}")
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        from django.db import connection
        with connection.cursor() as cursor:
            # Check if system_config exists, if not create one
            cursor.execute("SELECT COUNT(*) FROM system_config;")
            count = cursor.fetchone()[0]
            
            if count == 0:
                # Create initial config (without updated_by to avoid FK constraint issues)
                cursor.execute(
                    """
                    INSERT INTO system_config (tasa_interes, impuesto_retraso)
                    VALUES (%s, %s);
                    """,
                    [tasa_interes or 10.0, impuesto_retraso or 5.0]
                )
                logger.info(f"Created system config by user {user_id}")
            else:
                # Update existing config
                if tasa_interes is not None or impuesto_retraso is not None:
                    update_fields = []
                    update_values = []

                    if tasa_interes is not None:
                        update_fields.append('tasa_interes = %s')
                        update_values.append(tasa_interes)
                    if impuesto_retraso is not None:
                        update_fields.append('impuesto_retraso = %s')
                        update_values.append(impuesto_retraso)

                    # Note: Not updating updated_by to avoid FK constraint issues
                    # (updated_by can be NULL, we just track the values)

                    if update_fields:  # Only execute if there are fields to update
                        cursor.execute(
                            f"""
                            UPDATE system_config
                            SET {', '.join(update_fields)};
                            """,
                            update_values
                        )
                        logger.info(f"Updated system config by user {user_id}")

            # Fetch the current config
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
        logger.error(f"Error updating system config: {str(e)} | Exception type: {type(e).__name__}")
        import traceback
        logger.error(traceback.format_exc())
        return Response(
            {'error': f'Internal server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
