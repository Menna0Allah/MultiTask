"""
Signals for automatic cache invalidation
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
import logging

from .skill_model import UserSkill
from .services import get_recommendation_service

logger = logging.getLogger('recommendations')


@receiver(post_save, sender=UserSkill)
def clear_cache_on_skill_save(sender, instance, created, **kwargs):
    """
    Clear recommendation cache when a user's skill is added or updated
    """
    try:
        user = instance.user
        service = get_recommendation_service()
        service.clear_user_cache(user)

        action = "created" if created else "updated"
        logger.info(f"Cache cleared for {user.username} (skill {action}: {instance.skill.name})")
    except Exception as e:
        logger.warning(f"Error clearing cache on skill save: {e}")


@receiver(post_delete, sender=UserSkill)
def clear_cache_on_skill_delete(sender, instance, **kwargs):
    """
    Clear recommendation cache when a user's skill is removed
    """
    try:
        user = instance.user
        service = get_recommendation_service()
        service.clear_user_cache(user)

        logger.info(f"Cache cleared for {user.username} (skill deleted: {instance.skill.name})")
    except Exception as e:
        logger.warning(f"Error clearing cache on skill delete: {e}")
