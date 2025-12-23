"""
Populate menna_allah_mostafa account with tasks and applications
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import random
from decimal import Decimal

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitask_backend.settings')
django.setup()

from accounts.models import User
from tasks.models import Task, TaskApplication, Review, Category

def main():
    print("Populating menna_allah_mostafa with tasks and applications...\n")

    # Get menna user
    try:
        menna = User.objects.get(username='menna_allah_mostafa')
        print(f"[OK] Found user: {menna.get_full_name()}")
    except User.DoesNotExist:
        print("[ERROR] User not found!")
        return

    # Get other users
    clients = list(User.objects.filter(user_type__in=['client', 'both']).exclude(id=menna.id).order_by('?')[:15])
    print(f"[OK] Found {len(clients)} potential clients\n")

    # Get categories
    categories = list(Category.objects.all()[:10])

    # Create tasks where menna applied (as freelancer)
    print("Creating task applications...")

    tasks_to_apply = [
        {
            'title': 'Django REST API for Mobile App',
            'description': 'Need an experienced Django developer to build a robust REST API for our mobile application. The API should handle user authentication, real-time data sync, and push notifications.',
            'budget': Decimal('12000.00'),
            'status': 'IN_PROGRESS',
            'client': clients[0],
            'proposal_text': "Hi! I'm very interested in this project. I have 8+ years of experience building Django REST APIs with features like JWT authentication, WebSocket integration, and FCM push notifications. I can deliver a production-ready API with comprehensive documentation within 3 weeks. My rate is 400 EGP/hour.",
            'proposal_budget': Decimal('11500.00'),
            'application_status': 'ACCEPTED',
            'hours_ago': 120,
        },
        {
            'title': 'E-commerce Platform Optimization',
            'description': 'Looking for a full-stack developer to optimize our e-commerce platform. Issues include slow query performance, high server load, and inefficient frontend rendering.',
            'budget': Decimal('15000.00'),
            'status': 'OPEN',
            'client': clients[1],
            'proposal_text': "I specialize in performance optimization for Django applications. I'll conduct a thorough analysis of your database queries, implement caching strategies, optimize your ORM usage, and improve frontend performance with code splitting and lazy loading. Expected delivery: 2 weeks.",
            'proposal_budget': Decimal('14000.00'),
            'application_status': 'PENDING',
            'hours_ago': 48,
        },
        {
            'title': 'React Dashboard Development',
            'description': 'Need a React developer to build an analytics dashboard with charts, real-time data updates, and user management features.',
            'budget': Decimal('10000.00'),
            'status': 'IN_PROGRESS',
            'client': clients[2],
            'proposal_text': "I have extensive experience building React dashboards with libraries like Chart.js and D3.js. I'll use React Query for data fetching, implement real-time updates with WebSockets, and ensure the dashboard is fully responsive and performant.",
            'proposal_budget': Decimal('9500.00'),
            'application_status': 'ACCEPTED',
            'hours_ago': 240,
        },
        {
            'title': 'Machine Learning Model Integration',
            'description': 'Have a trained ML model (customer churn prediction) that needs to be integrated into our Django backend with API endpoints and monitoring.',
            'budget': Decimal('8000.00'),
            'status': 'OPEN',
            'client': clients[3],
            'proposal_text': "I've integrated multiple ML models into Django applications. I'll create a REST API endpoint for predictions, implement response caching, add model performance monitoring, and set up automated retraining pipelines. Timeline: 10 days.",
            'proposal_budget': Decimal('7500.00'),
            'application_status': 'PENDING',
            'hours_ago': 72,
        },
        {
            'title': 'Payment Gateway Integration (Stripe)',
            'description': 'Urgent: Need to fix 3D Secure authentication issues in our Stripe integration for international payments.',
            'budget': Decimal('3000.00'),
            'status': 'COMPLETED',
            'client': clients[4],
            'proposal_text': "I have deep experience with Stripe's Payment Intents API and 3D Secure authentication. I've resolved similar issues before - usually related to redirect URL configuration or webhook handling. I can fix this quickly.",
            'proposal_budget': Decimal('2500.00'),
            'application_status': 'ACCEPTED',
            'hours_ago': 168,
        },
        {
            'title': 'Database Migration PostgreSQL to MySQL',
            'description': 'Need help migrating our Django application from PostgreSQL to MySQL while maintaining data integrity and minimizing downtime.',
            'budget': Decimal('6000.00'),
            'status': 'OPEN',
            'client': clients[5],
            'proposal_text': "I can handle this migration safely. I'll create a migration script, test it thoroughly in a staging environment, implement a rollback plan, and execute the migration with minimal downtime. I've done similar migrations before.",
            'proposal_budget': Decimal('5800.00'),
            'application_status': 'REJECTED',
            'hours_ago': 96,
        },
    ]

    created_applications = 0
    created_tasks = 0

    for task_data in tasks_to_apply:
        # Create task
        created_time = timezone.now() - timedelta(hours=task_data['hours_ago'])

        task = Task.objects.create(
            title=task_data['title'],
            description=task_data['description'],
            budget=task_data['budget'],
            status=task_data['status'],
            client=task_data['client'],
            category=random.choice(categories) if categories else None,
            deadline=timezone.now() + timedelta(days=random.randint(7, 30)),
            location=task_data['client'].city or 'Cairo',
            task_type=random.choice(['DIGITAL', 'HYBRID']),
        )

        # Update created_at
        Task.objects.filter(id=task.id).update(created_at=created_time)
        created_tasks += 1

        # Create application
        application = TaskApplication.objects.create(
            task=task,
            freelancer=menna,
            proposal=task_data['proposal_text'],
            offered_price=task_data['proposal_budget'],
            estimated_time=f"{random.randint(7, 30)} days",
            status=task_data['application_status'],
        )

        # Update application created_at
        TaskApplication.objects.filter(id=application.id).update(
            created_at=created_time + timedelta(hours=random.randint(1, 12))
        )
        created_applications += 1

        # If task is completed, assign to menna and create a review
        if task_data['status'] == 'COMPLETED':
            task.assigned_to = menna
            task.save()

            # Create review
            Review.objects.create(
                task=task,
                reviewer=task_data['client'],
                reviewee=menna,
                rating=5,
                comment="Excellent work! Very professional, delivered ahead of schedule, and the code quality was outstanding. Will definitely hire again!",
                created_at=timezone.now() - timedelta(hours=task_data['hours_ago'] - 24),
            )

    print(f"[OK] Created {created_tasks} tasks and {created_applications} applications\n")

    # Update menna's stats
    print("Updating user statistics...")

    # Count completed tasks
    completed_tasks = Task.objects.filter(assigned_to=menna, status='COMPLETED').count()

    # Calculate average rating
    reviews = Review.objects.filter(reviewee=menna)
    if reviews.exists():
        avg_rating = sum(r.rating for r in reviews) / reviews.count()
        menna.average_rating = avg_rating
        menna.total_reviews = reviews.count()

    menna.save()
    print(f"[OK] Updated stats: {completed_tasks} completed tasks, {menna.total_reviews} reviews, {menna.average_rating:.2f} avg rating\n")

    # Summary
    print("=" * 50)
    print("Data population complete!")
    print("=" * 50)
    print(f"Tasks created: {created_tasks}")
    print(f"Applications: {created_applications}")
    print(f"Completed tasks: {completed_tasks}")
    print(f"Total reviews: {menna.total_reviews}")
    print(f"Average rating: {menna.average_rating:.2f}")

if __name__ == '__main__':
    main()
