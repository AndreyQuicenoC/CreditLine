"""
Operario App Models

Contains data models for operario-specific entities:
- Municipios: Geographic areas served
- Clientes: Loan clients/customers
- Deudas: Client debts/loans
- Abonos: Debt payments
- DeudaPersonal: Operator's personal debts
- PagoPersonal: Personal debt payments
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _


class Municipio(models.Model):
    """
    Geographic municipality/area.
    
    Attributes:
        id (UUIDField): Unique identifier
        nombre (CharField): Municipality name (e.g., "Medellín", "Envigado")
        activo (BooleanField): Whether this municipality is active for operations
    """
    id = models.CharField(primary_key=True, max_length=50, editable=False)
    nombre = models.CharField(max_length=255, unique=True, db_index=True)
    activo = models.BooleanField(default=True, db_index=True)
    
    class Meta:
        db_table = 'municipios'
        verbose_name = _('Municipality')
        verbose_name_plural = _('Municipalities')
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['activo']),
            models.Index(fields=['nombre']),
        ]
    
    def __str__(self):
        return self.nombre


class Cliente(models.Model):
    """
    Loan client/customer.
    
    Attributes:
        id (CharField): Unique identifier
        nombre (CharField): Full name
        cedula (CharField): ID number (cedula)
        sexo (CharField): Gender (M/F)
        telefono (CharField): Primary phone
        telefono_alterno (CharField, optional): Alternate phone
        municipio (ForeignKey): Associated municipality
        direccion_casa (TextField, optional): Home address
        direccion_trabajo (TextField, optional): Work address
        email (EmailField, optional): Email address
        info_extra (TextField, optional): Additional notes/information
        fecha_registro (DateField): Registration date
        activo (BooleanField): Whether client account is active
        created_at (DateTimeField): Record creation timestamp
        updated_at (DateTimeField): Last update timestamp
    """
    GENDER_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Otro'),
    ]
    
    id = models.CharField(primary_key=True, max_length=50, editable=False)
    nombre = models.CharField(max_length=255, db_index=True)
    cedula = models.CharField(max_length=20, unique=True, db_index=True)
    sexo = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    telefono = models.CharField(max_length=20)
    telefono_alterno = models.CharField(max_length=20, blank=True, null=True)
    municipio = models.ForeignKey(Municipio, on_delete=models.PROTECT, null=True, blank=True)
    direccion_casa = models.TextField(blank=True, null=True)
    direccion_trabajo = models.TextField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True, db_index=True)
    info_extra = models.TextField(blank=True, null=True)
    fecha_registro = models.DateField(db_index=True)
    activo = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'clientes'
        verbose_name = _('Client')
        verbose_name_plural = _('Clients')
        ordering = ['-fecha_registro']
        indexes = [
            models.Index(fields=['activo']),
            models.Index(fields=['cedula']),
            models.Index(fields=['municipio', 'activo']),
        ]
    
    def __str__(self):
        return f"{self.nombre} ({self.cedula})"
    
    @property
    def saldo_total(self):
        """Calculate total outstanding balance across all active debts."""
        deudas_activas = self.deudas_set.filter(estado='activa')
        total = 0
        for deuda in deudas_activas:
            pagado = deuda.abonos_set.aggregate(
                total=models.Sum('monto')
            )['total'] or 0
            total += max(0, deuda.monto - pagado)
        return total
    
    @property
    def deudas_atrasadas_count(self):
        """Count number of overdue debts."""
        return self.deudas_set.filter(
            estado='activa',
            abonos__atrasado=True
        ).distinct().count()


class Deuda(models.Model):
    """
    Debt/loan record.
    
    Attributes:
        id (CharField): Unique identifier
        cliente (ForeignKey): Associated client
        monto (DecimalField): Principal amount
        interes_mensual (DecimalField): Monthly interest rate (%)
        descripcion (TextField): Debt description/purpose
        fecha_inicio (DateField): Start date
        fecha_vencimiento (DateField, optional): Due date
        estado (CharField): Debt status (activa/pagada/atrasada/cancelada)
        created_at (DateTimeField): Record creation timestamp
        updated_at (DateTimeField): Last update timestamp
    """
    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('pagada', 'Pagada'),
        ('atrasada', 'Atrasada'),
        ('cancelada', 'Cancelada'),
    ]
    
    id = models.CharField(primary_key=True, max_length=50, editable=False)
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='deudas_set')
    monto = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    interes_mensual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    descripcion = models.TextField(blank=True, null=True)
    fecha_inicio = models.DateField(db_index=True)
    fecha_vencimiento = models.DateField(blank=True, null=True, db_index=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activa', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'deudas'
        verbose_name = _('Debt')
        verbose_name_plural = _('Debts')
        ordering = ['-fecha_inicio']
        indexes = [
            models.Index(fields=['cliente', 'estado']),
            models.Index(fields=['estado']),
            models.Index(fields=['fecha_vencimiento']),
        ]
    
    def __str__(self):
        return f"Deuda: {self.cliente.nombre} - ${self.monto}"
    
    @property
    def saldo_pendiente(self):
        """Calculate remaining balance."""
        pagado = self.abonos_set.aggregate(
            total=models.Sum('monto')
        )['total'] or 0
        return float(self.monto) - pagado
    
    @property
    def interes_acumulado(self):
        """Calculate accumulated interest (simplified: meses * interes_mensual)."""
        from datetime import datetime
        inicio = self.fecha_inicio
        fin = self.fecha_vencimiento or datetime.now().date()
        meses = (fin.year - inicio.year) * 12 + (fin.month - inicio.month)
        return float(self.monto) * (float(self.interes_mensual) / 100) * max(1, meses)


class Abono(models.Model):
    """
    Debt payment/installment.
    
    Attributes:
        id (CharField): Unique identifier
        deuda (ForeignKey): Associated debt
        monto (DecimalField): Payment amount
        fecha (DateField): Payment date
        notas (TextField, optional): Payment notes
        atrasado (BooleanField): Whether payment was late
        created_at (DateTimeField): Record creation timestamp
    """
    id = models.CharField(primary_key=True, max_length=50, editable=False)
    deuda = models.ForeignKey(Deuda, on_delete=models.CASCADE, related_name='abonos_set')
    monto = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    fecha = models.DateField(db_index=True)
    notas = models.TextField(blank=True, null=True)
    atrasado = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'abonos'
        verbose_name = _('Payment')
        verbose_name_plural = _('Payments')
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['deuda']),
            models.Index(fields=['fecha']),
        ]
    
    def __str__(self):
        return f"Abono: ${self.monto} - {self.fecha}"


class DeudaPersonal(models.Model):
    """
    Operator's personal debt (e.g., credit card, personal loan).
    
    Attributes:
        id (CharField): Unique identifier
        concepto (CharField): Debt concept/type
        acreedor (CharField, optional): Creditor name
        monto (DecimalField): Amount owed
        interes_mensual (DecimalField): Monthly interest rate (%)
        fecha_inicio (DateField): Start date
        fecha_vencimiento (DateField, optional): Due date
        estado (CharField): Status (activa/pagada/cancelada)
        created_at (DateTimeField): Record creation timestamp
        updated_at (DateTimeField): Last update timestamp
    """
    ESTADO_CHOICES = [
        ('activa', 'Activa'),
        ('pagada', 'Pagada'),
        ('cancelada', 'Cancelada'),
    ]
    
    id = models.CharField(primary_key=True, max_length=50, editable=False)
    concepto = models.CharField(max_length=255, db_index=True)
    acreedor = models.CharField(max_length=255, blank=True, null=True)
    monto = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    interes_mensual = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fecha_inicio = models.DateField(db_index=True)
    fecha_vencimiento = models.DateField(blank=True, null=True, db_index=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='activa', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'deudas_personales'
        verbose_name = _('Personal Debt')
        verbose_name_plural = _('Personal Debts')
        ordering = ['-fecha_inicio']
        indexes = [
            models.Index(fields=['estado']),
            models.Index(fields=['fecha_vencimiento']),
        ]
    
    def __str__(self):
        return f"{self.concepto} - ${self.monto}"
    
    @property
    def saldo_pendiente(self):
        """Calculate remaining balance."""
        pagado = self.pagos_personales_set.aggregate(
            total=models.Sum('monto')
        )['total'] or 0
        return float(self.monto) - pagado


class PagoPersonal(models.Model):
    """
    Personal debt payment/installment.
    
    Attributes:
        id (CharField): Unique identifier
        deuda_personal (ForeignKey): Associated personal debt
        monto (DecimalField): Payment amount
        fecha (DateField): Payment date
        notas (TextField, optional): Payment notes
        atrasado (BooleanField): Whether payment was late
        created_at (DateTimeField): Record creation timestamp
    """
    id = models.CharField(primary_key=True, max_length=50, editable=False)
    deuda_personal = models.ForeignKey(DeudaPersonal, on_delete=models.CASCADE, related_name='pagos_personales_set')
    monto = models.DecimalField(max_digits=15, decimal_places=2, validators=[MinValueValidator(0)])
    fecha = models.DateField(db_index=True)
    notas = models.TextField(blank=True, null=True)
    atrasado = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pagos_personales'
        verbose_name = _('Personal Payment')
        verbose_name_plural = _('Personal Payments')
        ordering = ['-fecha']
        indexes = [
            models.Index(fields=['deuda_personal']),
            models.Index(fields=['fecha']),
        ]
    
    def __str__(self):
        return f"Pago: ${self.monto} - {self.fecha}"
