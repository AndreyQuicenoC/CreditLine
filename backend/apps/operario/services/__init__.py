"""
Operario Service Layer

High-level business logic for operario operations.
Handles statistics, calculations, and complex queries.
"""
from decimal import Decimal
from django.db.models import Sum, Q, Count, F, Case, When, DecimalField
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Cliente, Deuda, Abono, DeudaPersonal, PagoPersonal, Municipio


class EstadisticasService:
    """Aggregated statistics for dashboard."""
    
    @staticmethod
    def get_dashboard_stats():
        """
        Calculate dashboard statistics.
        
        Returns:
            dict: Complete statistics for dashboard display
        """
        # Client stats
        total_clientes = Cliente.objects.count()
        clientes_activos = Cliente.objects.filter(activo=True).count()
        
        # Debt stats
        total_capital = Deuda.objects.aggregate(
            total=Sum('monto', output_field=DecimalField())
        )['total'] or Decimal('0')
        
        total_recuperado = Abono.objects.aggregate(
            total=Sum('monto', output_field=DecimalField())
        )['total'] or Decimal('0')
        
        # Outstanding balance
        total_saldo = Decimal('0')
        for deuda in Deuda.objects.filter(estado='activa'):
            pagado = deuda.abonos_set.aggregate(
                total=Sum('monto')
            )['total'] or Decimal('0')
            total_saldo += max(Decimal('0'), deuda.monto - pagado)
        
        # Interest calculation (simplified)
        total_intereses = Decimal('0')
        for deuda in Deuda.objects.filter(estado='activa'):
            total_intereses += Decimal(str(deuda.interes_acumulado))
        
        # Debt status counts
        deudas_activas = Deuda.objects.filter(estado='activa').count()
        deudas_atrasadas = Abono.objects.filter(atrasado=True).values('deuda').distinct().count()
        deudas_pagadas = Deuda.objects.filter(estado='pagada').count()
        
        # Compliance rate
        total_abonos = Abono.objects.count()
        abonos_puntuales = Abono.objects.filter(atrasado=False).count()
        tasa_cumplimiento = (
            Decimal(abonos_puntuales) / Decimal(total_abonos) * Decimal('100')
            if total_abonos > 0 else Decimal('100')
        )
        
        # Municipalities
        municipios_cubiertos = Municipio.objects.filter(activo=True).count()
        
        return {
            'total_clientes': total_clientes,
            'clientes_activos': clientes_activos,
            'total_capital_prestado': total_capital,
            'total_capital_recuperado': total_recuperado,
            'total_saldo_pendiente': total_saldo,
            'total_intereses_generados': total_intereses,
            'deudas_activas': deudas_activas,
            'deudas_atrasadas': deudas_atrasadas,
            'deudas_pagadas': deudas_pagadas,
            'tasa_cumplimiento': tasa_cumplimiento,
            'municipios_cubiertos': municipios_cubiertos,
        }
    
    @staticmethod
    def get_cartera_stats():
        """
        Calculate portfolio statistics (summary for Cartera page).
        
        Returns:
            dict: Portfolio summary data
        """
        stats = EstadisticasService.get_dashboard_stats()
        
        return {
            'total_clientes': stats['total_clientes'],
            'total_capital_prestado': stats['total_capital_prestado'],
            'total_capital_recuperado': stats['total_capital_recuperado'],
            'total_saldo_pendiente': stats['total_saldo_pendiente'],
            'tasa_cumplimiento': stats['tasa_cumplimiento'],
            'deudas_activas': stats['deudas_activas'],
        }
    
    @staticmethod
    def get_municipios_stats():
        """
        Get statistics grouped by municipality.
        
        Returns:
            list: Statistics per municipality
        """
        municipios = Municipio.objects.filter(activo=True)
        stats = []
        
        for municipio in municipios:
            clientes = Cliente.objects.filter(municipio=municipio, activo=True)
            total_clientes = clientes.count()
            
            total_saldo = Decimal('0')
            for cliente in clientes:
                total_saldo += Decimal(str(cliente.saldo_total))
            
            stats.append({
                'municipio_id': municipio.id,
                'municipio_nombre': municipio.nombre,
                'total_clientes': total_clientes,
                'saldo_total': total_saldo,
            })
        
        return sorted(stats, key=lambda x: x['saldo_total'], reverse=True)
    
    @staticmethod
    def get_deudas_stats():
        """
        Get debt statistics by status and timeline.
        
        Returns:
            dict: Deudas breakdown
        """
        deudas_activas = Deuda.objects.filter(estado='activa').count()
        deudas_pagadas = Deuda.objects.filter(estado='pagada').count()
        deudas_atrasadas = Abono.objects.filter(atrasado=True).values('deuda').distinct().count()
        deudas_canceladas = Deuda.objects.filter(estado='cancelada').count()
        
        return {
            'activas': deudas_activas,
            'pagadas': deudas_pagadas,
            'atrasadas': deudas_atrasadas,
            'canceladas': deudas_canceladas,
            'total': deudas_activas + deudas_pagadas + deudas_canceladas,
        }


