from django.db.signals import post_save
from django.dispatch import receiver
from accounts.models import User
from .models import Wallet


@receiver(post_save, sender=User)
def create_user_wallet(sender, instance, created, **kwargs):
    """
    Automatically create a wallet when a new user is registered
    """
    if created:
        Wallet.objects.create(user=instance)
