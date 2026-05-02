"""
Operario App API Views

RESTful API endpoints for operario section.
All endpoints require authentication via JWT token.
"""
import logging
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.core.paginator import Paginator

from .models import Municipio, Cliente, Deuda, Abono, DeudaPersonal, PagoPersonal
from .serializers import (
    MunicipioSerializer, ClienteListSerializer, ClienteDetailSerializer,
    DeudaSerializer, AbonoSerializer, DeudaPersonalSerializer,
    PagoPersonalSerializer, EstadisticasSerializer, FinanzasPersonalesResumenSerializer
)
from .services import (
    EstadisticasService, ClienteService, DeudaService, FinanzasPersonalesService
)

logger = logging.getLogger(__name__)


# ── Municipios Endpoints ────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_municipios(request):
    """
    List all active municipalities.
    
    Query Params:
        - include_inactive (bool): Include inactive municipalities (default: False)
    
    Returns:
        list: Municipios data
    """
    try:
        include_inactive = request.query_params.get('include_inactive', 'false').lower() == 'true'
        
        if include_inactive:
            municipios = Municipio.objects.all()
        else:
            municipios = Municipio.objects.filter(activo=True)
        
        serializer = MunicipioSerializer(municipios, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': len(serializer.data)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error listing municipios: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def municipio_detail(request, municipio_id):
    """
    Get municipality detail with client statistics.
    
    Args:
        municipio_id: Municipality ID
    
    Returns:
        dict: Municipio with stats
    """
    try:
        municipio = Municipio.objects.get(id=municipio_id)
        serializer = MunicipioSerializer(municipio)
        
        # Get stats for this municipio
        clientes = Cliente.objects.filter(municipio=municipio, activo=True)
        total_clientes = clientes.count()
        
        from decimal import Decimal
        total_saldo = sum(
            Decimal(str(c.saldo_total)) for c in clientes
        ) or Decimal('0')
        
        return Response({
            'success': True,
            'data': {
                'municipio': serializer.data,
                'total_clientes': total_clientes,
                'saldo_total': str(total_saldo),
            }
        }, status=status.HTTP_200_OK)
    
    except Municipio.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Municipio not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching municipio detail: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Cartera (Clients) Endpoints ─────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_clientes(request):
    """
    List all clients with pagination and filtering.
    
    Query Params:
        - page (int): Page number (default: 1)
        - page_size (int): Items per page (default: 10)
        - search (str): Search by name or cedula
        - municipio_id (str): Filter by municipality
        - activo (bool): Filter by active status
    
    Returns:
        dict: Paginated cliente list
    """
    try:
        # Build filter
        queryset = Cliente.objects.all()
        
        # Search filter
        search_term = request.query_params.get('search', '').strip()
        if search_term:
            queryset = queryset.filter(
                Q(nombre__icontains=search_term) |
                Q(cedula__icontains=search_term) |
                Q(email__icontains=search_term)
            )
        
        # Municipality filter
        municipio_id = request.query_params.get('municipio_id', '').strip()
        if municipio_id:
            queryset = queryset.filter(municipio_id=municipio_id)
        
        # Active filter
        activo_param = request.query_params.get('activo', 'true').lower()
        if activo_param in ['true', 'false']:
            queryset = queryset.filter(activo=activo_param == 'true')
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = ClienteListSerializer(page_obj.object_list, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': paginator.count,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_prev': page_obj.has_previous(),
            }
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response({
            'success': False,
            'error': 'Invalid pagination parameters'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error listing clientes: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cliente_detail(request, cliente_id):
    """
    Get detailed client information with all debts.
    
    Args:
        cliente_id: Client ID
    
    Returns:
        dict: Cliente with full details
    """
    try:
        cliente = Cliente.objects.get(id=cliente_id)
        serializer = ClienteDetailSerializer(cliente)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Cliente.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Cliente not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching cliente detail: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Deudas Endpoints ────────────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_deudas(request):
    """
    List all debts with filtering.
    
    Query Params:
        - page (int): Page number (default: 1)
        - page_size (int): Items per page (default: 10)
        - cliente_id (str): Filter by client
        - estado (str): Filter by status (activa/pagada/atrasada/cancelada)
        - atrasadas_only (bool): Show only overdue debts
    
    Returns:
        dict: Paginated deudas list
    """
    try:
        queryset = Deuda.objects.select_related('cliente').all()
        
        # Client filter
        cliente_id = request.query_params.get('cliente_id', '').strip()
        if cliente_id:
            queryset = queryset.filter(cliente_id=cliente_id)
        
        # Status filter
        estado = request.query_params.get('estado', '').strip()
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Overdue filter
        atrasadas_only = request.query_params.get('atrasadas_only', 'false').lower() == 'true'
        if atrasadas_only:
            queryset = queryset.filter(
                abonos__atrasado=True,
                estado='activa'
            ).distinct()
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = DeudaSerializer(page_obj.object_list, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': paginator.count,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_prev': page_obj.has_previous(),
            }
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response({
            'success': False,
            'error': 'Invalid pagination parameters'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error listing deudas: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deuda_detail(request, deuda_id):
    """
    Get detailed debt information with all payments.
    
    Args:
        deuda_id: Debt ID
    
    Returns:
        dict: Deuda with full details
    """
    try:
        deuda = Deuda.objects.get(id=deuda_id)
        serializer = DeudaSerializer(deuda)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Deuda.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Deuda not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching deuda detail: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Estadísticas Endpoints ──────────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics.
    
    Returns:
        dict: Complete dashboard stats
    """
    try:
        stats = EstadisticasService.get_dashboard_stats()
        serializer = EstadisticasSerializer(stats)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def municipios_stats(request):
    """
    Get statistics by municipality.
    
    Returns:
        list: Stats grouped by municipio
    """
    try:
        stats = EstadisticasService.get_municipios_stats()
        
        return Response({
            'success': True,
            'data': stats,
            'count': len(stats)
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error fetching municipios stats: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deudas_stats(request):
    """
    Get statistics by debt status.
    
    Returns:
        dict: Deudas breakdown
    """
    try:
        stats = EstadisticasService.get_deudas_stats()
        
        return Response({
            'success': True,
            'data': stats
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error fetching deudas stats: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ── Finanzas Personales Endpoints ───────────────────────────────────────────
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def finanzas_personales_summary(request):
    """
    Get operator's personal finances summary.
    
    Returns:
        dict: Personal finances stats
    """
    try:
        summary = FinanzasPersonalesService.get_personal_finances_summary()
        serializer = FinanzasPersonalesResumenSerializer(summary)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error fetching finanzas personales: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_deudas_personales(request):
    """
    List operator's personal debts.
    
    Query Params:
        - page (int): Page number (default: 1)
        - page_size (int): Items per page (default: 10)
        - estado (str): Filter by status
    
    Returns:
        dict: Paginated personal debts
    """
    try:
        queryset = DeudaPersonal.objects.all()
        
        # Status filter
        estado = request.query_params.get('estado', '').strip()
        if estado:
            queryset = queryset.filter(estado=estado)
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = DeudaPersonalSerializer(page_obj.object_list, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': paginator.count,
                'total_pages': paginator.num_pages,
                'has_next': page_obj.has_next(),
                'has_prev': page_obj.has_previous(),
            }
        }, status=status.HTTP_200_OK)
    
    except ValueError as e:
        return Response({
            'success': False,
            'error': 'Invalid pagination parameters'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error listing deudas personales: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def deuda_personal_detail(request, deuda_personal_id):
    """
    Get personal debt detail with payments.
    
    Args:
        deuda_personal_id: Personal debt ID
    
    Returns:
        dict: Deuda personal with full details
    """
    try:
        deuda = DeudaPersonal.objects.get(id=deuda_personal_id)
        serializer = DeudaPersonalSerializer(deuda)
        
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    except DeudaPersonal.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Deuda personal not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error fetching deuda personal detail: {str(e)}")
        return Response({
            'success': False,
            'error': 'Internal server error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
