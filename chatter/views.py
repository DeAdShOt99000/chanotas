from django.shortcuts import render
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.views import View
from django.http import HttpResponse, JsonResponse
from django.db.models import Q
from django.contrib.auth.mixins import LoginRequiredMixin

from accounts.views import users_colors
from accounts.models import UserF
from .models import Chat

from datetime import datetime, timedelta
import json

def clean_dt(date_time: datetime):
    date = date_time.date()
    if date == datetime.today().date():
        clean_date = 'Today'
    elif date == (datetime.today().date() - timedelta(days=1)):
        clean_date = 'Yesterday'
    else:
        months = {1: 'Jan', 2: 'Feb', 3: 'Mar',
                  4: 'Apr', 5: 'May', 6: 'Jun',
                  7: 'Jul', 8: 'Aug', 9: 'Sep',
                  10: 'Oct', 11: 'Nov', 12: 'Dec'}
        clean_day = str(date.day)
        if clean_day[0] == '0':
            clean_day = clean_day[1]
        clean_date = f'{months[date.month]} {clean_day}, {date.year}'
    
    clean_minute = date_time.minute
    if len(str(clean_minute)) < 2:
        clean_minute = f'0{clean_minute}'
    
    if date_time.hour == 0:
        clean_time = f'12:{clean_minute} AM'
    elif date_time.hour < 13:
        clean_time = f'{date_time.hour}:{clean_minute} AM'
    else:
        clean_hour = date_time.hour - 12
        clean_time = f'{clean_hour}:{clean_minute} PM'
    return (clean_date, clean_time)

# Create your views here.

class HomeView(LoginRequiredMixin, View):
    def get(self, request):
        return render(request, 'chatter/home.html')
    def post(self, request):
        if request.POST.get('email'):
            new_friend = get_object_or_404(UserF, email=request.POST['email'])
        elif request.POST.get('username'):
            new_friend = get_object_or_404(UserF, username=request.POST['username'])
            
        request.user.friends.add(new_friend)
        new_friend.friends.add(request.user)
        return redirect(reverse('chatter:home'))

class HomeJSON(View):
    def get(self, request):
        all_friends = request.user.friends.all()
        chat_set = request.user.received_by_set.all()
        af_dict_lst = []
        for friend in all_friends:
            try:
                last_msg_details = chat_set.filter(sent_by=friend).order_by('-sent_at')[0]
                last_msg = (last_msg_details.text, last_msg_details.sent_at, last_msg_details.id)
            except:
                last_msg = ('', datetime(1, 1, 1), -1)
            
            try:
                not_viewed = len(chat_set.filter(sent_by=friend, viewed=False))
            except IndexError:
                not_viewed = None
            
            friend_dict = vars(friend)
            clean_friend_dict = {
                'id': friend_dict['id'],
                'username': friend_dict['username'],
                'first_name': friend_dict['first_name'].title(),
                'last_name': friend_dict['last_name'].title(),
                'email': friend_dict['email'],
                'not_viewed': not_viewed,
                'last_msg': last_msg,
                'user_color': users_colors[friend.first_name[0:1].lower()]
                # 'last_login': friend_dict['last_login']
            }
            af_dict_lst.append(clean_friend_dict)

        sorted_dict_lst = sorted(af_dict_lst, key=lambda x: x['last_msg'][1], reverse=True)
        if sorted_dict_lst[0]['last_msg'][2] != int(request.GET.get('last-msg-id')):
            return JsonResponse(sorted_dict_lst, safe=False)
        return JsonResponse([{'last_msg': 'same'}], safe=False)
    
class ChatView(LoginRequiredMixin, View):
    def get(self, request, pk):
        try:
            friend = request.user.friends.get(pk=pk)
        except UserF.DoesNotExist:
            return HttpResponse("<h1>Doesn't exist.</h1>")
        
        chat_history = Chat.objects.filter(sent_by=request.user, received_by=friend).order_by('-sent_at')
        
        return render(request, 'chatter/chat.html', {'friend': friend, 'chat_history': chat_history, 'user_color': users_colors[friend.first_name[0:1].lower()]})
        
    def post(self, request, pk):
        try:
            friend = request.user.friends.get(pk=pk)
        except UserF.DoesNotExist:
            return HttpResponse("<h1>Doesn't exist.</h1>")
        text_message = json.loads(request.body)['text-message']
        
        Chat.objects.create(
            text = text_message,
            sent_by = request.user,
            received_by = friend,
        )
        return JsonResponse({'message': 'Data received successfully'})
    
class ChatJSON(View):
    def get(self, request, pk):
        try:
            friend = request.user.friends.get(pk=pk)
        except UserF.DoesNotExist:
            return HttpResponse("<h1>Doesn't exist.</h1>")
        
        query = Q(sent_by=request.user, received_by=friend) | Q(sent_by=friend, received_by=request.user)
        chat_history = Chat.objects.filter(query).order_by('sent_at')
        
        ch_dict_lst = []
        for chat in chat_history:
            date_time = clean_dt(chat.sent_at)
            dict_entry = vars(chat)
            del dict_entry['_state']
            dict_entry.update({
                'date': date_time[0],
                'time': date_time[1]
            })
            ch_dict_lst.append(dict_entry)
        if ch_dict_lst[-1]['id'] != int(request.GET.get('last-msg-id')):
            return JsonResponse(ch_dict_lst, safe=False)
        return JsonResponse([{'id': 'same'}], safe=False)
    
def tagAsViewed(request):
    if request.method == 'POST':
        ids_lst = json.loads(request.body)['ids']
        for id in ids_lst:
            chat = Chat.objects.get(pk=id)
            chat.viewed = True
            chat.save()
        return JsonResponse({'message': 'success!'})