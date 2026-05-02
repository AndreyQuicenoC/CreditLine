"""
Operario App Serializers

Data serializers for API responses and request validation.
"""
from rest_framework import serializers
from decimal import Decimal
from .models import Municipio, Cliente, Deuda, Abono, DeudaPersonal, PagoPersonal


class MunicipioSerializer(serializers.ModelSerializer):
    """Serialize Municipio data."""
    class Meta:
        model = Municipio
        fields = ['id', 'nombre', 'activo']


class AbonoSerializer(serializers.ModelSerializer):
    """Serialize Abono (debt payment) data."""
    class Meta:
        model = Abono
        fields = ['id', 'monto', 'fecha', 'notas', 'atrasado', 'created_at']


class DeudaSerializer(serializers.ModelSerializer):
    """Serialize Deuda (debt) with nested abonos."""
    abonos = AbonoSerializer(source='abonos_set', many=True, read_only=True)
    saldo_pendiente = serializers.SerializerMethodField()
    interes_acumulado = serializers.SerializerMethodField()
    
    class Meta:
        model = Deuda
        fields = [
            'id', 'monto', 'interes_mensual', 'descripcion',
            'fecha_inicio', 'fecha_vencimiento', 'estado',
            'saldo_pendiente', 'interes_acumulado', 'abonos', 'created_at'
        ]
    
    def get_saldo_pendiente(self, obj):
        """Calculate and return remaining balance."""
        return str(obj.saldo_pendiente)
    
    def get_interes_acumulado(self, obj):
        """Calculate and return accumulated interest."""
        return str(obj.interes_acumulado)


class ClienteListSerializer(serializers.ModelSerializer):
    """Serialize Cliente for list view (minimal fields)."""
    municipio_nombre = serializers.CharField(source='municipio.nombre', read_only=True)
    saldo_total = serializers.SerializerMethodField()
    deudas_atrasadas_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'nombre', 'cedula', 'telefono', 'email',
            'municipio_nombre', 'saldo_total', 'deudas_atrasadas_count',
            'activo', 'fecha_registro'
        ]
    
    def get_saldo_total(self, obj):
        """Return total outstanding balance."""
        return str(obj.saldo_total)
    
    def get_deudas_atrasadas_count(self, obj):
        """Return count of overdue debts."""
        return obj.deudas_atrasadas_count


class ClienteDetailSerializer(serializers.ModelSerializer):
    """Serialize Cliente with full details and nested deudas."""
    municipio_nombre = serializers.CharField(source='municipio.nombre', read_only=True)
    deudas = DeudaSerializer(source='deudas_set', many=True, read_only=True)
    saldo_total = serializers.SerializerMethodField()
    
    class Meta:
        model = Cliente
        fields = [
            'id', 'nombre', 'cedula', 'sexo', 'telefono', 'telefono_alterno',
            'municipio_nombre', 'direccion_casa', 'direccion_trabajo', 'email',
            'info_extra', 'fecha_registro', 'activo', 'saldo_total', 'deudas'
        ]
    
    def get_saldo_total(self, obj):
        """Return total outstanding balance."""
        return str(obj.saldo_total)


class PagoPersonalSerializer(serializers.ModelSerializer):
    """Serialize PagoPersonal (personal debt payment)."""
    class Meta:
        model = PagoPersonal
        fields = ['id', 'monto', 'fecha', 'notas', 'atrasado', 'created_at']


class DeudaPersonalSerializer(serializers.ModelSerializer):
    """Serialize DeudaPersonal with nested pagos."""
    pagos = PagoPersonalSerializer(source='pagos_personales_set', many=True, read_only=True)
    saldo_pendiente = serializers.SerializerMethodField()
    
    class Meta:
        model = DeudaPersonal
        fields = [
            'id', 'concepto', 'acreedor', 'monto', 'interes_mensual',
            'fecha_inicio', 'fecha_vencimiento', 'estado',
            'saldo_pendiente', 'pagos', 'created_at'
        ]
    
    def get_saldo_pendiente(self, obj):
        """Calculate and return remaining balance."""
        return str(obj.saldo_pendiente)


class EstadisticasSerializer(serializers.Serializer):
    """Serialize aggregated statistics for dashboard."""
    total_clientes = serializers.IntegerField()
    clientes_activos = serializers.IntegerField()
    total_capital_prestado = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_capital_recuperado = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_saldo_pendiente = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_intereses_generados = serializers.DecimalField(max_digits=15, decimal_places=2)
    deudas_activas = serializers.IntegerField()
    deudas_atrasadas = serializers.IntegerField()
    deudas_pagadas = serializers.IntegerField()
    tasa_cumplimiento = serializers.DecimalField(max_digits=5, decimal_places=2)
    municipios_cubiertos = serializers.IntegerField()


class FinanzasPersonalesResumenSerializer(serializers.Serializer):
    """Serialize operator's personal finances summary."""
    total_deudas_personales = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_pagado_personales = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_saldo_personales = serializers.DecimalField(max_digits=15, decimal_places=2)
    deudas_personales_activas = serializers.IntegerField()
    tasa_cumplimiento_personales = serializers.DecimalField(max_digits=5, decimal_places=2)
