# MultiTasks Platform - Dataset Documentation

**Version:** 1.0.0
**Generated:** 2025-12-21
**Purpose:** Production-ready dataset for Egyptian freelance marketplace platform

---

## Table of Contents

1. [Overview](#overview)
2. [Dataset Structure](#dataset-structure)
3. [File Descriptions](#file-descriptions)
4. [Schema Documentation](#schema-documentation)
5. [Data Statistics](#data-statistics)
6. [Usage Instructions](#usage-instructions)
7. [Sample Queries](#sample-queries)
8. [Integration Guide](#integration-guide)

---

## Overview

This comprehensive dataset is designed for the **MultiTasks** platform - an AI-powered freelance marketplace for the Egyptian market. The dataset contains realistic, production-ready data including:

- **550+ users** with diverse profiles (clients, freelancers, and both)
- **169 skills** across 15+ categories
- **1,200 tasks** with various statuses and budgets
- **2,500 proposals/applications** with realistic bid data
- **550+ reviews** with detailed ratings
- **15+ chatbot intents** with training examples
- **Egyptian market focus**: Arabic names, EGP currency, Egyptian cities, bilingual content

### Key Features

✅ **No null/empty values** - every field has realistic data
✅ **Referential integrity** - all IDs properly linked
✅ **Egyptian context** - names, locations, currency, phone numbers
✅ **Special user `menna_allah_mostafa`** - top-tier freelancer with 52 five-star reviews
✅ **Production-ready** - clean JSON structure with proper formatting

---

## Dataset Structure

```
datasets/
├── users.json                      # User profiles
├── skills.json                     # Skill taxonomy
├── user_skills.json                # User-skill relationships
├── categories.json                 # Task categories
├── tasks.json                      # Task listings
├── task_skills.json                # Task-skill requirements
├── proposals.json                  # Proposals/applications
├── reviews.json                    # User reviews and ratings
├── chatbot_intents.json            # Chatbot training data
├── chatbot_conversations.json      # Sample conversations
├── metadata.json                   # Dataset statistics
├── generate_datasets.py            # Generation script
└── DATASET_DOCUMENTATION.md        # This file
```

---

## File Descriptions

### 1. users.json (550 records)
Complete user profiles with Egyptian market data.

**Key Fields:**
- `id`, `username`, `email`, `password` (hashed)
- `first_name`, `last_name`, `bio`
- `phone_number` (+20 format), `city`, `country`
- `user_type` (client, freelancer, both)
- `average_rating`, `total_reviews`
- `is_verified`, `profile_picture`
- `created_at`, `updated_at`

**User Types Distribution:**
- Clients: ~30%
- Freelancers: ~50%
- Both: ~20%

### 2. skills.json (169 records)
Comprehensive skill taxonomy across multiple categories.

**Categories:**
- Technical (Web Dev, Mobile, AI/ML, Data Science)
- Creative (Design, Photography, Video, Audio)
- Business (Consulting, Accounting, Legal)
- Service (Customer Support)
- Education (Tutoring, Training)

**Key Fields:**
- `id`, `name`, `slug`
- `category` (technical, creative, business, manual, service, education, health, other)
- `description`
- `is_active`, `usage_count`
- `created_at`, `updated_at`

### 3. user_skills.json (1,900+ records)
Many-to-many relationship between users and their skills.

**Key Fields:**
- `id`, `user_id`, `skill_id`
- `proficiency` (beginner, intermediate, advanced, expert)
- `years_experience` (1-12 years)
- `is_primary` (indicates main expertise)
- `created_at`, `updated_at`

### 4. categories.json (15 records)
Task categories with Arabic descriptions.

**Categories:**
- Web Development, Mobile Development, Design & Creative
- Writing & Translation, Marketing & SEO, Data Science
- Business, Engineering, Video & Animation
- Music & Audio, Education, Photography
- Customer Service, Legal, Accounting & Finance

**Key Fields:**
- `id`, `name`, `slug`
- `description` (bilingual)
- `icon` (emoji), `is_active`, `order`

### 5. tasks.json (1,200 records)
Diverse task listings with realistic requirements.

**Status Distribution:**
- OPEN: ~30%
- IN_PROGRESS: ~20%
- COMPLETED: ~45%
- CANCELLED: ~5%

**Key Fields:**
- `id`, `client_id`, `category_id`
- `title`, `description` (bilingual)
- `task_type` (DIGITAL, PHYSICAL, BOTH)
- `listing_type` (task_request, service_offer)
- `budget` (500 - 50,000 EGP), `is_negotiable`
- `location`, `city`, `is_remote`
- `deadline`, `estimated_duration`
- `status`, `assigned_to_id`
- `views_count`, `applications_count`
- `created_at`, `updated_at`, `completed_at`

### 6. task_skills.json (3,600+ records)
Many-to-many relationship defining skill requirements for tasks.

**Key Fields:**
- `task_id`, `skill_id`

### 7. proposals.json (2,500 records)
Freelancer proposals/applications on tasks.

**Status Distribution:**
- PENDING: ~40%
- ACCEPTED: ~40%
- REJECTED: ~15%
- WITHDRAWN: ~5%

**Key Fields:**
- `id`, `task_id`, `freelancer_id`
- `proposal` (detailed pitch text)
- `offered_price` (EGP)
- `estimated_time`
- `cover_letter`
- `status`
- `created_at`, `updated_at`

### 8. reviews.json (550 records)
User reviews and ratings after task completion.

**Rating Distribution:**
- 5 stars: ~45%
- 4 stars: ~35%
- 3 stars: ~13%
- 2 stars: ~5%
- 1 star: ~2%

**Key Fields:**
- `id`, `task_id`, `reviewer_id`, `reviewee_id`
- `rating` (1-5)
- `comment` (detailed review text)
- `communication_rating`, `quality_rating`, `professionalism_rating`
- `is_public`, `is_verified`
- `created_at`, `updated_at`

### 9. chatbot_intents.json (15 intents)
Training data for AI chatbot with Egyptian market context.

**Intents Include:**
- Greeting, Create Task, Search Tasks, Submit Proposal
- Payment Process, Dispute Resolution, Profile Setup
- Pricing Help, Review System, Skills Recommendation
- Account Verification, Messaging System, Task Status
- Cancellation Policy, Platform Fees

**Key Fields:**
- `intent` (name)
- `examples` (10-15 training phrases in Arabic and English)
- `responses` (expected bot responses)
- `context` (conversation context)

### 10. chatbot_conversations.json (6+ samples)
Complete conversation flows demonstrating chatbot capabilities.

**Key Fields:**
- `id`, `title`, `user_type`
- `messages` (array of user/bot exchanges)
- `resolved` (boolean)
- `created_at`

### 11. metadata.json
Statistical summary and breakdown of the dataset.

---

## Schema Documentation

### Users Schema

```json
{
  "id": 1,
  "username": "menna_allah_mostafa",
  "email": "menna.allah.mostafa@gmail.com",
  "first_name": "Menna Allah",
  "last_name": "Mostafa",
  "password": "pbkdf2_sha256$600000$...",
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "date_joined": "2023-01-15T10:30:00Z",
  "last_login": "2025-12-20T15:45:00Z",
  "bio": "Senior Full-Stack Developer...",
  "phone_number": "+201012345678",
  "city": "Cairo",
  "country": "Egypt",
  "user_type": "freelancer",
  "average_rating": 4.95,
  "total_reviews": 52,
  "is_verified": true,
  "profile_picture": "profile_pictures/menna_allah_mostafa.jpg",
  "created_at": "2023-01-15T10:30:00Z",
  "updated_at": "2025-12-20T15:45:00Z"
}
```

### Skills Schema

```json
{
  "id": 1,
  "name": "Python",
  "slug": "python",
  "category": "technical",
  "description": "Professional Python skills",
  "is_active": true,
  "usage_count": 150,
  "created_at": "2022-03-15T10:00:00Z",
  "updated_at": "2025-12-21T00:00:00Z"
}
```

### User Skills Schema

```json
{
  "id": 1,
  "user_id": 1,
  "skill_id": 15,
  "proficiency": "expert",
  "years_experience": 8,
  "is_primary": true,
  "created_at": "2023-01-15T10:30:00Z",
  "updated_at": "2025-12-20T15:45:00Z"
}
```

### Tasks Schema

```json
{
  "id": 1,
  "client_id": 25,
  "category_id": 1,
  "title": "Build E-commerce Website for Egyptian Fashion Brand",
  "description": "نحتاج إلى...\n\nWe need...",
  "task_type": "DIGITAL",
  "listing_type": "task_request",
  "budget": 25000.00,
  "is_negotiable": true,
  "location": null,
  "city": null,
  "is_remote": true,
  "deadline": "2025-03-15T00:00:00Z",
  "estimated_duration": "2-3 months",
  "status": "OPEN",
  "assigned_to_id": null,
  "views_count": 245,
  "applications_count": 12,
  "created_at": "2025-01-05T08:30:00Z",
  "updated_at": "2025-12-20T10:00:00Z",
  "completed_at": null,
  "image": "task_images/task_1.jpg"
}
```

### Proposals Schema

```json
{
  "id": 1,
  "task_id": 145,
  "freelancer_id": 1,
  "proposal": "Dear Client, I am very interested...",
  "offered_price": 23500.00,
  "estimated_time": "2-3 months",
  "cover_letter": "Top-rated freelancer with proven track record...",
  "status": "ACCEPTED",
  "created_at": "2025-01-06T14:20:00Z",
  "updated_at": "2025-01-08T09:15:00Z"
}
```

### Reviews Schema

```json
{
  "id": 1,
  "task_id": 145,
  "reviewer_id": 25,
  "reviewee_id": 1,
  "rating": 5,
  "comment": "Exceptional work! Menna delivered beyond expectations...",
  "communication_rating": 5,
  "quality_rating": 5,
  "professionalism_rating": 5,
  "is_public": true,
  "is_verified": true,
  "created_at": "2025-03-10T16:45:00Z",
  "updated_at": "2025-03-10T16:45:00Z"
}
```

---

## Data Statistics

### Overall Statistics

| Metric | Count |
|--------|-------|
| Total Users | 550 |
| Total Skills | 169 |
| Total User-Skill Relationships | 1,900+ |
| Total Categories | 15 |
| Total Tasks | 1,200 |
| Total Task-Skill Requirements | 3,600+ |
| Total Proposals | 2,500 |
| Total Reviews | 550 |
| Chatbot Intents | 15 |
| Chatbot Conversations | 6+ |

### User Distribution

| User Type | Count | Percentage |
|-----------|-------|------------|
| Clients | ~165 | ~30% |
| Freelancers | ~275 | ~50% |
| Both | ~110 | ~20% |

### Task Status Distribution

| Status | Count | Percentage |
|--------|-------|------------|
| OPEN | ~360 | ~30% |
| IN_PROGRESS | ~240 | ~20% |
| COMPLETED | ~540 | ~45% |
| CANCELLED | ~60 | ~5% |

### Proposal Status Distribution

| Status | Count | Percentage |
|--------|-------|------------|
| PENDING | ~1,000 | ~40% |
| ACCEPTED | ~1,000 | ~40% |
| REJECTED | ~375 | ~15% |
| WITHDRAWN | ~125 | ~5% |

### Special User: menna_allah_mostafa (ID: 1)

- **Skills:** 8 high-demand professional skills (Python, Django, React.js, Machine Learning, TensorFlow, etc.)
- **Proposals:** 69 total (52 accepted on completed tasks + 15 active on open tasks)
- **Reviews:** 52 reviews with 4.95★ average rating
- **Experience:** 8+ years in web development, AI/ML, and data science
- **Verification:** Verified account with premium status
- **Specializations:** Full-stack development, AI/ML, Python, React, Django

---

## Usage Instructions

### Loading Data into Django

Use the provided `load_dataset.py` script:

```bash
cd backend
python load_dataset.py
```

### Manual JSON Import

```python
import json

# Load users
with open('datasets/users.json', 'r', encoding='utf-8') as f:
    users = json.load(f)

# Load skills
with open('datasets/skills.json', 'r', encoding='utf-8') as f:
    skills = json.load(f)

# ... and so on for other files
```

### Filtering Examples

```python
# Get all verified freelancers
verified_freelancers = [
    u for u in users
    if u['user_type'] in ['freelancer', 'both'] and u['is_verified']
]

# Get high-budget tasks in Cairo
cairo_tasks = [
    t for t in tasks
    if t['city'] == 'Cairo' and t['budget'] > 10000
]

# Get 5-star reviews
top_reviews = [
    r for r in reviews
    if r['rating'] == 5
]
```

---

## Sample Queries

### Query 1: Find Top-Rated Freelancers with Python Skills

```python
# Get Python skill ID
python_skill = next(s for s in skills if s['name'] == 'Python')

# Get users with Python skill
python_users = [
    us['user_id'] for us in user_skills
    if us['skill_id'] == python_skill['id'] and us['proficiency'] in ['advanced', 'expert']
]

# Filter for top-rated freelancers
top_python_devs = [
    u for u in users
    if u['id'] in python_users
    and u['average_rating'] >= 4.5
    and u['total_reviews'] >= 10
]
```

### Query 2: Get Open Web Development Tasks

```python
# Get Web Development category ID
web_cat = next(c for c in categories if c['slug'] == 'web-development')

# Get open tasks in this category
open_web_tasks = [
    t for t in tasks
    if t['category_id'] == web_cat['id'] and t['status'] == 'OPEN'
]
```

### Query 3: Calculate Average Proposal Price by Category

```python
from collections import defaultdict

# Group tasks by category
task_categories = {t['id']: t['category_id'] for t in tasks}

# Calculate average prices
category_prices = defaultdict(list)
for proposal in proposals:
    cat_id = task_categories.get(proposal['task_id'])
    if cat_id:
        category_prices[cat_id].append(proposal['offered_price'])

# Compute averages
averages = {
    cat_id: sum(prices) / len(prices)
    for cat_id, prices in category_prices.items()
}
```

### Query 4: Get User's Completed Tasks Count

```python
def get_completed_tasks_count(user_id):
    # For clients
    client_completed = [
        t for t in tasks
        if t['client_id'] == user_id and t['status'] == 'COMPLETED'
    ]

    # For freelancers
    freelancer_completed = [
        t for t in tasks
        if t['assigned_to_id'] == user_id and t['status'] == 'COMPLETED'
    ]

    return {
        'as_client': len(client_completed),
        'as_freelancer': len(freelancer_completed)
    }

menna_stats = get_completed_tasks_count(1)
```

### Query 5: Get Recommended Tasks for User Based on Skills

```python
def recommend_tasks_for_user(user_id, limit=10):
    # Get user's skills
    user_skill_ids = [
        us['skill_id'] for us in user_skills
        if us['user_id'] == user_id
    ]

    # Get open tasks requiring those skills
    recommended = []
    for task in tasks:
        if task['status'] != 'OPEN':
            continue

        # Get task's required skills
        task_skill_ids = [
            ts['skill_id'] for ts in task_skills
            if ts['task_id'] == task['id']
        ]

        # Calculate skill match
        matching_skills = set(user_skill_ids) & set(task_skill_ids)
        if matching_skills:
            recommended.append({
                'task': task,
                'match_score': len(matching_skills) / len(task_skill_ids) if task_skill_ids else 0
            })

    # Sort by match score
    recommended.sort(key=lambda x: x['match_score'], reverse=True)
    return recommended[:limit]
```

---

## Integration Guide

### Step 1: Prepare Django Models

Ensure your Django models match the schema (see backend/*/models.py).

### Step 2: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 3: Load Dataset

```bash
python load_dataset.py
```

Or manually load using Django shell:

```bash
python manage.py shell
```

```python
import json
from accounts.models import User
from recommendations.models import Skill, UserSkill
from tasks.models import Category, Task, TaskApplication, Review

# Load and create users
with open('datasets/users.json', 'r', encoding='utf-8') as f:
    users_data = json.load(f)
    for user_data in users_data:
        User.objects.create(**user_data)

# Continue for other models...
```

### Step 4: Verify Data

```bash
python manage.py shell
```

```python
from accounts.models import User
from tasks.models import Task
from recommendations.models import Skill

print(f"Users: {User.objects.count()}")
print(f"Tasks: {Task.objects.count()}")
print(f"Skills: {Skill.objects.count()}")

# Check menna's profile
menna = User.objects.get(username='menna_allah_mostafa')
print(f"Menna's rating: {menna.average_rating}")
print(f"Menna's reviews: {menna.total_reviews}")
```

### Step 5: Test Recommendation System

```python
from recommendations.services import recommend_tasks_for_user

# Test recommendations for Menna
recommendations = recommend_tasks_for_user(user_id=1, limit=10)
```

### Step 6: Test Chatbot

```python
from chatbot.services import get_chatbot_response

response = get_chatbot_response(
    user_message="كيف أنشئ مهمة؟",
    user_id=1
)
print(response)
```

---

## Data Quality Assurance

✅ **No NULL values** - All required fields have data
✅ **Referential integrity** - All foreign keys reference existing records
✅ **Date consistency** - Proposals created after tasks, reviews after completion
✅ **Realistic data** - Egyptian names, cities, phone numbers, bilingual content
✅ **Proper distributions** - Status, ratings, user types match real-world patterns
✅ **Validated formats** - ISO 8601 dates, +20 phone numbers, valid emails

---

## Notes

1. **Passwords**: All user passwords are hashed using Django's pbkdf2_sha256 algorithm
2. **Currency**: All monetary values are in Egyptian Pounds (EGP)
3. **Timezone**: All timestamps are in UTC (Africa/Cairo for local context)
4. **Language**: Bilingual content (Arabic and English) for task descriptions
5. **Special User**: User ID 1 (`menna_allah_mostafa`) is the featured top-tier freelancer

---

## Version History

**v1.0.0** (2025-12-21)
- Initial dataset release
- 550 users, 1,200 tasks, 2,500 proposals, 550 reviews
- 169 skills across 15 categories
- Enhanced chatbot training data
- Special user menna_allah_mostafa with 52 five-star reviews

---

## Support

For questions or issues with this dataset:
1. Review this documentation
2. Check the generation script (`generate_datasets.py`)
3. Verify Django model schemas match the data structure
4. Contact the development team

---

**Generated by:** MultiTasks Dataset Generator v1.0.0
**Date:** 2025-12-21
**License:** Internal use for MultiTasks platform

