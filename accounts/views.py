from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.views import View

import json

# Create your views here.

class SignUp(View):
    def get(self, request):
        if not self.request.user.is_authenticated:
            return render(request, 'accounts/signup.html')
        else:
            return redirect(reverse('noter:home'))

    def post(self, request):
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        try:
            newuser = User.objects.create_user(username=username, password=password, email=email, first_name=firstname, last_name=lastname)
        except:
            return HttpResponse('Something Went Wrong :(')
        login(request, newuser)
        return redirect(reverse('noter:home'))

class CheckUserEmail(View):
    def post(self, request):
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        
        value = username if username else email
        
        if username:
            all_entries = [x[0] for x in User.objects.values_list('username')]
        elif email:
            all_entries = [x[0] for x in User.objects.values_list('email')]
            
        # print(username)
        # print(email)
        # print(all_entries)
        if value in all_entries:
            return JsonResponse({'message': False}, safe=False)
        return JsonResponse({'message': True}, safe=False)

class LogIn(View):
    def get(self, request):
        if not self.request.user.is_authenticated:
            return render(request, 'accounts/login.html')
        else:
            return redirect(reverse('home'))
    def post(self, request):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            if request.GET.get('next'):
                return redirect(request.GET.get('next'))
            return redirect(reverse('accounts:home'))
        return render(request, 'accounts/login.html', {'incorrect': True})

def log_out(request):
    logout(request)
    return redirect(reverse('accounts:login'))

def home(request):
    return render(request, 'accounts/home.html')