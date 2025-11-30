"""
Comprehensive Data Seeding Script for MultiTask Platform
Generates realistic fake data for all models to make the project look production-ready
"""

import os
import sys
import django
import random
from datetime import datetime, timedelta
from decimal import Decimal

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'multitask_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.text import slugify
from tasks.models import Category, Task, TaskApplication, Review
from messaging.models import Conversation, Message
from chatbot.models import ChatSession, ChatMessage

User = get_user_model()

# Configuration
NUM_CLIENTS = 50
NUM_FREELANCERS = 100
NUM_TASKS = 300
NUM_APPLICATIONS_PER_TASK = (2, 8)  # Range
NUM_CONVERSATIONS = 100
NUM_MESSAGES_PER_CONVERSATION = (5, 20)  # Range
NUM_CHATBOT_SESSIONS = 80

# Realistic data pools
FIRST_NAMES = [
    'Ahmed', 'Mohamed', 'Ali', 'Sarah', 'Fatma', 'Menna', 'Omar', 'Youssef', 'Nour', 'Hana',
    'John', 'Emma', 'Michael', 'Sophia', 'David', 'Olivia', 'James', 'Isabella', 'Robert', 'Mia',
    'William', 'Charlotte', 'Richard', 'Amelia', 'Joseph', 'Harper', 'Thomas', 'Evelyn', 'Christopher', 'Abigail',
    'Daniel', 'Emily', 'Matthew', 'Elizabeth', 'Anthony', 'Sofia', 'Mark', 'Avery', 'Donald', 'Ella',
    'Steven', 'Scarlett', 'Paul', 'Grace', 'Andrew', 'Chloe', 'Joshua', 'Victoria', 'Kenneth', 'Madison'
]

LAST_NAMES = [
    'Hassan', 'Ali', 'Mohamed', 'Ibrahim', 'Mahmoud', 'Ahmed', 'Youssef', 'Mansour', 'Farouk', 'Khalil',
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
]

CITIES = [
    'Cairo', 'Alexandria', 'Giza', 'Mansoura', 'Tanta', 'Aswan', 'Port Said', 'Luxor',
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool',
    'Dubai', 'Abu Dhabi', 'Riyadh', 'Jeddah', 'Doha', 'Kuwait City'
]

COUNTRIES = [
    'Egypt', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Spain',
    'Italy', 'Netherlands', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Jordan', 'Lebanon'
]

SKILLS_BY_CATEGORY = {
    'Cleaning & Home Services': [
        'Deep Cleaning', 'Carpet Cleaning', 'Window Cleaning', 'Move-in/Move-out Cleaning',
        'Organizing', 'Laundry Services', 'Ironing', 'Home Maintenance'
    ],
    'Tutoring & Education': [
        'Math Tutoring', 'English Teaching', 'Science Tutoring', 'Test Prep', 'Language Learning',
        'Music Lessons', 'Art Classes', 'Coding for Kids', 'Study Skills', 'Homework Help'
    ],
    'Design & Creative': [
        'Graphic Design', 'Logo Design', 'UI/UX Design', 'Illustration', 'Photo Editing',
        'Video Editing', '3D Modeling', 'Animation', 'Brand Identity', 'Adobe Photoshop',
        'Adobe Illustrator', 'Figma', 'Sketch', 'InDesign'
    ],
    'Programming & Tech': [
        'Python', 'JavaScript', 'React', 'Node.js', 'Django', 'Flask', 'Vue.js', 'Angular',
        'Web Development', 'Mobile Development', 'API Development', 'Database Design',
        'DevOps', 'Cloud Computing', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning'
    ],
    'Writing & Translation': [
        'Content Writing', 'Copywriting', 'Technical Writing', 'Creative Writing', 'Blog Writing',
        'Arabic Translation', 'English Translation', 'Proofreading', 'Editing', 'SEO Writing'
    ],
    'Marketing & Business': [
        'Digital Marketing', 'Social Media Marketing', 'SEO', 'Content Marketing', 'Email Marketing',
        'Facebook Ads', 'Google Ads', 'Business Consulting', 'Market Research', 'Brand Strategy'
    ],
    'Personal Assistant': [
        'Virtual Assistant', 'Data Entry', 'Email Management', 'Calendar Management',
        'Travel Planning', 'Research', 'Customer Service', 'Administrative Support'
    ],
}

