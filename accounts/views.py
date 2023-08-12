from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views import View
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.template.loader import render_to_string

from .models import UserF, SignUpQueue

import json
import random

users_colors = {'a': '6290C8', 'b': '9ECE9A', 'c': '5D4E6D', 'd': '9B9ECE', 'e': 'FFAD05', 'f': 'D8315B', 'g': '60D394', 'h': 'C287E8', 'i': 'C0BDA5', 'j': 'CC978E', 'k': '03254E', 'l': '5E2BFF', 'm': 'A1683A', 'n': '499F68', 'o': '2E5EAA', 'p': 'E1CE7A', 'q': '48A9A6', 'r': '957FEF', 's': 'D78521', 't': '92140C', 'u': 'CDDFA0', 'v': '73C2BE', 'w': 'F7CB15', 'x': '878E88', 'y': '14453D', 'z': '48BEFF'}

def send_verification_code(queued_user, next=False):
    v_code = str(random.randint(0, 9999)).zfill(4)
    
    queued_user.v_code = v_code
    queued_user.save()
    
    print(v_code)
    
    ctx = {
        'first_name': queued_user.first_name,
        'v_code': v_code,
        'next': next
    }
    html_message = render_to_string('accounts/email-template.html', ctx)
    
    brand = 'Chanotas'
    if 'chatter' in next:
        brand = 'Chatter'
    elif 'noter' in next:
        brand = 'Noter'
    elif 'tasker' in next:
        brand = 'Tasker'
        
    send_mail(
            f'{brand} Email Verification',
            f'''
            Hello, {queued_user.first_name}!
            
            Here is your verification code: {v_code}
            ''',
            'zezo.09@hotmail.com',
            [queued_user.email],
            fail_silently=False,
            html_message=html_message
        )

# Create your views here.

def test_email(request):
    return render(request, 'accounts/email-template.html', {'next': 'noter', 'first_name': 'Test', 'v_code': '9451'})

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
        data = json.loads(request.body)
        v_code_input = data.get('v-code-input')
        email = data.get('email')
        if v_code_input and email:
            try:
                queued_user = SignUpQueue.objects.get(email=email)
            except:
                return HttpResponse('Nope.')
            if queued_user.v_code == v_code_input:
                newuser = UserF.objects.create_user(username=queued_user.username, password=queued_user.password, email=email, first_name=queued_user.first_name, last_name=queued_user.last_name)
                queued_user.delete()
                login(request, newuser)
                return JsonResponse({'code_failed': False}, safe=False)
            return JsonResponse({'code_failed': True}, safe=False)


class VerifyEmail(View):
    def post(self, request):
        firstname = request.POST['firstname']
        lastname = request.POST['lastname']
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        
        try:
            queued_user = SignUpQueue.objects.get(email=email)
        except:
            queued_user = SignUpQueue.objects.create(username=username, password=password, email=email, first_name=firstname.title(), last_name=lastname.title())
        send_verification_code(queued_user, request.GET.get('next'))

        return render(request, 'accounts/verify-email.html', {'email': email, 'next': request.GET.get('next')})

def re_send_code(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        print(email)
        try:
            queued_user = SignUpQueue.objects.get(email=email)
        except:
            return HttpResponse('Nope.')
        send_verification_code(queued_user)
    return JsonResponse({'message': 'success'}, safe=False)

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
        return render(request, 'accounts/login.html', {'incorrect': True, 'next': request.GET.get('next')})
    
def log_out(request):
    logout(request)
    next = request.GET.get('next')
    if next:
        return redirect(reverse('accounts:login') + f'?next={next}')
    return redirect(reverse('accounts:login'))

@login_required(redirect_field_name=None)
def home(request):
    return render(request, 'accounts/home.html')