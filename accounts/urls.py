from django.urls import path
from . import views

app_name = 'accounts'
urlpatterns = [
    path('signup', views.SignUp.as_view(), name='signup'),
    path('signup/verify-email', views.VerifyEmail.as_view(), name='verify-email'),
    path('signup/check-username', views.CheckUserEmail.as_view(), name='check-user-email'),
    path('login', views.LogIn.as_view(), name='login'),
    path('logout', views.log_out, name='logout'),
    
    # path('test-email', views.test_email),
    
    path('re-send-verification', views.re_send_code, name='resed-verification'),   
]