# Task templates by category
TASK_TEMPLATES = {
    'Cleaning & Home Services': [
        ('Deep clean 3-bedroom apartment', 'Need professional deep cleaning for my 3-bedroom apartment. Including kitchen, bathrooms, living room, and bedrooms.', 80, 150),
        ('Regular weekly house cleaning', 'Looking for someone to do weekly house cleaning. Should be thorough and reliable.', 50, 100),
        ('Move-out cleaning service', 'Need complete move-out cleaning for apartment. Must be done before final inspection.', 100, 200),
        ('Office cleaning twice a week', 'Small office space needs cleaning twice weekly. About 500 sq ft.', 60, 120),
        ('Window cleaning for villa', 'Need professional window cleaning for 2-story villa with 20+ windows.', 70, 130),
    ],
    'Tutoring & Education': [
        ('Math tutor for high school student', 'Looking for experienced math tutor for calculus and algebra. 2 hours per week.', 30, 60),
        ('English conversation teacher', 'Need native English speaker for conversation practice. 3 sessions per week.', 40, 80),
        ('Piano lessons for beginner', 'Looking for patient piano teacher for complete beginner. Weekly lessons.', 35, 70),
        ('SAT prep tutoring', 'Experienced tutor needed for SAT preparation. Focus on math and English sections.', 50, 100),
        ('Arabic language lessons', 'Want to learn Arabic. Need tutor for 2-3 hours per week.', 25, 50),
    ],
    'Design & Creative': [
        ('Logo design for startup', 'Need modern, professional logo for tech startup. Multiple concept options required.', 100, 300),
        ('UI/UX design for mobile app', 'Looking for UI/UX designer to create screens for fitness tracking app. About 15 screens.', 500, 1500),
        ('Social media graphics package', 'Need 20 social media post designs for Instagram and Facebook. Brand guidelines provided.', 150, 400),
        ('Video editing for YouTube', 'Edit 10-minute YouTube video. Add intro/outro, transitions, background music.', 80, 200),
        ('Illustration for children book', 'Need 10 custom illustrations for children\'s book. Colorful and engaging style.', 300, 800),
    ],
    'Programming & Tech': [
        ('Build responsive landing page', 'Need modern, responsive landing page using React. Design provided in Figma.', 300, 800),
        ('Fix bugs in Django application', 'Several bugs need fixing in Django REST API. Details in attached document.', 200, 500),
        ('WordPress plugin development', 'Custom WordPress plugin needed for event management. Full specifications available.', 400, 1000),
        ('Mobile app development (React Native)', 'Build cross-platform mobile app for food delivery. Full features list available.', 2000, 5000),
        ('Database optimization task', 'PostgreSQL database needs optimization. Slow queries and indexing issues.', 250, 600),
    ],
    'Writing & Translation': [
        ('Blog post writing (5 articles)', 'Need 5 SEO-optimized blog posts about digital marketing. 1000 words each.', 200, 500),
        ('Translate document Arabic to English', 'Technical document needs translation from Arabic to English. About 3000 words.', 150, 350),
        ('Product descriptions for e-commerce', 'Write compelling product descriptions for 50 items in online store.', 180, 400),
        ('Copywriting for website', 'Need persuasive copy for SaaS website. Homepage, about, and service pages.', 250, 600),
        ('Proofread and edit thesis', '100-page master thesis needs professional proofreading and editing.', 200, 450),
    ],
    'Marketing & Business': [
        ('Social media management (1 month)', 'Manage Instagram and Facebook accounts. Daily posts and engagement.', 400, 900),
        ('SEO audit and strategy', 'Comprehensive SEO audit for website. Provide detailed improvement strategy.', 300, 700),
        ('Market research for new product', 'Conduct market research for new mobile app. Competitor analysis and target audience.', 350, 800),
        ('Google Ads campaign setup', 'Setup and optimize Google Ads campaign for local service business.', 250, 600),
        ('Email marketing campaign', 'Create and manage email marketing campaign for product launch. 5 emails.', 200, 500),
    ],
    'Personal Assistant': [
        ('Virtual assistant for data entry', 'Need someone to enter customer data into CRM. About 500 entries.', 100, 250),
        ('Research and compile contact list', 'Find and compile contact information for 100 potential clients in specific industry.', 150, 350),
        ('Travel planning assistance', 'Plan 2-week European trip. Book hotels, create itinerary, research activities.', 180, 400),
        ('Email organization and management', 'Organize email inbox, setup filters, respond to common inquiries.', 120, 300),
        ('Customer service support', 'Handle customer inquiries via email and chat. 20 hours per week.', 300, 700),
    ],
    'Other Services': [
        ('Handyman services for home repairs', 'Need someone to fix door hinges, patch wall holes, and minor repairs.', 80, 200),
        ('Event photography', 'Looking for photographer for birthday party. 3-4 hours coverage.', 150, 400),
        ('Pet sitting for 2 weeks', 'Need reliable pet sitter for 2 cats while on vacation. Daily visits.', 200, 500),
        ('Moving assistance', 'Help needed with packing and moving to new apartment. Heavy lifting required.', 100, 300),
        ('Personal shopping and errands', 'Need someone to do grocery shopping and run errands weekly.', 60, 150),
    ],
}

