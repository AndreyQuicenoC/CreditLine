from django.urls import path
from apps.users import views

app_name = 'users'

urlpatterns = [
    path('login/', views.login, name='login'),
    path('profile/', views.get_profile, name='get-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('list/', views.list_users, name='list-users'),
    path('create/', views.create_user, name='create-user'),
    path('<str:user_id>/delete/', views.delete_user, name='delete-user'),
    path('system-config/', views.get_system_config, name='get-system-config'),
    path('system-config/update/', views.update_system_config, name='update-system-config'),
]
