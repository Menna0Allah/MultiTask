"""
Script to configure Google OAuth in Django admin
Run this after creating a superuser account
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitask_backend.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

# Get or create the site
site, created = Site.objects.get_or_create(id=1)
if created or site.domain == 'example.com':
    site.domain = 'localhost:8000'
    site.name = 'MultiTask'
    site.save()
    print(f"[OK] Site configured: {site.domain}")
else:
    print(f"[INFO] Site already configured: {site.domain}")

# Get or create Google Social App
google_app, created = SocialApp.objects.get_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth',
        'client_id': '918215953444-6th8qm8bdm9bucgukt61v2b1ucsvpbf3.apps.googleusercontent.com',
        'secret': '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',
    }
)

if created:
    google_app.sites.add(site)
    print("[OK] Google OAuth app created successfully!")
else:
    # Update existing app
    google_app.client_id = '918215953444-6th8qm8bdm9bucgukt61v2b1ucsvpbf3.apps.googleusercontent.com'
    google_app.secret = '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'
    google_app.save()
    if site not in google_app.sites.all():
        google_app.sites.add(site)
    print("[OK] Google OAuth app updated successfully!")

print("\n" + "="*50)
print("GOOGLE OAUTH CONFIGURATION COMPLETE")
print("="*50)
print(f"Provider: {google_app.provider}")
print(f"Name: {google_app.name}")
print(f"Client ID: {google_app.client_id}")
print(f"Secret: {google_app.secret[:20]}...")
print(f"Sites: {', '.join([s.domain for s in google_app.sites.all()])}")
print("="*50)