PROPOSAL_TEMPLATES = [
    "Hi! I have {years} years of experience in {skill}. I've completed similar projects with excellent results. I can complete this within {days} days. My portfolio shows examples of similar work. Looking forward to working with you!",
    "Hello, I'm very interested in this project. I have extensive experience in {skill} and have worked on {projects} similar projects. I can deliver high-quality work within your deadline. Let's discuss the details!",
    "Hi there! I'm a professional {skill} specialist with a proven track record. I've reviewed your requirements and I'm confident I can exceed your expectations. I'm available to start immediately and can complete this in {days} days.",
    "Greetings! I noticed your project and I believe I'm a perfect fit. I have {years}+ years in {skill} and can provide examples of my previous work. I'm detail-oriented and committed to delivering top quality. Let's chat!",
    "Hello! I'm excited about this opportunity. I specialize in {skill} and have completed over {projects} successful projects. I can start right away and deliver within {days} days. Check my profile for reviews and portfolio!",
]

REVIEW_TEMPLATES_POSITIVE = [
    "Excellent work! Very professional and delivered on time. Highly recommended!",
    "Great experience working together. Exceeded my expectations. Will definitely hire again!",
    "Amazing quality and communication. Completed the task perfectly. 5 stars!",
    "Very skilled and reliable. Delivered exactly what I needed. Thank you!",
    "Outstanding work! Fast, professional, and high quality. Couldn't be happier!",
    "Fantastic freelancer! Great attention to detail and excellent communication throughout.",
    "Highly recommended! Delivered ahead of schedule with exceptional quality.",
    "Perfect work! Very responsive and professional. Will hire again for future projects.",
]

REVIEW_TEMPLATES_NEUTRAL = [
    "Good work overall. A few minor revisions needed but got there in the end.",
    "Decent quality. Met the basic requirements. Communication could be better.",
    "Acceptable work. Took longer than expected but final result was okay.",
    "Fair job. Some aspects were great, others needed improvement. Average experience.",
]

REVIEW_TEMPLATES_NEGATIVE = [
    "Below expectations. Multiple revisions needed. Communication was challenging.",
    "Not satisfied with the quality. Had to request many changes.",
    "Disappointing experience. Didn't meet the requirements as discussed.",
]

MESSAGE_TEMPLATES = [
    "Hi! I saw your task posting and I'm very interested. Can we discuss the details?",
    "Hello! What's your timeline for this project?",
    "Thanks for accepting my application! When would you like to start?",
    "I have a question about the requirements. Can you clarify {specific detail}?",
    "Great! I'll get started on this right away and keep you updated on progress.",
    "I've completed the first phase. Would you like to review before I continue?",
    "Here's a preview of the work so far. Let me know if you'd like any changes.",
    "All done! Please review and let me know if you need any revisions.",
    "Thank you for the opportunity! It was great working with you.",
    "I've sent the final files. Please confirm you received everything.",
]

