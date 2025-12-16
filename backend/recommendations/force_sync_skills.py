"""
Force sync skills for a user
Run: python force_sync_skills.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitask_backend.settings')
django.setup()

from accounts.models import User
from recommendations.skill_model import Skill, UserSkill

print("="*60)
print("FORCE SYNCING SKILLS")
print("="*60)

# Get testuser
user = User.objects.get(username='testuser')

print(f"\nUser: {user.username}")
print(f"Current text skills: {user.skills}")
print(f"\nCurrent structured skills:")
for us in UserSkill.objects.filter(user=user):
    print(f"  - {us.skill.name}")

# Parse skills from text
skills_text = user.skills or ""
skill_names = [s.strip().lower() for s in skills_text.split(',') if s.strip()]

print(f"\nParsed skill names from text: {skill_names}")

# Clear existing
print(f"\nDeleting old UserSkill records...")
UserSkill.objects.filter(user=user).delete()

# Match and create new
print(f"\nMatching with database skills:")
matched_skills = []

for skill_name in skill_names:
    # Try exact match
    skill = Skill.objects.filter(name__iexact=skill_name, is_active=True).first()

    if not skill:
        # Try partial match
        skill = Skill.objects.filter(name__icontains=skill_name, is_active=True).first()

    if skill:
        UserSkill.objects.create(
            user=user,
            skill=skill,
            proficiency='intermediate'
        )
        matched_skills.append(skill.name)
        print(f"  [OK] Matched '{skill_name}' -> '{skill.name}'")
    else:
        print(f"  [NO] No match found for '{skill_name}'")

print(f"\nNew structured skills:")
for us in UserSkill.objects.filter(user=user):
    print(f"  - {us.skill.name}")

print(f"\n{'='*60}")
print(f"SYNC COMPLETE!")
print(f"Matched {len(matched_skills)} skills")
print(f"{'='*60}")
