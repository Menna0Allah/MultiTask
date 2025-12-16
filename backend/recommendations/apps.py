"""
Recommendations app configuration
"""
from django.apps import AppConfig


class RecommendationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'recommendations'
    verbose_name = 'Recommendations'

    def ready(self):
        """Import signals when app is ready"""
        import recommendations.signals  # noqa