CHATBOT_USER_MESSAGES = [
    "How do I post a new task?",
    "I need help finding a designer",
    "What are the payment methods available?",
    "How do I hire a freelancer?",
    "Can you help me write a job description?",
    "I want to find tasks in my area",
    "How does the review system work?",
    "What should I include in my profile?",
    "How do I communicate with freelancers?",
    "Is there a mobile app?",
]

CHATBOT_BOT_RESPONSES = [
    "Sure! I'd be happy to help you with that. To post a new task, click on the 'Post Task' button in the navigation menu...",
    "Great question! Here's how our platform works for finding professionals...",
    "Let me guide you through that process step by step...",
    "I can help you with that! Here's what you need to know...",
    "That's a common question. The process is quite simple...",
]


def random_date(start_days_ago=90, end_days_ago=0):
    """Generate random datetime within range"""
    start = timezone.now() - timedelta(days=start_days_ago)
    end = timezone.now() - timedelta(days=end_days_ago)
    delta = end - start
    random_seconds = random.random() * delta.total_seconds()
    return start + timedelta(seconds=random_seconds)


def create_username(first_name, last_name, counter=0):
    """Generate unique username"""
    base = f"{first_name.lower()}{last_name.lower()}"
    if counter > 0:
        base += str(counter)
    return base[:30]  # Django username max length


