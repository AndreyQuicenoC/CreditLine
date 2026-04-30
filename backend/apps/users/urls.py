from django.urls import path
from apps.users import views

app_name = 'users'

urlpatterns = [
    path('profile/', views.get_profile, name='get-profile'),
    path('profile/update/', views.update_profile, name='update-profile'),
    path('list/', views.list_users, name='list-users'),
]
