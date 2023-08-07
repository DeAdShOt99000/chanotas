from django.urls import path
from . import views

app_name = 'accounts'
urlpatterns = [
    path('home', views.home, name='home'),
    path('signup', views.SignUp.as_view(), name='signup'),
    path('signup/check-username', views.CheckUserEmail.as_view(), name='check-user-email'),
    path('login', views.LogIn.as_view(), name='login'),
    path('logout', views.log_out, name='logout'),
]