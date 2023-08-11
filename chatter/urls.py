from django.urls import path
from . import views

app_name = 'chatter'
urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('home-json', views.HomeJSON.as_view(), name='home-json'),
    path('chat/<int:pk>', views.ChatView.as_view(), name='chat_view'),
    path('chat/<int:pk>/chat-json', views.ChatJSON.as_view(), name='chat-json'),
    path('chat/tag-as-viewed', views.tagAsViewed, name='tag-as-viewed'),
]