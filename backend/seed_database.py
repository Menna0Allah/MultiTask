import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitask_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils.text import slugify
from tasks.models import Category, Task
from datetime import datetime, timedelta

User = get_user_model()

def seed_database():
    print("Starting database seeding...")

    # Clear existing data
    print("Clearing existing data...")
    Task.objects.all().delete()
    Category.objects.all().delete()
    User.objects.filter(is_superuser=False).delete()

    # Create categories with specific IDs to match frontend
    print("Creating categories...")
    categories_data = [
        (1, 'Cleaning & Home', 'Home cleaning, organization, and maintenance services', '🧹'),
        (2, 'Tutoring', 'Educational tutoring and teaching services', '📚'),
        (3, 'Design', 'Graphic design, UI/UX, and creative services', '🎨'),
        (4, 'Programming', 'Software development and coding services', '💻'),
        (5, 'Writing', 'Content writing, copywriting, and editing services', '✍️'),
        (6, 'Marketing', 'Digital marketing and promotional services', '📊'),
    ]

    categories = {}
    for cat_id, name, description, icon in categories_data:
        category, created = Category.objects.get_or_create(
            id=cat_id,
            defaults={
                'name': name,
                'slug': slugify(name),
                'description': description,
                'icon': icon
            }
        )
        categories[name] = category
        print(f"  + {name} (ID: {cat_id})")

    # Create users
    print("\nCreating users...")

    # Clients
    client1 = User.objects.create_user(
        username='john_client',
        email='john@example.com',
        password='password123',
        first_name='John',
        last_name='Doe',
        user_type='client'
    )
    print("  + Client: john_client")

    client2 = User.objects.create_user(
        username='sarah_client',
        email='sarah@example.com',
        password='password123',
        first_name='Sarah',
        last_name='Smith',
        user_type='client'
    )
    print("  + Client: sarah_client")

    # Freelancers
    freelancer1 = User.objects.create_user(
        username='mike_freelancer',
        email='mike@example.com',
        password='password123',
        first_name='Mike',
        last_name='Johnson',
        user_type='freelancer'
    )
    print("  + Freelancer: mike_freelancer")

    freelancer2 = User.objects.create_user(
        username='emma_freelancer',
        email='emma@example.com',
        password='password123',
        first_name='Emma',
        last_name='Wilson',
        user_type='freelancer'
    )
    print("  + Freelancer: emma_freelancer")

    # Both client and freelancer
    both_user = User.objects.create_user(
        username='david',
        email='david@example.com',
        password='password123',
        first_name='David',
        last_name='Brown',
        user_type='both'
    )
    print("  + Both: david")

    # Create tasks for each category
    print("\nCreating tasks...")

    tasks_data = [
        # Cleaning & Home
        {
            'category': categories['Cleaning & Home'],
            'client': client1,
            'title': 'Deep Clean 3-Bedroom Apartment',
            'description': 'Need a thorough deep cleaning of my 3-bedroom apartment including kitchen and bathrooms. All cleaning supplies will be provided.',
            'budget': 150.00,
            'location': 'Cairo, Egypt',
            'task_type': 'ONE_TIME'
        },
        {
            'category': categories['Cleaning & Home'],
            'client': client2,
            'title': 'Weekly House Cleaning Service',
            'description': 'Looking for a reliable cleaner for weekly house cleaning. 2 bedrooms, living room, kitchen, and bathroom.',
            'budget': 80.00,
            'location': 'Alexandria, Egypt',
            'task_type': 'RECURRING'
        },
        {
            'category': categories['Cleaning & Home'],
            'client': both_user,
            'title': 'Garden Maintenance and Cleanup',
            'description': 'Need someone to clean up my garden, trim bushes, and general maintenance work.',
            'budget': 100.00,
            'location': 'Giza, Egypt',
            'task_type': 'ONE_TIME'
        },

        # Tutoring
        {
            'category': categories['Tutoring'],
            'client': client1,
            'title': 'Math Tutor for High School Student',
            'description': 'Looking for an experienced math tutor to help my son with algebra and geometry. Prefer online sessions.',
            'budget': 25.00,
            'location': 'Cairo, Egypt',
            'task_type': 'RECURRING',
            'is_remote': True
        },
        {
            'category': categories['Tutoring'],
            'client': client2,
            'title': 'English Language Tutor',
            'description': 'Need an English tutor for conversation practice and grammar improvement. 2 sessions per week.',
            'budget': 30.00,
            'location': 'Cairo, Egypt',
            'task_type': 'RECURRING',
            'is_remote': True
        },
        {
            'category': categories['Tutoring'],
            'client': both_user,
            'title': 'Piano Lessons for Beginner',
            'description': 'Looking for piano teacher for beginner level. Prefer in-person lessons.',
            'budget': 40.00,
            'location': 'Alexandria, Egypt',
            'task_type': 'RECURRING'
        },

        # Design
        {
            'category': categories['Design'],
            'client': client1,
            'title': 'Logo Design for Startup',
            'description': 'Need a professional logo design for my tech startup. Looking for modern and minimalist style.',
            'budget': 200.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
        {
            'category': categories['Design'],
            'client': client2,
            'title': 'Social Media Graphics Package',
            'description': 'Need 20 social media post designs for Instagram and Facebook. Brand guidelines will be provided.',
            'budget': 150.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
        {
            'category': categories['Design'],
            'client': both_user,
            'title': 'Website UI/UX Design',
            'description': 'Looking for UI/UX designer to create mockups for an e-commerce website. Need complete design for 10 pages.',
            'budget': 500.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },

        # Programming
        {
            'category': categories['Programming'],
            'client': client1,
            'title': 'Python Script for Data Analysis',
            'description': 'Need a Python script to analyze sales data from CSV files and generate reports.',
            'budget': 300.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
        {
            'category': categories['Programming'],
            'client': client2,
            'title': 'React Website Development',
            'description': 'Looking for React developer to build a portfolio website. Design files will be provided.',
            'budget': 800.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
        {
            'category': categories['Programming'],
            'client': both_user,
            'title': 'Mobile App Bug Fixes',
            'description': 'Need developer to fix bugs in existing React Native mobile app. List of issues will be provided.',
            'budget': 400.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },

        # Writing
        {
            'category': categories['Writing'],
            'client': client1,
            'title': 'Blog Content Writing',
            'description': 'Need 10 blog articles (500-800 words each) about digital marketing topics. SEO optimized.',
            'budget': 250.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
        {
            'category': categories['Writing'],
            'client': client2,
            'title': 'Product Descriptions for E-commerce',
            'description': 'Need compelling product descriptions for 50 items in my online store.',
            'budget': 200.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
        {
            'category': categories['Writing'],
            'client': both_user,
            'title': 'Technical Documentation',
            'description': 'Looking for technical writer to create user documentation for software product.',
            'budget': 400.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },

        # Marketing
        {
            'category': categories['Marketing'],
            'client': client1,
            'title': 'Social Media Management',
            'description': 'Need social media manager to handle Facebook and Instagram accounts. Content creation and scheduling.',
            'budget': 300.00,
            'location': 'Remote',
            'task_type': 'RECURRING',
            'is_remote': True
        },
        {
            'category': categories['Marketing'],
            'client': client2,
            'title': 'Google Ads Campaign Setup',
            'description': 'Looking for expert to set up and optimize Google Ads campaign for my business.',
            'budget': 350.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
        {
            'category': categories['Marketing'],
            'client': both_user,
            'title': 'Email Marketing Campaign',
            'description': 'Need help creating and executing email marketing campaign. Design and copywriting included.',
            'budget': 250.00,
            'location': 'Remote',
            'task_type': 'ONE_TIME',
            'is_remote': True
        },
    ]

    for task_data in tasks_data:
        deadline = datetime.now() + timedelta(days=30)
        task = Task.objects.create(
            **task_data,
            deadline=deadline,
            status='OPEN'
        )
        print(f"  + {task.title} ({task.category.name})")

    print(f"\n[SUCCESS] Database seeded successfully!")
    print(f"   - {Category.objects.count()} categories")
    print(f"   - {User.objects.filter(is_superuser=False).count()} users")
    print(f"   - {Task.objects.count()} tasks")
    print(f"\nTest Users:")
    print(f"   Client: john_client / password123")
    print(f"   Client: sarah_client / password123")
    print(f"   Freelancer: mike_freelancer / password123")
    print(f"   Freelancer: emma_freelancer / password123")
    print(f"   Both: david / password123")

if __name__ == '__main__':
    seed_database()