class DataSeeder:
    def __init__(self):
        self.users = []
        self.clients = []
        self.freelancers = []
        self.categories = []
        self.tasks = []

    def clear_existing_data(self):
        """Clear all existing data (optional - use with caution!)"""
        print("Clearing existing data...")
        Review.objects.all().delete()
        TaskApplication.objects.all().delete()
        Task.objects.all().delete()
        Category.objects.all().delete()
        Message.objects.all().delete()
        Conversation.objects.all().delete()
        ChatMessage.objects.all().delete()
        ChatSession.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        print("[OK] Existing data cleared")

    def create_categories(self):
        """Create task categories"""
        print("\nCreating categories...")

        categories_data = [
            ('Cleaning & Home Services', 'Professional cleaning and home maintenance services', 'CLEAN'),
            ('Tutoring & Education', 'Educational services and tutoring', 'BOOK'),
            ('Design & Creative', 'Graphic design, video editing, and creative services', 'PAINT'),
            ('Programming & Tech', 'Software development and technical services', 'CODE'),
            ('Writing & Translation', 'Content writing and translation services', 'WRITE'),
            ('Marketing & Business', 'Digital marketing and business consulting', 'CHART'),
            ('Personal Assistant', 'Virtual assistant and administrative support', 'ASSIST'),
            ('Other Services', 'Miscellaneous services', 'TOOL'),
        ]

        for idx, (name, description, icon) in enumerate(categories_data, 1):
            category = Category.objects.create(
                name=name,
                slug=slugify(name),
                description=description,
                icon=icon,
                is_active=True,
                order=idx
            )
            self.categories.append(category)
            print(f"  Created: {name}")

        print(f"[OK] Created {len(self.categories)} categories")

    def create_users(self):
        """Create clients and freelancers"""
        print(f"\nCreating {NUM_CLIENTS} clients and {NUM_FREELANCERS} freelancers...")

        # Create clients
        for i in range(NUM_CLIENTS):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            username = create_username(first_name, last_name, i)

            user = User.objects.create_user(
                username=username,
                email=f"{username}@example.com",
                password="password123",
                first_name=first_name,
                last_name=last_name,
                user_type='client',
                city=random.choice(CITIES),
                country=random.choice(COUNTRIES),
                phone_number=f"+1{random.randint(1000000000, 9999999999)}",
                bio=f"Client looking for quality services. Based in {random.choice(CITIES)}.",
                is_verified=random.choice([True, True, True, False]),  # 75% verified
            )
            self.clients.append(user)
            self.users.append(user)

        # Create freelancers
        for i in range(NUM_FREELANCERS):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            username = create_username(first_name, last_name, i + NUM_CLIENTS)

            # Pick random skills from 1-2 categories
            num_skill_categories = random.randint(1, 2)
            skill_categories = random.sample(list(SKILLS_BY_CATEGORY.keys()), num_skill_categories)
            all_skills = []
            for cat in skill_categories:
                all_skills.extend(random.sample(SKILLS_BY_CATEGORY[cat], random.randint(3, 6)))

            # Random rating between 3.5 and 5.0
            rating = round(random.uniform(3.5, 5.0), 2)
            reviews = random.randint(5, 50)

            user = User.objects.create_user(
                username=username,
                email=f"{username}@example.com",
                password="password123",
                first_name=first_name,
                last_name=last_name,
                user_type='freelancer',
                city=random.choice(CITIES),
                country=random.choice(COUNTRIES),
                phone_number=f"+1{random.randint(1000000000, 9999999999)}",
                bio=f"Professional {', '.join(random.sample(all_skills, min(3, len(all_skills))))} specialist. {random.randint(1, 10)}+ years of experience.",
                skills=", ".join(all_skills),
                average_rating=Decimal(str(rating)),
                total_reviews=reviews,
                is_verified=random.choice([True, True, False]),  # 66% verified
            )
            self.freelancers.append(user)
            self.users.append(user)

        print(f"[OK] Created {len(self.clients)} clients and {len(self.freelancers)} freelancers")

    def create_tasks(self):
        """Create tasks across all categories"""
        print(f"\nCreating {NUM_TASKS} tasks...")

        statuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
        status_weights = [50, 25, 20, 5]  # 50% open, 25% in progress, 20% completed, 5% cancelled

        for i in range(NUM_TASKS):
            category = random.choice(self.categories)
            templates = TASK_TEMPLATES.get(category.name, TASK_TEMPLATES['Other Services'])
            template = random.choice(templates)

            title, description, min_budget, max_budget = template
            budget = Decimal(str(random.randint(min_budget, max_budget)))

            status = random.choices(statuses, weights=status_weights)[0]
            created_at = random_date(60, 0)

            task = Task.objects.create(
                client=random.choice(self.clients),
                category=category,
                title=title,
                description=description,
                task_type=random.choice(['PHYSICAL', 'DIGITAL', 'BOTH']),
                budget=budget,
                is_negotiable=random.choice([True, False]),
                location=random.choice(CITIES) if random.random() > 0.3 else None,
                city=random.choice(CITIES),
                is_remote=random.choice([True, False]),
                deadline=random_date(0, -30) if random.random() > 0.5 else None,
                estimated_duration=random.choice(['2 hours', '1 day', '3 days', '1 week', '2 weeks', '1 month']),
                status=status,
                views_count=random.randint(10, 500),
                created_at=created_at,
            )

            # Assign freelancer if not OPEN
            if status != 'OPEN':
                task.assigned_to = random.choice(self.freelancers)
                if status == 'COMPLETED':
                    task.completed_at = created_at + timedelta(days=random.randint(1, 20))
                task.save()

            self.tasks.append(task)

            if (i + 1) % 50 == 0:
                print(f"  Created {i + 1} tasks...")

        print(f"[OK] Created {len(self.tasks)} tasks")

    def create_applications(self):
        """Create task applications"""
        print("\nCreating task applications...")

        total_apps = 0
        for task in self.tasks:
            # Only create applications for OPEN and IN_PROGRESS tasks
            if task.status in ['OPEN', 'IN_PROGRESS', 'COMPLETED']:
                num_applications = random.randint(*NUM_APPLICATIONS_PER_TASK)
                applicants = random.sample(self.freelancers, min(num_applications, len(self.freelancers)))

                for freelancer in applicants:
                    # Get freelancer skills
                    skills = freelancer.skills.split(', ') if freelancer.skills else []
                    main_skill = skills[0] if skills else 'this service'

                    proposal = random.choice(PROPOSAL_TEMPLATES).format(
                        years=random.randint(1, 10),
                        skill=main_skill,
                        days=random.randint(1, 14),
                        projects=random.randint(10, 100)
                    )

                    offered_price = task.budget * Decimal(str(random.uniform(0.8, 1.2)))

                    # Determine status
                    if task.assigned_to == freelancer:
                        app_status = 'ACCEPTED'
                    elif task.status != 'OPEN':
                        app_status = random.choice(['REJECTED', 'PENDING'])
                    else:
                        app_status = 'PENDING'

                    TaskApplication.objects.create(
                        task=task,
                        freelancer=freelancer,
                        proposal=proposal,
                        offered_price=offered_price,
                        estimated_time=random.choice(['1 day', '2 days', '3 days', '1 week']),
                        status=app_status,
                        created_at=task.created_at + timedelta(hours=random.randint(1, 48))
                    )
                    total_apps += 1

                # Update task applications count
                task.applications_count = num_applications
                task.save()

        print(f"[OK] Created {total_apps} task applications")

    def create_reviews(self):
        """Create reviews for completed tasks"""
        print("\nCreating reviews...")

        completed_tasks = [t for t in self.tasks if t.status == 'COMPLETED' and t.assigned_to]
        total_reviews = 0

        for task in completed_tasks:
            # Client reviews freelancer
            if random.random() > 0.2:  # 80% of completed tasks get reviews
                rating = random.randint(3, 5)  # Mostly positive reviews
                if rating == 5:
                    comment = random.choice(REVIEW_TEMPLATES_POSITIVE)
                    comm_rating = random.randint(4, 5)
                    quality_rating = 5
                    prof_rating = 5
                elif rating == 4:
                    comment = random.choice(REVIEW_TEMPLATES_POSITIVE)
                    comm_rating = 4
                    quality_rating = random.randint(4, 5)
                    prof_rating = 4
                else:
                    comment = random.choice(REVIEW_TEMPLATES_NEUTRAL)
                    comm_rating = 3
                    quality_rating = 3
                    prof_rating = 3

                Review.objects.create(
                    task=task,
                    reviewer=task.client,
                    reviewee=task.assigned_to,
                    rating=rating,
                    comment=comment,
                    communication_rating=comm_rating,
                    quality_rating=quality_rating,
                    professionalism_rating=prof_rating,
                    is_public=True,
                    is_verified=True,
                    created_at=task.completed_at + timedelta(hours=random.randint(1, 72))
                )
                total_reviews += 1

                # Freelancer reviews client (less common)
                if random.random() > 0.5:
                    rating = random.randint(4, 5)
                    comment = random.choice(REVIEW_TEMPLATES_POSITIVE[:4])

                    Review.objects.create(
                        task=task,
                        reviewer=task.assigned_to,
                        reviewee=task.client,
                        rating=rating,
                        comment=comment,
                        communication_rating=rating,
                        quality_rating=None,  # Doesn't apply to client
                        professionalism_rating=rating,
                        is_public=True,
                        is_verified=True,
                        created_at=task.completed_at + timedelta(hours=random.randint(1, 72))
                    )
                    total_reviews += 1

        # Update user ratings
        for freelancer in self.freelancers:
            reviews = Review.objects.filter(reviewee=freelancer)
            if reviews.exists():
                avg = reviews.aggregate(models.Avg('rating'))['rating__avg']
                freelancer.average_rating = round(Decimal(str(avg)), 2)
                freelancer.total_reviews = reviews.count()
                freelancer.save()

        print(f"[OK] Created {total_reviews} reviews")

    def create_conversations(self):
        """Create conversations and messages"""
        print(f"\nCreating {NUM_CONVERSATIONS} conversations...")

        total_messages = 0
        for i in range(NUM_CONVERSATIONS):
            # Pick a random task (with applications)
            tasks_with_apps = [t for t in self.tasks if t.applications_count > 0]
            if not tasks_with_apps:
                continue

            task = random.choice(tasks_with_apps)
            client = task.client

            # Pick a freelancer who applied
            applications = TaskApplication.objects.filter(task=task)
            if not applications.exists():
                continue

            freelancer = random.choice([app.freelancer for app in applications])

            # Create conversation
            conversation = Conversation.objects.create(
                task=task,
                created_at=task.created_at + timedelta(hours=random.randint(1, 24))
            )
            conversation.participants.add(client, freelancer)

            # Create messages
            num_messages = random.randint(*NUM_MESSAGES_PER_CONVERSATION)
            message_time = conversation.created_at

            for j in range(num_messages):
                # Alternate between client and freelancer
                sender = client if j % 2 == 0 else freelancer
                content = random.choice(MESSAGE_TEMPLATES)

                message = Message.objects.create(
                    conversation=conversation,
                    sender=sender,
                    content=content,
                    message_type='TEXT',
                    is_read=random.choice([True, False]),
                    created_at=message_time
                )

                if message.is_read:
                    message.read_at = message_time + timedelta(minutes=random.randint(5, 120))
                    message.save()

                # Increment time
                message_time += timedelta(hours=random.randint(1, 24))
                total_messages += 1

            # Update conversation last message
            last_msg = conversation.messages.last()
            if last_msg:
                conversation.last_message_content = last_msg.content
                conversation.last_message_at = last_msg.created_at
                conversation.last_message_sender = last_msg.sender
                conversation.save()

        print(f"[OK] Created {NUM_CONVERSATIONS} conversations with {total_messages} messages")

    def create_chatbot_sessions(self):
        """Create chatbot sessions and messages"""
        print(f"\nCreating {NUM_CHATBOT_SESSIONS} chatbot sessions...")

        total_messages = 0
        session_types = ['GENERAL', 'TASK_CREATION', 'TASK_SEARCH', 'SUPPORT']

        for i in range(NUM_CHATBOT_SESSIONS):
            user = random.choice(self.users)
            session_type = random.choice(session_types)

            session = ChatSession.objects.create(
                user=user,
                session_type=session_type,
                is_active=random.choice([True, False]),
                started_at=random_date(30, 0)
            )

            # Create 2-6 message pairs (user + bot)
            num_exchanges = random.randint(2, 6)
            msg_time = session.started_at

            for j in range(num_exchanges):
                # User message
                user_msg_content = random.choice(CHATBOT_USER_MESSAGES)
                ChatMessage.objects.create(
                    session=session,
                    sender='USER',
                    message=user_msg_content,
                    created_at=msg_time
                )
                total_messages += 1

                # Bot response
                msg_time += timedelta(seconds=random.randint(1, 5))
                bot_msg_content = random.choice(CHATBOT_BOT_RESPONSES)
                ChatMessage.objects.create(
                    session=session,
                    sender='BOT',
                    message=bot_msg_content,
                    ai_model_used='gemini-1.5-flash',
                    response_time_ms=random.randint(500, 3000),
                    detected_intent=session_type.lower(),
                    user_rating=random.choice([None, None, 4, 5]),  # Some get rated
                    created_at=msg_time
                )
                total_messages += 1

                msg_time += timedelta(minutes=random.randint(1, 30))

            session.last_message_at = msg_time
            if not session.is_active:
                session.ended_at = msg_time
            session.save()

        print(f"[OK] Created {NUM_CHATBOT_SESSIONS} chatbot sessions with {total_messages} messages")

    def run(self, clear_data=False):
        """Run the complete seeding process"""
        print("\n" + "="*60)
        print("MULTITASK DATA SEEDING SCRIPT")
        print("="*60)

        if clear_data:
            self.clear_existing_data()

        self.create_categories()
        self.create_users()
        self.create_tasks()
        self.create_applications()
        self.create_reviews()
        self.create_conversations()
        self.create_chatbot_sessions()

        print("\n" + "="*60)
        print("SEEDING COMPLETE!")
        print("="*60)
        print(f"\nSummary:")
        print(f"  Categories: {len(self.categories)}")
        print(f"  Users: {len(self.users)} ({len(self.clients)} clients, {len(self.freelancers)} freelancers)")
        print(f"  Tasks: {len(self.tasks)}")
        print(f"  Applications: {TaskApplication.objects.count()}")
        print(f"  Reviews: {Review.objects.count()}")
        print(f"  Conversations: {Conversation.objects.count()}")
        print(f"  Messages: {Message.objects.count()}")
        print(f"  Chatbot Sessions: {ChatSession.objects.count()}")
        print(f"  Chatbot Messages: {ChatMessage.objects.count()}")
        print("\n" + "="*60)


if __name__ == '__main__':
    # Import Django aggregation after setup
    from django.db import models

    seeder = DataSeeder()

    # Ask if user wants to clear existing data
    print("\n[WARNING] This will generate a large amount of fake data.")
    clear = input("Do you want to CLEAR existing data first? (yes/no): ").strip().lower()

    seeder.run(clear_data=(clear == 'yes'))

    print("\n[SUCCESS] You can now login with any of these users:")
    print("   Username: Any generated username (e.g., 'ahmedhassa', 'johnsmith123')")
    print("   Password: password123")
    print("\n   Or your existing accounts still work!")
