"""
Dataset Loader for MultiTasks Platform
Loads JSON datasets into Django database
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

import django
from django.utils import timezone
from django.db import transaction

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitask_backend.settings')
django.setup()

from accounts.models import User
from recommendations.models import Skill, UserSkill
from tasks.models import Category, Task, TaskApplication, Review
from django.contrib.auth.hashers import make_password


class DatasetLoader:
    """Load datasets into Django database"""

    def __init__(self, dataset_path='../datasets'):
        self.dataset_path = Path(dataset_path)
        self.stats = {
            'users': 0,
            'skills': 0,
            'user_skills': 0,
            'categories': 0,
            'tasks': 0,
            'task_skills': 0,
            'proposals': 0,
            'reviews': 0,
        }

    def load_json(self, filename):
        """Load JSON file"""
        filepath = self.dataset_path / filename
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)

    def parse_datetime(self, dt_str):
        """Parse ISO datetime string"""
        if not dt_str:
            return None
        # Remove 'Z' and parse
        dt_str = dt_str.replace('Z', '+00:00')
        return datetime.fromisoformat(dt_str)

    @transaction.atomic
    def load_users(self):
        """Load users"""
        print("Loading users...")
        users_data = self.load_json('users.json')

        for user_data in users_data:
            # Parse dates
            date_joined = self.parse_datetime(user_data['date_joined'])
            last_login = self.parse_datetime(user_data['last_login'])
            created_at = self.parse_datetime(user_data['created_at'])
            updated_at = self.parse_datetime(user_data['updated_at'])

            # Extract plain password from the JSON format (pbkdf2_sha256$600000$PASSWORD)
            password_field = user_data['password']
            if password_field.startswith('pbkdf2_sha256$'):
                # Extract the plain password (last part after $)
                plain_password = password_field.split('$')[-1]
                # Hash it properly
                hashed_password = make_password(plain_password)
            else:
                # If already properly formatted or plain text, hash it
                hashed_password = make_password(password_field)

            # Create user
            user, created = User.objects.update_or_create(
                id=user_data['id'],
                defaults={
                    'username': user_data['username'],
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'password': hashed_password,
                    'is_active': user_data['is_active'],
                    'is_staff': user_data['is_staff'],
                    'is_superuser': user_data['is_superuser'],
                    'date_joined': date_joined,
                    'last_login': last_login,
                    'bio': user_data.get('bio', ''),
                    'phone_number': user_data.get('phone_number', ''),
                    'city': user_data.get('city', ''),
                    'country': user_data.get('country', 'Egypt'),
                    'user_type': user_data.get('user_type', 'client'),
                    'average_rating': user_data.get('average_rating', 0.0),
                    'total_reviews': user_data.get('total_reviews', 0),
                    'is_verified': user_data.get('is_verified', False),
                    'profile_picture': user_data.get('profile_picture'),
                    'created_at': created_at,
                    'updated_at': updated_at,
                }
            )
            if created:
                self.stats['users'] += 1

        print(f"[OK] Loaded {self.stats['users']} users")

    @transaction.atomic
    def load_categories(self):
        """Load task categories"""
        print("Loading categories...")
        categories_data = self.load_json('categories.json')

        for cat_data in categories_data:
            category, created = Category.objects.update_or_create(
                id=cat_data['id'],
                defaults={
                    'name': cat_data['name'],
                    'slug': cat_data['slug'],
                    'description': cat_data.get('description', ''),
                    'icon': cat_data.get('icon', ''),
                    'is_active': cat_data.get('is_active', True),
                    'order': cat_data.get('order', 0),
                    'created_at': self.parse_datetime(cat_data['created_at']),
                    'updated_at': self.parse_datetime(cat_data['updated_at']),
                }
            )
            if created:
                self.stats['categories'] += 1

        print(f"[OK] Loaded {self.stats['categories']} categories")

    @transaction.atomic
    def load_skills(self):
        """Load skills"""
        print("Loading skills...")
        skills_data = self.load_json('skills.json')

        for skill_data in skills_data:
            skill, created = Skill.objects.update_or_create(
                id=skill_data['id'],
                defaults={
                    'name': skill_data['name'],
                    'slug': skill_data['slug'],
                    'category': skill_data.get('category', 'other'),
                    'description': skill_data.get('description', ''),
                    'is_active': skill_data.get('is_active', True),
                    'usage_count': skill_data.get('usage_count', 0),
                    'created_at': self.parse_datetime(skill_data['created_at']),
                    'updated_at': self.parse_datetime(skill_data['updated_at']),
                }
            )
            if created:
                self.stats['skills'] += 1

        print(f"[OK] Loaded {self.stats['skills']} skills")

    @transaction.atomic
    def load_user_skills(self):
        """Load user skills"""
        print("Loading user skills...")
        user_skills_data = self.load_json('user_skills.json')

        for us_data in user_skills_data:
            user_skill, created = UserSkill.objects.update_or_create(
                id=us_data['id'],
                defaults={
                    'user_id': us_data['user_id'],
                    'skill_id': us_data['skill_id'],
                    'proficiency': us_data.get('proficiency', 'intermediate'),
                    'years_experience': us_data.get('years_experience'),
                    'is_primary': us_data.get('is_primary', False),
                    'created_at': self.parse_datetime(us_data['created_at']),
                    'updated_at': self.parse_datetime(us_data['updated_at']),
                }
            )
            if created:
                self.stats['user_skills'] += 1

        print(f"[OK] Loaded {self.stats['user_skills']} user skills")

    @transaction.atomic
    def load_tasks(self):
        """Load tasks"""
        print("Loading tasks...")
        tasks_data = self.load_json('tasks.json')

        for task_data in tasks_data:
            task, created = Task.objects.update_or_create(
                id=task_data['id'],
                defaults={
                    'client_id': task_data['client_id'],
                    'category_id': task_data.get('category_id'),
                    'title': task_data['title'],
                    'description': task_data['description'],
                    'task_type': task_data.get('task_type', 'DIGITAL'),
                    'listing_type': task_data.get('listing_type', 'task_request'),
                    'budget': task_data['budget'],
                    'is_negotiable': task_data.get('is_negotiable', True),
                    'location': task_data.get('location'),
                    'city': task_data.get('city'),
                    'is_remote': task_data.get('is_remote', False),
                    'deadline': self.parse_datetime(task_data.get('deadline')),
                    'estimated_duration': task_data.get('estimated_duration'),
                    'status': task_data.get('status', 'OPEN'),
                    'assigned_to_id': task_data.get('assigned_to_id'),
                    'views_count': task_data.get('views_count', 0),
                    'applications_count': task_data.get('applications_count', 0),
                    'created_at': self.parse_datetime(task_data['created_at']),
                    'updated_at': self.parse_datetime(task_data['updated_at']),
                    'completed_at': self.parse_datetime(task_data.get('completed_at')),
                    'image': task_data.get('image'),
                }
            )
            if created:
                self.stats['tasks'] += 1

        print(f"[OK] Loaded {self.stats['tasks']} tasks")

    @transaction.atomic
    def load_task_skills(self):
        """Load task-skill relationships"""
        print("Loading task skills...")
        task_skills_data = self.load_json('task_skills.json')

        for ts_data in task_skills_data:
            task = Task.objects.get(id=ts_data['task_id'])
            skill = Skill.objects.get(id=ts_data['skill_id'])
            task.required_skills.add(skill)
            self.stats['task_skills'] += 1

        print(f"[OK] Loaded {self.stats['task_skills']} task skills")

    @transaction.atomic
    def load_proposals(self):
        """Load proposals"""
        print("Loading proposals...")
        proposals_data = self.load_json('proposals.json')

        for prop_data in proposals_data:
            proposal, created = TaskApplication.objects.update_or_create(
                id=prop_data['id'],
                defaults={
                    'task_id': prop_data['task_id'],
                    'freelancer_id': prop_data['freelancer_id'],
                    'proposal': prop_data['proposal'],
                    'offered_price': prop_data['offered_price'],
                    'estimated_time': prop_data.get('estimated_time', ''),
                    'cover_letter': prop_data.get('cover_letter', ''),
                    'status': prop_data.get('status', 'PENDING'),
                    'created_at': self.parse_datetime(prop_data['created_at']),
                    'updated_at': self.parse_datetime(prop_data['updated_at']),
                }
            )
            if created:
                self.stats['proposals'] += 1

        print(f"[OK] Loaded {self.stats['proposals']} proposals")

    @transaction.atomic
    def load_reviews(self):
        """Load reviews"""
        print("Loading reviews...")
        reviews_data = self.load_json('reviews.json')

        for review_data in reviews_data:
            review, created = Review.objects.update_or_create(
                id=review_data['id'],
                defaults={
                    'task_id': review_data['task_id'],
                    'reviewer_id': review_data['reviewer_id'],
                    'reviewee_id': review_data['reviewee_id'],
                    'rating': review_data['rating'],
                    'comment': review_data['comment'],
                    'communication_rating': review_data.get('communication_rating'),
                    'quality_rating': review_data.get('quality_rating'),
                    'professionalism_rating': review_data.get('professionalism_rating'),
                    'is_public': review_data.get('is_public', True),
                    'is_verified': review_data.get('is_verified', False),
                    'created_at': self.parse_datetime(review_data['created_at']),
                    'updated_at': self.parse_datetime(review_data['updated_at']),
                }
            )
            if created:
                self.stats['reviews'] += 1

        print(f"[OK] Loaded {self.stats['reviews']} reviews")

    def load_all(self):
        """Load all datasets"""
        print("=" * 60)
        print("MultiTasks Dataset Loader")
        print("=" * 60)
        print()

        try:
            # Load in order due to foreign key dependencies
            self.load_users()
            self.load_categories()
            self.load_skills()
            self.load_user_skills()
            self.load_tasks()
            self.load_task_skills()
            self.load_proposals()
            self.load_reviews()

            print()
            print("=" * 60)
            print("Dataset Loading Complete!")
            print("=" * 60)
            print()
            print("Statistics:")
            for key, value in self.stats.items():
                print(f"  {key.replace('_', ' ').title()}: {value}")
            print()

            # Verify special user
            try:
                menna = User.objects.get(username='menna_allah_mostafa')
                menna_skills = UserSkill.objects.filter(user=menna).count()
                menna_reviews = Review.objects.filter(reviewee=menna).count()
                menna_proposals = TaskApplication.objects.filter(freelancer=menna).count()

                print("Special User 'menna_allah_mostafa' verified:")
                print(f"  - ID: {menna.id}")
                print(f"  - Skills: {menna_skills}")
                print(f"  - Proposals: {menna_proposals}")
                print(f"  - Reviews: {menna_reviews}")
                print(f"  - Average Rating: {menna.average_rating}")
                print(f"  - Verified: {menna.is_verified}")
                print()
            except User.DoesNotExist:
                print("[WARNING] Special user 'menna_allah_mostafa' not found")
                print()

            print("[OK] All datasets loaded successfully!")
            print()

        except Exception as e:
            print(f"\n[ERROR] Error loading datasets: {e}")
            import traceback
            traceback.print_exc()
            return False

        return True


def main():
    """Main function"""
    # Check if we should clear existing data
    import sys
    clear_data = '--clear' in sys.argv

    if clear_data:
        print("[WARNING] This will delete all existing data!")
        response = input("Are you sure you want to continue? (yes/no): ")
        if response.lower() != 'yes':
            print("Aborted.")
            return

        print("\nClearing existing data...")
        Review.objects.all().delete()
        TaskApplication.objects.all().delete()
        Task.objects.all().delete()
        UserSkill.objects.all().delete()
        Skill.objects.all().delete()
        Category.objects.all().delete()
        User.objects.all().delete()
        print("[OK] Data cleared.\n")

    # Load datasets
    loader = DatasetLoader()
    success = loader.load_all()

    if success:
        print("Dataset loading completed successfully!")
    else:
        print("Dataset loading failed. Please check the errors above.")
        sys.exit(1)


if __name__ == '__main__':
    main()
