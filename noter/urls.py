from django.urls import path
from . import views

app_name = 'noter'
urlpatterns = [
    path('', views.NotesView.as_view(), name='home'),
    path('delete/<int:pk>', views.delete_note, name='delete-note'),
    
    path('notes-json', views.NotesJson.as_view(), name='notes-json'),
    path('favorite-json/<int:pk>', views.favoriteJson.as_view(), name='favorite-json'),
]