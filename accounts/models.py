from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class UserF(AbstractUser):
    friends = models.ManyToManyField('self', blank=True)

class SignUpQueue(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    v_code = models.CharField(max_length=4, null=True, default=None)