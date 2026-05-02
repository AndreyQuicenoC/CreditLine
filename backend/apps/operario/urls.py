"""
Operario App URL Configuration

Maps API endpoints to view functions.
"""
from django.urls import path
from . import views

app_name = 'operario'

urlpatterns = [
    # Municipios
    path('municipios/', views.list_municipios, name='list-municipios'),
    path('municipios/<str:municipio_id>/', views.municipio_detail, name='municipio-detail'),
    
    # Cartera (Clientes)
    path('clientes/', views.list_clientes, name='list-clientes'),
    path('clientes/<str:cliente_id>/', views.cliente_detail, name='cliente-detail'),
    
    # Deudas
    path('deudas/', views.list_deudas, name='list-deudas'),
    path('deudas/<str:deuda_id>/', views.deuda_detail, name='deuda-detail'),
    
    # Estadísticas
    path('stats/dashboard/', views.dashboard_stats, name='dashboard-stats'),
    path('stats/municipios/', views.municipios_stats, name='municipios-stats'),
    path('stats/deudas/', views.deudas_stats, name='deudas-stats'),
    
    # Finanzas Personales
    path('finanzas-personales/summary/', views.finanzas_personales_summary, name='finanzas-personales-summary'),
    path('finanzas-personales/deudas/', views.list_deudas_personales, name='list-deudas-personales'),
    path('finanzas-personales/deudas/<str:deuda_personal_id>/', views.deuda_personal_detail, name='deuda-personal-detail'),
]
