from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views import View
from django.contrib.auth.decorators import login_required

from .models import UserF

import json

users_colors = {'a': '6290C8', 'b': '9ECE9A', 'c': '5D4E6D', 'd': '9B9ECE', 'e': 'FFAD05', 'f': 'D8315B', 'g': '60D394', 'h': 'C287E8', 'i': 'C0BDA5', 'j': 'CC978E', 'k': '03254E', 'l': '5E2BFF', 'm': 'A1683A', 'n': '499F68', 'o': '2E5EAA', 'p': 'E1CE7A', 'q': '48A9A6', 'r': '957FEF', 's': 'D78521', 't': '92140C', 'u': 'CDDFA0', 'v': '73C2BE', 'w': 'F7CB15', 'x': '878E88', 'y': '14453D', 'z': '48BEFF'}

# Create your views here.

class SignUp(View):
    def get(self, request):
        if not self.request.user.is_authenticated:
            return render(request, 'accounts/signup.html', {'next': request.GET.get('next')})
        else:
            next = request.GET.get('next')
            if next:
                return redirect(next)
            return redirect(reverse('home'))

    def post(self, request):
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        try:
            newuser = UserF.objects.create_user(username=username, password=password, email=email, first_name=firstname.title(), last_name=lastname.title())
        except:
            return HttpResponse('Something Went Wrong :(')
        
        login(request, newuser)
        next = request.GET.get('next')
        if next:
            return redirect(next)
        return redirect(reverse('home'))

class CheckUserEmail(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        
        value = username if username else email
        
        if username:
            all_entries = [x[0] for x in UserF.objects.values_list('username')]
        elif email:
            all_entries = [x[0] for x in UserF.objects.values_list('email')]
        
        if value in all_entries:
            return JsonResponse({'message': False}, safe=False)
        return JsonResponse({'message': True}, safe=False)

class LogIn(View):
    def get(self, request):
        if not self.request.user.is_authenticated:
            return render(request, 'accounts/login.html', {'next': request.GET.get('next')})
        else:
            next = request.GET.get('next')
            if next:
                return redirect(next)
            return redirect(reverse('home'))
    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            if request.GET.get('next'):
                return redirect(request.GET.get('next'))
            return redirect(reverse('home'))
        return render(request, 'accounts/login.html', {'incorrect': True})

def log_out(request):
    logout(request)
    next = request.GET.get('next')
    if next:
        return redirect(reverse('accounts:login') + f'?next={next}')
    return redirect(reverse('accounts:login'))

@login_required(redirect_field_name=None)
def home(request):
    return render(request, 'accounts/home.html')