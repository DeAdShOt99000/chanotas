from django.db import models

from accounts.models import UserF
# Create your models here.
    
class Chat(models.Model):
    text = models.TextField()
    sent_by = models.ForeignKey(UserF, on_delete=models.CASCADE, related_name='sent_by_set', null=True)
    received_by = models.ForeignKey(UserF, on_delete=models.CASCADE, related_name='received_by_set', null=True)
    in_group = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)
    def __str__(self) -> str:
        return f'{self.sent_by.first_name} -> {self.received_by.first_name}'