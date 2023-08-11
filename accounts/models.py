from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class UserF(AbstractUser):
    friends = models.ManyToManyField('self', blank=True)
