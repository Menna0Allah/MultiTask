"""
Populate menna_allah_mostafa account with realistic data:
- Conversations with messages
- Notifications
- Tasks and applications
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitask_backend.settings')
django.setup()

from accounts.models import User
from messaging.models import Conversation, Message
from notifications.models import Notification
from tasks.models import Task, TaskApplication

def main():
    print("Populating menna_allah_mostafa account with data...\n")

    # Get menna user
    try:
        menna = User.objects.get(username='menna_allah_mostafa')
        print(f"[OK] Found user: {menna.get_full_name()} (@{menna.username})")
    except User.DoesNotExist:
        print("[ERROR] User 'menna_allah_mostafa' not found!")
        return

    # Get other users for conversations
    other_users = list(User.objects.exclude(id=menna.id).order_by('?')[:10])
    print(f"[OK] Found {len(other_users)} other users for conversations\n")

    # Create conversations
    print("Creating conversations...")
    conversations_data = [
        {
            'other_user': other_users[0],
            'task_title': 'Django REST API Development',
            'messages': [
                {'sender': 'other', 'content': "Hi Menna! I saw your profile and I'm really impressed with your experience in Django. Are you available for a new project?", 'hours_ago': 24},
                {'sender': 'menna', 'content': "Hello! Thank you for reaching out. Yes, I'm available. What kind of project are you working on?", 'hours_ago': 23},
                {'sender': 'other', 'content': "We need to build a REST API for a mobile app. It involves user authentication, data synchronization, and real-time notifications.", 'hours_ago': 22},
                {'sender': 'menna', 'content': "Sounds interesting! I have extensive experience with Django REST Framework, JWT authentication, and WebSocket for real-time features. When would you like to start?", 'hours_ago': 21},
                {'sender': 'other', 'content': "That's perfect! Can we schedule a call tomorrow to discuss the details and timeline?", 'hours_ago': 2},
            ]
        },
        {
            'other_user': other_users[1],
            'task_title': 'E-commerce Website Redesign',
            'messages': [
                {'sender': 'other', 'content': "Hey Menna! I need help redesigning our e-commerce platform. We're using React and Django. Are you familiar with both?", 'hours_ago': 48},
                {'sender': 'menna', 'content': "Hi! Yes, I work with both React and Django regularly. What specific improvements are you looking for?", 'hours_ago': 47},
                {'sender': 'other', 'content': "We want to improve the checkout flow, add a recommendation system, and modernize the UI. Our current conversion rate is quite low.", 'hours_ago': 46},
                {'sender': 'menna', 'content': "I can definitely help with that. I've implemented recommendation systems before using collaborative filtering. For the UI, I'd suggest using a modern component library like Material-UI or Tailwind.", 'hours_ago': 45},
                {'sender': 'other', 'content': "Great! We prefer Tailwind. Can you send me a quote for the full project?", 'hours_ago': 44},
                {'sender': 'menna', 'content': "Sure! Based on what you've described, I estimate this would take about 4-6 weeks. I'll send you a detailed proposal by end of day.", 'hours_ago': 1},
            ]
        },
        {
            'other_user': other_users[2],
            'task_title': 'Machine Learning Model Integration',
            'messages': [
                {'sender': 'menna', 'content': "Hello! I saw your job posting for ML model integration. I have experience with TensorFlow and scikit-learn. Can you tell me more about the project?", 'hours_ago': 72},
                {'sender': 'other', 'content': "Hi Menna! We have a customer churn prediction model that needs to be integrated into our Django backend.", 'hours_ago': 71},
                {'sender': 'menna', 'content': "Perfect! I've done similar work before. Do you already have the trained model, or do you need help with that as well?", 'hours_ago': 70},
                {'sender': 'other', 'content': "We have the model trained and saved as a .h5 file. We need someone to create an API endpoint and optimize the prediction process.", 'hours_ago': 69},
                {'sender': 'menna', 'content': "Got it. I can create a REST API endpoint, implement caching for frequently requested predictions, and set up monitoring. When do you need this completed?", 'hours_ago': 3},
            ]
        },
        {
            'other_user': other_users[3],
            'task_title': 'Quick Bug Fix - Payment Gateway',
            'messages': [
                {'sender': 'other', 'content': "URGENT: Our payment gateway integration is failing for international cards. Can you help?", 'hours_ago': 5},
                {'sender': 'menna', 'content': "I can take a look. Which payment gateway are you using?", 'hours_ago': 4},
                {'sender': 'other', 'content': "Stripe. The error happens specifically with 3D Secure authentication.", 'hours_ago': 4},
                {'sender': 'menna', 'content': "Ah, I've dealt with this before. It's likely a redirect URL configuration issue. Can you share your repository or the relevant code?", 'hours_ago': 4},
                {'sender': 'other', 'content': "Sending you the GitHub link now. We're willing to pay extra for urgent delivery!", 'hours_ago': 3},
                {'sender': 'menna', 'content': "Received! I'll have this fixed within the next 2 hours. I'll update you as soon as it's ready for testing.", 'hours_ago': 0.5},
            ]
        },
        {
            'other_user': other_users[4],
            'task_title': 'Database Optimization & Performance',
            'messages': [
                {'sender': 'other', 'content': "Hi Menna! Our Django app is experiencing slow query performance. We have about 2 million records in our main table.", 'hours_ago': 96},
                {'sender': 'menna', 'content': "Hello! Slow queries with large datasets are common. Have you added database indexes on frequently queried fields?", 'hours_ago': 95},
                {'sender': 'other', 'content': "We have some indexes but I'm not sure if they're optimal. We're also using Django ORM which might be generating inefficient queries.", 'hours_ago': 94},
                {'sender': 'menna', 'content': "I can help with that. I'll analyze your models, optimize your queries using select_related and prefetch_related, and add appropriate indexes. I'll also set up query profiling so you can monitor performance.", 'hours_ago': 93},
                {'sender': 'other', 'content': "That sounds exactly what we need! How long would this typically take?", 'hours_ago': 92},
                {'sender': 'menna', 'content': "Usually 1-2 weeks depending on the complexity of your models. I'll start with a performance audit and give you a detailed timeline after that.", 'hours_ago': 6},
            ]
        },
        {
            'other_user': other_users[5],
            'task_title': 'React Native App Development',
            'messages': [
                {'sender': 'menna', 'content': "Hi! I noticed you're looking for a React Native developer. I've built several cross-platform apps. Would love to discuss your project!", 'hours_ago': 120},
                {'sender': 'other', 'content': "Hi Menna! Yes, we're building a fitness tracking app. Do you have experience with health/fitness apps?", 'hours_ago': 119},
                {'sender': 'menna', 'content': "I haven't built a fitness app specifically, but I've worked with device sensors, GPS tracking, and data visualization which are common in fitness apps. What features are you planning?", 'hours_ago': 118},
                {'sender': 'other', 'content': "Main features are: workout tracking, nutrition logging, progress charts, and social sharing. We also want to integrate with Apple Health and Google Fit.", 'hours_ago': 117},
                {'sender': 'menna', 'content': "Those integrations are straightforward with React Native. I've used react-native-health and Google Fit SDK before. Let me prepare a technical proposal for you.", 'hours_ago': 12},
            ]
        },
        {
            'other_user': other_users[6],
            'task_title': 'Code Review & Best Practices',
            'messages': [
                {'sender': 'other', 'content': "Hello Menna! We're a startup and our codebase has grown messy. Can you do a comprehensive code review?", 'hours_ago': 8},
                {'sender': 'menna', 'content': "Absolutely! I do thorough code reviews covering security, performance, maintainability, and Django best practices. How large is your codebase?", 'hours_ago': 7},
                {'sender': 'other', 'content': "About 50k lines of Python code. We're particularly worried about security vulnerabilities.", 'hours_ago': 7},
                {'sender': 'menna', 'content': "I'll use automated tools like Bandit for security scanning, pylint for code quality, and then do a manual review. I'll provide a detailed report with prioritized recommendations. This usually takes 3-5 days.", 'hours_ago': 0.25},
            ]
        },
    ]

    created_conversations = 0
    created_messages = 0

    for conv_data in conversations_data:
        # Create new conversation
        conversation = Conversation.objects.create(
            task=None  # We'll link to tasks later if needed
        )
        conversation.participants.add(menna, conv_data['other_user'])
        created_conversations += 1

        # Create messages
        for msg_data in conv_data['messages']:
            sender = menna if msg_data['sender'] == 'menna' else conv_data['other_user']
            created_time = timezone.now() - timedelta(hours=msg_data['hours_ago'])

            message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=msg_data['content'],
                message_type='TEXT',
                is_read=(msg_data['sender'] == 'menna')  # Menna has read her own messages
            )

            # Update the created_at timestamp
            Message.objects.filter(id=message.id).update(created_at=created_time)
            created_messages += 1

        # Update conversation last message
        last_msg = conv_data['messages'][-1]
        last_sender = menna if last_msg['sender'] == 'menna' else conv_data['other_user']
        conversation.last_message_content = last_msg['content']
        conversation.last_message_at = timezone.now() - timedelta(hours=last_msg['hours_ago'])
        conversation.last_message_sender = last_sender
        conversation.save()

    print(f"[OK] Created {created_conversations} conversations with {created_messages} messages\n")

    # Create notifications
    print("Creating notifications...")

    notifications_data = [
        {
            'type': 'task_application',
            'title': 'New Application Submitted',
            'message': 'Your application for "Django REST API Development" has been submitted successfully.',
            'hours_ago': 24,
            'is_read': False,
        },
        {
            'type': 'application_accepted',
            'title': 'Application Accepted!',
            'message': f'{other_users[1].get_full_name()} accepted your application for "E-commerce Website Redesign".',
            'hours_ago': 48,
            'is_read': True,
        },
        {
            'type': 'new_message',
            'title': 'New Message',
            'message': f'{other_users[3].get_full_name()} sent you a message about "Payment Gateway Bug Fix".',
            'hours_ago': 0.5,
            'is_read': False,
        },
        {
            'type': 'payment_received',
            'title': 'Payment Received',
            'message': 'You received 15,000 EGP for completing "Mobile App Backend Development".',
            'hours_ago': 72,
            'is_read': True,
        },
        {
            'type': 'review_received',
            'title': 'New 5-Star Review!',
            'message': f'{other_users[0].get_full_name()} left you a 5-star review: "Excellent work! Very professional and delivered ahead of schedule."',
            'hours_ago': 96,
            'is_read': True,
        },
        {
            'type': 'task_update',
            'title': 'Task Deadline Updated',
            'message': 'The deadline for "Database Optimization" has been extended by 3 days.',
            'hours_ago': 12,
            'is_read': False,
        },
        {
            'type': 'task_reminder',
            'title': 'Task Deadline Approaching',
            'message': 'Reminder: "Machine Learning Integration" is due in 2 days.',
            'hours_ago': 6,
            'is_read': False,
        },
        {
            'type': 'new_message',
            'title': 'New Message',
            'message': f'{other_users[2].get_full_name()} sent you a message.',
            'hours_ago': 3,
            'is_read': False,
        },
        {
            'type': 'task_application',
            'title': 'New Task Match!',
            'message': 'We found 3 new tasks that match your skills: Python, Django, React.',
            'hours_ago': 24,
            'is_read': True,
        },
        {
            'type': 'system',
            'title': 'Profile Views',
            'message': 'Your profile has been viewed 127 times this week! Keep up the great work!',
            'hours_ago': 168,
            'is_read': True,
        },
        {
            'type': 'application_accepted',
            'title': 'Application Accepted',
            'message': f'{other_users[4].get_full_name()} accepted your proposal for "API Development".',
            'hours_ago': 120,
            'is_read': True,
        },
        {
            'type': 'payment_received',
            'title': 'Milestone Payment',
            'message': 'You received a milestone payment of 8,000 EGP for "React Dashboard Development".',
            'hours_ago': 48,
            'is_read': True,
        },
        {
            'type': 'new_message',
            'title': 'New Message',
            'message': f'{other_users[5].get_full_name()} replied to your message.',
            'hours_ago': 12,
            'is_read': False,
        },
        {
            'type': 'review_received',
            'title': 'New Review',
            'message': f'{other_users[6].get_full_name()} rated your work 5 stars and said: "Amazing developer! Will hire again."',
            'hours_ago': 240,
            'is_read': True,
        },
        {
            'type': 'task_completed',
            'title': 'Task Completed',
            'message': 'You successfully completed "WordPress Plugin Development". Payment is being processed.',
            'hours_ago': 72,
            'is_read': True,
        },
    ]

    created_notifications = 0
    for notif_data in notifications_data:
        created_time = timezone.now() - timedelta(hours=notif_data['hours_ago'])
        notification = Notification.objects.create(
            recipient=menna,
            notification_type=notif_data['type'],
            title=notif_data['title'],
            message=notif_data['message'],
            is_read=notif_data['is_read'],
            read_at=created_time if notif_data['is_read'] else None,
        )
        # Update created_at timestamp
        Notification.objects.filter(id=notification.id).update(created_at=created_time)
        created_notifications += 1

    print(f"[OK] Created {created_notifications} notifications\n")

    # Summary
    print("=" * 50)
    print("Data population complete!")
    print("=" * 50)
    print(f"Conversations: {created_conversations}")
    print(f"Messages: {created_messages}")
    print(f"Notifications: {created_notifications}")
    print("\nmenna_allah_mostafa account is now populated with realistic data!")

if __name__ == '__main__':
    main()