class ClienteService:
    """Business logic for cliente operations."""
    
    @staticmethod
    def get_cliente_with_stats(cliente_id: str):
        """
        Get cliente with full statistics.
        
        Args:
            cliente_id: Client ID
            
        Returns:
            dict: Cliente data with stats
        """
        try:
            cliente = Cliente.objects.get(id=cliente_id)
        except Cliente.DoesNotExist:
            return None
        
        deudas = cliente.deudas_set.all()
        total_saldo = Decimal('0')
        deudas_activas = 0
        deudas_atrasadas = 0
        
        for deuda in deudas:
            if deuda.estado == 'activa':
                deudas_activas += 1
                pagado = deuda.abonos_set.aggregate(
                    total=Sum('monto')
                )['total'] or Decimal('0')
                total_saldo += max(Decimal('0'), deuda.monto - pagado)
                
                if deuda.abonos_set.filter(atrasado=True).exists():
                    deudas_atrasadas += 1
        
        return {
            'cliente': cliente,
            'saldo_total': total_saldo,
            'deudas_activas': deudas_activas,
            'deudas_atrasadas': deudas_atrasadas,
            'total_deudas': deudas.count(),
        }
    
    @staticmethod
    def get_clientes_by_municipio(municipio_id: str):
        """
        Get all active clientes in a municipality.
        
        Args:
            municipio_id: Municipality ID
            
        Returns:
            QuerySet: Filtered clientes
        """
        return Cliente.objects.filter(
            municipio_id=municipio_id,
            activo=True
        ).order_by('-fecha_registro')
    
    @staticmethod
    def search_clientes(search_term: str):
        """
        Search clientes by name or cedula.
        
        Args:
            search_term: Search query
            
        Returns:
            QuerySet: Matching clientes
        """
        return Cliente.objects.filter(
            Q(nombre__icontains=search_term) |
            Q(cedula__icontains=search_term) |
            Q(email__icontains=search_term),
            activo=True
        ).order_by('nombre')


class DeudaService:
    """Business logic for debt operations."""
    
    @staticmethod
    def get_deudas_activas():
        """Get all active debts."""
        return Deuda.objects.filter(estado='activa').select_related('cliente')
    
    @staticmethod
    def get_deudas_atrasadas():
        """
        Get debts with overdue payments.
        
        Returns:
            QuerySet: Deudas with late abonos
        """
        return Deuda.objects.filter(
            abonos__atrasado=True,
            estado='activa'
        ).distinct().select_related('cliente')
    
    @staticmethod
    def get_deuda_with_abonos(deuda_id: str):
        """
        Get debt with full abonos history.
        
        Args:
            deuda_id: Debt ID
            
        Returns:
            dict: Deuda with stats
        """
        try:
            deuda = Deuda.objects.get(id=deuda_id)
        except Deuda.DoesNotExist:
            return None
        
        abonos = deuda.abonos_set.all().order_by('-fecha')
        pagado = sum(a.monto for a in abonos) or Decimal('0')
        saldo = max(Decimal('0'), deuda.monto - pagado)
        
        return {
            'deuda': deuda,
            'abonos': abonos,
            'pagado': pagado,
            'saldo': saldo,
            'porcentaje_pagado': (pagado / deuda.monto * Decimal('100')) if deuda.monto > 0 else Decimal('0'),
        }


class FinanzasPersonalesService:
    """Business logic for operator's personal finances."""
    
    @staticmethod
    def get_personal_finances_summary():
        """
        Get operator's personal debt summary.
        
        Returns:
            dict: Personal finances stats
        """
        total_monto = DeudaPersonal.objects.aggregate(
            total=Sum('monto', output_field=DecimalField())
        )['total'] or Decimal('0')
        
        total_pagado = PagoPersonal.objects.aggregate(
            total=Sum('monto', output_field=DecimalField())
        )['total'] or Decimal('0')
        
        total_saldo = Decimal('0')
        for deuda in DeudaPersonal.objects.filter(estado='activa'):
            total_saldo += Decimal(str(deuda.saldo_pendiente))
        
        deudas_activas = DeudaPersonal.objects.filter(estado='activa').count()
        
        # Compliance rate
        total_pagos = PagoPersonal.objects.count()
        pagos_puntuales = PagoPersonal.objects.filter(atrasado=False).count()
        tasa_cumplimiento = (
            Decimal(pagos_puntuales) / Decimal(total_pagos) * Decimal('100')
            if total_pagos > 0 else Decimal('100')
        )
        
        return {
            'total_deudas_personales': total_monto,
            'total_pagado_personales': total_pagado,
            'total_saldo_personales': total_saldo,
            'deudas_personales_activas': deudas_activas,
            'tasa_cumplimiento_personales': tasa_cumplimiento,
        }
    
    @staticmethod
    def get_personal_debts_by_status():
        """
        Get personal debts grouped by status.
        
        Returns:
            dict: Deudas by status
        """
        return {
            'activas': DeudaPersonal.objects.filter(estado='activa').count(),
            'pagadas': DeudaPersonal.objects.filter(estado='pagada').count(),
            'canceladas': DeudaPersonal.objects.filter(estado='cancelada').count(),
        }
