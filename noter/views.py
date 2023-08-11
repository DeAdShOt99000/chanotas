from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.core import serializers
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin

from .models import Notes

import json
# Create your views here.

class NotesView(LoginRequiredMixin, View):
    def get(self, request):
        return render(request, 'noter/home.html')
    def post(self, request):
        data = json.loads(request.body)
        
        subject = data.get('subject')
        note = data.get('note')
        
        new_note = Notes(owner=request.user)
        if subject:
            new_note.subject = subject
        if note:
            new_note.note = note
        new_note.save()
                
        serialized = serializers.serialize('json', [new_note,])
        return JsonResponse(serialized, safe=False)
    
class NotesJson(View):
    def get(self, request):
        try:
            notes = Notes.objects.filter(owner=request.user).order_by('-updated_at')
        except:
            return JsonResponse('{}', safe=False)
        serialized = serializers.serialize('json', notes)
        return JsonResponse(serialized, safe=False)
        
    def post(self, request):
        data = json.loads(request.body)
        pk = data.get('id')
        try:
            note = Notes.objects.get(pk=pk, owner=request.user)
        except:
            return JsonResponse({'message': 'Nope. Note'}, safe=False)
        
        
        if data.get('note'):
            note.note = data.get('note')
            
        if data.get('subject'):
            note.subject = data.get('subject')
        else:
            note.subject = 'No Subject'
            
        note.save()
        return JsonResponse({'message': 'success', 'updated_at': note.updated_at}, safe=False)
    
class favoriteJson(View):
    def get(self, request, pk):
        try:
            note = Notes.objects.get(pk=pk, owner=request.user)
        except:
            return HttpResponse('Nope, Favorite')
        
        if note.favorite:
            note.favorite = 0
        else:
            note.favorite = 1
        note.save(keep_updated_at=True)
        return JsonResponse({'message': 'success', 'favorite': note.favorite}, safe=False)
    
def delete_note(request, pk):
    try:
        note = Notes.objects.get(pk=pk, owner=request.user)
    except:
        return HttpResponse('Nope. Delete')
    note.delete()
    return JsonResponse({'message': 'success'}, safe=False)