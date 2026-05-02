"""
Operario App Django Admin Configuration

Registers operario models in Django admin interface for management.
"""
from django.contrib import admin
from .models import Municipio, Cliente, Deuda, Abono, DeudaPersonal, PagoPersonal


@admin.register(Municipio)
class MunicipioAdmin(admin.ModelAdmin):
    """Admin interface for Municipio model."""
    list_display = ('nombre', 'activo', 'id')
    list_filter = ('activo',)
    search_fields = ('nombre',)
    readonly_fields = ('id',)


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    """Admin interface for Cliente model."""
    list_display = ('nombre', 'cedula', 'telefono', 'municipio', 'activo', 'fecha_registro')
    list_filter = ('activo', 'municipio', 'fecha_registro')
    search_fields = ('nombre', 'cedula', 'email', 'telefono')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Información Básica', {
            'fields': ('id', 'nombre', 'cedula', 'sexo', 'fecha_registro')
        }),
        ('Contacto', {
            'fields': ('telefono', 'telefono_alterno', 'email')
        }),
        ('Dirección', {
            'fields': ('municipio', 'direccion_casa', 'direccion_trabajo')
        }),
        ('Notas', {
            'fields': ('info_extra',)
        }),
        ('Estado', {
            'fields': ('activo',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Deuda)
class DeudaAdmin(admin.ModelAdmin):
    """Admin interface for Deuda model."""
    list_display = ('id', 'cliente', 'monto', 'interes_mensual', 'estado', 'fecha_inicio', 'fecha_vencimiento')
    list_filter = ('estado', 'fecha_inicio', 'fecha_vencimiento')
    search_fields = ('id', 'cliente__nombre', 'descripcion')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Información de Deuda', {
            'fields': ('id', 'cliente', 'descripcion')
        }),
        ('Montos e Interés', {
            'fields': ('monto', 'interes_mensual')
        }),
        ('Fechas', {
            'fields': ('fecha_inicio', 'fecha_vencimiento')
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Abono)
class AbonoAdmin(admin.ModelAdmin):
    """Admin interface for Abono model."""
    list_display = ('id', 'deuda', 'monto', 'fecha', 'atrasado')
    list_filter = ('atrasado', 'fecha')
    search_fields = ('id', 'deuda__id', 'notas')
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        ('Información de Abono', {
            'fields': ('id', 'deuda', 'monto', 'fecha')
        }),
        ('Notas', {
            'fields': ('notas',)
        }),
        ('Estado', {
            'fields': ('atrasado',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


@admin.register(DeudaPersonal)
class DeudaPersonalAdmin(admin.ModelAdmin):
    """Admin interface for DeudaPersonal model."""
    list_display = ('concepto', 'acreedor', 'monto', 'interes_mensual', 'estado', 'fecha_inicio')
    list_filter = ('estado', 'fecha_inicio', 'fecha_vencimiento')
    search_fields = ('concepto', 'acreedor')
    readonly_fields = ('id', 'created_at', 'updated_at')
    fieldsets = (
        ('Información de Deuda', {
            'fields': ('id', 'concepto', 'acreedor')
        }),
        ('Montos e Interés', {
            'fields': ('monto', 'interes_mensual')
        }),
        ('Fechas', {
            'fields': ('fecha_inicio', 'fecha_vencimiento')
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PagoPersonal)
class PagoPersonalAdmin(admin.ModelAdmin):
    """Admin interface for PagoPersonal model."""
    list_display = ('id', 'deuda_personal', 'monto', 'fecha', 'atrasado')
    list_filter = ('atrasado', 'fecha')
    search_fields = ('id', 'deuda_personal__concepto', 'notas')
    readonly_fields = ('id', 'created_at')
    fieldsets = (
        ('Información de Pago', {
            'fields': ('id', 'deuda_personal', 'monto', 'fecha')
        }),
        ('Notas', {
            'fields': ('notas',)
        }),
        ('Estado', {
            'fields': ('atrasado',)
        }),
        ('Timestamp', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
