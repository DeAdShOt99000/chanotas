from django.db import models
from django.contrib.auth.models import User

from datetime import datetime
# Create your models here.

class Notes(models.Model):
    subject = models.CharField(max_length=255, default='No Subject')
    note = models.TextField(default='Empty Note')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='all_notes')
    favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField()
    
    def save(self, keep_updated_at=False, *args, **kwargs):
        if not keep_updated_at:
            self.updated_at = datetime.now()
    
        super().save(*args, **kwargs)