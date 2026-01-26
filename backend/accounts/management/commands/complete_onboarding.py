"""
Management command to complete onboarding for demo accounts
Fills in interests, skills, and preferences based on their existing skills
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

from tasks.models import Category
from recommendations.models import Skill, UserSkill, UserPreference

User = get_user_model()


class Command(BaseCommand):
    help = 'Complete onboarding for demo accounts menna_allah and lail_eldein'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Completing onboarding for demo accounts...'))

        with transaction.atomic():
            # Get users
            try:
                menna = User.objects.get(username='menna_allah')
                lail = User.objects.get(username='lail_eldein')
            except User.DoesNotExist as e:
                self.stdout.write(self.style.ERROR(f'User not found: {e}'))
                return

            # Complete onboarding for Menna_Allah
            self.stdout.write('Setting up onboarding for menna_allah...')
            self.complete_menna_onboarding(menna)

            # Complete onboarding for Lail_Eldein
            self.stdout.write('Setting up onboarding for lail_eldein...')
            self.complete_lail_onboarding(lail)

        self.stdout.write(self.style.SUCCESS('\n[SUCCESS] Onboarding completed successfully!'))
        self.stdout.write(self.style.SUCCESS('\nYou can now login and see personalized recommendations:'))
        self.stdout.write('  - menna_allah: Web Dev, Design & Creative interests')
        self.stdout.write('  - lail_eldein: Marketing, Writing & Translation interests')

    def complete_menna_onboarding(self, user):
        """Complete onboarding for Menna Allah (Web Developer & UI/UX Designer)"""
        # Get or create user preference
        pref, created = UserPreference.objects.get_or_create(user=user)

        # Set interests (categories) - relevant to web development and design
        category_slugs = [
            'web-development',      # 1 - Core skill
            'mobile-development',   # 2 - Related to web dev
            'design-creative',      # 3 - UI/UX design
            'data-science',         # 6 - Often uses Python
            'business',             # 7 - Works with startups
        ]

        category_ids = []
        for slug in category_slugs:
            try:
                category = Category.objects.get(slug=slug)
                category_ids.append(category.id)
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'  Category not found: {slug}'))

        # Update preferences
        pref.interests = category_ids
        pref.preferred_task_types = ['DIGITAL', 'HYBRID']
        pref.prefer_remote = True
        pref.preferred_location = 'Cairo'
        pref.min_budget = 1000
        pref.max_budget = 10000
        pref.onboarding_completed = True
        pref.save()

        # Get user's existing skills (already created by seed_demo_data)
        user_skills = UserSkill.objects.filter(user=user)
        skill_ids = list(user_skills.values_list('skill_id', flat=True))

        self.stdout.write(f'  > Interests: {len(category_ids)} categories selected')
        self.stdout.write(f'  > Skills: {user_skills.count()} skills already configured')
        self.stdout.write(f'  > Preferences: DIGITAL/HYBRID, remote, Cairo, budget 1000-10000 EGP')

    def complete_lail_onboarding(self, user):
        """Complete onboarding for Lail Eldein (Digital Marketer & Content Writer)"""
        # Get or create user preference
        pref, created = UserPreference.objects.get_or_create(user=user)

        # Set interests (categories) - relevant to marketing and content writing
        category_slugs = [
            'marketing-seo',         # 5 - Core skill
            'writing-translation',   # 4 - Content writing
            'business',              # 7 - Works with companies
            'design-creative',       # 3 - Social media content
            'education',             # 11 - Content creation
        ]

        category_ids = []
        for slug in category_slugs:
            try:
                category = Category.objects.get(slug=slug)
                category_ids.append(category.id)
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'  Category not found: {slug}'))

        # Update preferences
        pref.interests = category_ids
        pref.preferred_task_types = ['DIGITAL', 'HYBRID']
        pref.prefer_remote = True
        pref.preferred_location = 'Alexandria'
        pref.min_budget = 500
        pref.max_budget = 5000
        pref.onboarding_completed = True
        pref.save()

        # Get user's existing skills (already created by seed_demo_data)
        user_skills = UserSkill.objects.filter(user=user)
        skill_ids = list(user_skills.values_list('skill_id', flat=True))

        self.stdout.write(f'  > Interests: {len(category_ids)} categories selected')
        self.stdout.write(f'  > Skills: {user_skills.count()} skills already configured')
        self.stdout.write(f'  > Preferences: DIGITAL/HYBRID, remote, Alexandria, budget 500-5000 EGP')
