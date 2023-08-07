from django.urls import path
from . import views

app_name = 'tasker'
urlpatterns = [
    path('', views.todayRedirect, name='today-todo'),
    path('<str:date>', views.ToDoView.as_view(), name='tasker'),
    path('delete/<int:pk>', views.delete_task, name='delete-task'),
    
    path('tasker-tasks-json/<str:date>', views.ToDoTasks.as_view(), name='tasker-tasks-json'),
]