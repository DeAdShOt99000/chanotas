from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.views import View
from django.core import serializers

from .models import ToDo

import datetime
import json
# Create your views here.

class ToDoView(View):
    def get(self, request, date):
        if request.user.is_authenticated:
            tasks = ToDo.objects.filter(task_date=date, owner_id=self.request.user.id)
            
            current_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            prev_day = current_date - datetime.timedelta(days=1)
            next_day = current_date + datetime.timedelta(days=1)
            
            return render(request, 'tasker/home.html', {'tasks': tasks, 'date': current_date, 'prev_day': prev_day, 'next_day': next_day})
        return redirect(reverse('accounts:login') + f'?next={request.path}')
    def post(self, request, date):
        task = json.loads(request.body).get('task')
        new_task = ToDo.objects.create(task=task, task_date=date, owner=self.request.user)
        return JsonResponse({'taskIDE': new_task.id, 'taskE': new_task.task, 'is_doneE': new_task.is_done}, safe=False)
    
def todayRedirect(request):
    date = datetime.date.today()
    return redirect(reverse('tasker:tasker', args=[date]))

class ToDoTasks(View):
    def get(self, request, date):
        serialized_tasks = serializers.serialize('json', ToDo.objects.filter(task_date=date, owner_id=self.request.user.id))
        return JsonResponse(serialized_tasks, safe=False)
    
    def post(self, request, date):
        update_task_id = json.loads(request.body)['update_task_id']
        task = ToDo.objects.get(id=int(update_task_id))
        if task.is_done:
            task.is_done = False
        else:
            task.is_done = True
        task.save()
        serializer = serializers.serialize('json', ToDo.objects.filter(task_date=date))
        return JsonResponse(serializer, safe=False)
    
def delete_task(request, pk):
    try:
        task = ToDo.objects.get(pk=pk, owner=request.user)
        task.delete()
        return JsonResponse({'message': 'success'}, safe=False)
    except:
        return JsonResponse({'message': 'task not found'}, safe=False)