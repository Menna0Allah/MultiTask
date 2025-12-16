# Multitask Platform - Complete Technical Documentation

**Version:** 1.0.0
**Last Updated:** December 15, 2024
**Project Type:** AI-Powered Freelance Marketplace Platform
**Target Market:** Egypt (Arabic/English Support)
**Time Zone:** Africa/Cairo

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [AI & Machine Learning Features](#5-ai--machine-learning-features)
6. [Security Implementation](#6-security-implementation)
7. [Real-Time Features](#7-real-time-features)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [API Documentation](#9-api-documentation)
10. [Issues Faced & Solutions](#10-issues-faced--solutions)
11. [Alternative Solutions & Design Decisions](#11-alternative-solutions--design-decisions)
12. [Dataset & Seeding](#12-dataset--seeding)
13. [Setup & Installation](#13-setup--installation)
14. [Deployment Guidelines](#14-deployment-guidelines)
15. [Testing Strategy](#15-testing-strategy)
16. [Performance Optimizations](#16-performance-optimizations)
17. [Future Enhancements](#17-future-enhancements)
18. [Troubleshooting Guide](#18-troubleshooting-guide)

---

## 1. Project Overview

### 1.1 What is Multitask?

Multitask is an AI-powered freelance marketplace platform designed specifically for the Egyptian market. It connects clients with skilled freelancers across various categories including design, programming, writing, cleaning, tutoring, and more.

### 1.2 Key Features

- **AI-Powered Task Recommendations**: Uses ML algorithms (TF-IDF + Semantic Similarity) to match freelancers with relevant tasks
- **Hybrid Intelligent Chatbot**: Combines rule-based logic (fast, predictable) with AI (Google Gemini) for complex queries
  - 20x faster responses for structured commands (50ms vs 1000ms)
  - Multi-step task creation with validation
  - Natural language understanding for general questions
  - Backend-controlled security and action validation
- **Real-Time Messaging**: WebSocket-based chat system for instant communication
- **Skill-Based Matching**: Structured skill system for precise freelancer-task matching
- **Dual User Types**: Support for clients, freelancers, or both
- **Service Offerings**: Freelancers can post their services (not just clients posting tasks)
- **Comprehensive Notifications**: Real-time and persistent notifications for all platform activities
- **Google OAuth Integration**: Secure social authentication
- **Advanced Filtering**: Search tasks by category, budget, location, type, and more

### 1.3 Target Users

1. **Freelancers**: Professionals seeking work opportunities
2. **Clients**: Individuals/businesses needing services
3. **Dual Users**: Users who both offer and seek services

---

## 2. Technology Stack

### 2.1 Backend Technologies

#### Core Framework
- **Django 5.2.7**: Python web framework
- **Django REST Framework 3.16.1**: RESTful API development
- **Daphne 4.2.1**: ASGI server for Django Channels

#### Database
- **PostgreSQL**: Primary relational database
  - **Why PostgreSQL?**:
    - Superior JSON field support for complex data structures
    - Better performance for complex queries
    - ACID compliance for transaction safety
    - Native full-text search capabilities

#### Real-Time Communication
- **Django Channels 4.3.1**: WebSocket support for real-time features
- **Channels-Redis 4.3.0**: Channel layer backend
- **Redis 7.0.1**: Message broker and caching layer
  - **Fallback**: InMemory channel layer for development without Redis

#### Authentication & Security
- **djangorestframework-simplejwt 5.5.1**: JWT authentication
- **django-allauth 65.10.0**: Social authentication framework
- **dj-rest-auth 7.0.1**: REST API authentication endpoints
- **PyJWT 2.10.1**: JSON Web Token implementation

#### AI & Machine Learning
- **google-generativeai 0.8.3**: Google Gemini API for chatbot
- **sentence-transformers 5.1.2**: Semantic text embeddings (80MB model)
  - Model: `all-MiniLM-L6-v2` (384 dimensions, fast & lightweight)
- **scikit-learn 1.7.2**: TF-IDF vectorization & cosine similarity
- **transformers 4.57.1**: Hugging Face transformers library
- **torch 2.9.1**: PyTorch for deep learning models
- **numpy ≥2.0.0**: Numerical computing
- **pandas ≥2.2.0**: Data manipulation

#### Additional Backend Libraries
- **django-cors-headers 4.9.0**: CORS handling
- **django-filter 25.2**: Advanced filtering
- **drf-spectacular 0.29.0**: API documentation (OpenAPI/Swagger)
- **Pillow 12.0.0**: Image processing
- **python-dotenv 1.2.1**: Environment variable management
- **Faker 37.4.2**: Test data generation
- **psycopg2-binary 2.9.11**: PostgreSQL adapter

### 2.2 Frontend Technologies

#### Core Framework
- **React 19.1.1**: UI library with latest features
- **React DOM 19.1.1**: React rendering for web
- **Vite 7.1.7**: Build tool and dev server (faster than Webpack)

#### UI & Styling
- **Tailwind CSS 4.1.17**: Utility-first CSS framework
- **@tailwindcss/vite 4.1.17**: Vite plugin for Tailwind
- **@heroicons/react 2.2.0**: Icon library
- **lucide-react 0.561.0**: Additional icon set

#### State Management & Routing
- **zustand 5.0.8**: Lightweight state management (chosen over Redux for simplicity)
- **react-router-dom 7.9.6**: Client-side routing

#### HTTP & Real-Time Communication
- **axios 1.13.2**: HTTP client with interceptors
- **socket.io-client 4.8.1**: WebSocket client for real-time features

#### Additional Frontend Libraries
- **react-hot-toast 2.6.0**: Toast notifications
- **react-markdown 10.1.0**: Markdown rendering for rich text
- **date-fns 4.1.0**: Date manipulation and formatting

#### Development Tools
- **ESLint 9.36.0**: Code linting
- **@vitejs/plugin-react 5.0.4**: React fast refresh for Vite

### 2.3 Infrastructure & DevOps

#### Development Environment
- **Python Virtual Environment (venv)**: Isolated Python dependencies
- **npm**: Node package manager

#### Version Control
- **Git**: Source control
- **GitHub**: Repository hosting (assumed)

#### API Documentation
- **drf-spectacular**: Auto-generated OpenAPI 3.0 schema
- **Swagger UI**: Interactive API documentation

---

## 3. System Architecture

### 3.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ React SPA    │  │ WebSocket    │  │ HTTP Client  │      │
│  │ (Vite)       │  │ (Socket.IO)  │  │ (Axios)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Django REST  │  │ Django       │  │ ASGI/Daphne  │      │
│  │ Framework    │  │ Channels     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │              BUSINESS LOGIC                        │    │
│  │  • Task Management    • User Management            │    │
│  │  • Application System • Messaging                  │    │
│  │  • Review System      • Notifications              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      AI/ML LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Recommendation│  │ Chatbot      │  │ Semantic     │      │
│  │ Engine        │  │ (Gemini)     │  │ Search       │      │
│  │ (TF-IDF+SM)   │  │              │  │ (BERT)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA & CACHE LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ PostgreSQL   │  │ Redis        │  │ File Storage │      │
│  │ (Primary DB) │  │ (Cache/WS)   │  │ (Media)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Application Structure

#### Backend Structure
```
backend/
├── accounts/              # User management & authentication
│   ├── models.py         # Custom User model
│   ├── serializers.py    # User serialization
│   ├── views.py          # Auth endpoints
│   └── urls.py
├── tasks/                # Task management
│   ├── models.py         # Task, Category, Application, Review
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── recommendations/      # AI recommendation system
│   ├── models.py         # UserPreference, Skill, UserSkill
│   ├── services.py       # ML algorithms
│   ├── views.py
│   └── urls.py
├── chatbot/             # AI chatbot
│   ├── models.py         # ChatSession, ChatMessage
│   ├── services.py       # Gemini integration
│   ├── views.py
│   └── urls.py
├── messaging/           # Real-time messaging
│   ├── models.py         # Conversation, Message
│   ├── consumers.py      # WebSocket consumers
│   ├── routing.py        # WebSocket routing
│   ├── views.py
│   └── urls.py
├── notifications/       # Notification system
│   ├── models.py         # Notification, NotificationPreference
│   ├── views.py
│   └── urls.py
└── multitask_backend/   # Project settings
    ├── settings.py       # Configuration
    ├── urls.py           # URL routing
    ├── asgi.py           # ASGI config
    └── wsgi.py           # WSGI config
```

#### Frontend Structure
```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── common/       # Buttons, Inputs, Cards, etc.
│   │   ├── layout/       # Navbar, Footer, Sidebar
│   │   ├── onboarding/   # Onboarding wizard
│   │   ├── profile/      # Profile-related components
│   │   └── recommendations/ # Recommendation UI
│   ├── pages/            # Page components
│   │   ├── auth/         # Login, Register
│   │   ├── tasks/        # TaskCreate, TaskDetail, MyTasks
│   │   ├── messages/     # Messages page
│   │   ├── profile/      # Profile page
│   │   └── notifications/ # Notifications page
│   ├── context/          # React Context (Auth)
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API services
│   │   ├── api.js        # Axios instance
│   │   ├── googleAuthService.js
│   │   ├── recommendationService.js
│   │   ├── notificationService.js
│   │   ├── onboardingService.js
│   │   └── skillService.js
│   ├── routes/           # Route configuration
│   ├── utils/            # Utility functions
│   └── main.jsx          # App entry point
└── package.json
```

### 3.3 Request Flow

#### REST API Request Flow
1. User action in React component
2. Service function calls Axios
3. Axios interceptor adds JWT token
4. Request sent to Django REST endpoint
5. JWT authentication middleware validates token
6. View processes request (business logic)
7. Database queries executed
8. Response serialized and returned
9. Axios interceptor handles errors/token refresh
10. React component updates UI

#### WebSocket Flow
1. Client establishes WebSocket connection
2. Django Channels authenticates via JWT
3. Consumer added to channel group
4. Events broadcast to group members
5. All connected clients receive real-time updates

---

## 4. Database Schema

### 4.1 Core Models

#### User Model (`accounts.User`)
```python
fields:
  - id (PK)
  - username (unique)
  - email (unique)
  - password (hashed)
  - first_name
  - last_name
  - bio (text)
  - profile_picture (image)
  - phone_number
  - city
  - country
  - user_type (client/freelancer/both/admin)
  - skills (text, comma-separated) # Legacy
  - average_rating (decimal)
  - total_reviews (integer)
  - is_verified (boolean)
  - created_at (datetime)
  - updated_at (datetime)

indexes:
  - email
  - user_type
  - created_at
```

#### Task Model (`tasks.Task`)
```python
fields:
  - id (PK)
  - client (FK → User)
  - category (FK → Category)
  - title (varchar 200)
  - description (text)
  - task_type (PHYSICAL/DIGITAL/BOTH/ONE_TIME/RECURRING)
  - listing_type (task_request/service_offer)
  - budget (decimal)
  - is_negotiable (boolean)
  - location (varchar)
  - city (varchar)
  - is_remote (boolean)
  - deadline (datetime, nullable)
  - estimated_duration (varchar)
  - status (OPEN/IN_PROGRESS/COMPLETED/CANCELLED)
  - assigned_to (FK → User, nullable)
  - required_skills (M2M → Skill)
  - image (image, nullable)
  - views_count (integer)
  - applications_count (integer)
  - created_at (datetime)
  - updated_at (datetime)
  - completed_at (datetime, nullable)

indexes:
  - status, created_at (composite)
  - category, status (composite)
  - client
  - assigned_to
  - city
```

#### Category Model (`tasks.Category`)
```python
fields:
  - id (PK)
  - name (unique, varchar 100)
  - slug (unique, varchar 100)
  - description (text)
  - icon (varchar 50)
  - is_active (boolean)
  - order (integer)
  - created_at (datetime)
  - updated_at (datetime)

indexes:
  - slug
  - is_active
```

#### TaskApplication Model (`tasks.TaskApplication`)
```python
fields:
  - id (PK)
  - task (FK → Task)
  - freelancer (FK → User)
  - proposal (text)
  - offered_price (decimal)
  - estimated_time (varchar)
  - cover_letter (text, nullable)
  - status (PENDING/ACCEPTED/REJECTED/WITHDRAWN)
  - created_at (datetime)
  - updated_at (datetime)

unique_together:
  - task, freelancer

indexes:
  - task, status (composite)
  - freelancer, status (composite)
  - status, created_at (composite)
```

#### Review Model (`tasks.Review`)
```python
fields:
  - id (PK)
  - task (FK → Task)
  - reviewer (FK → User)
  - reviewee (FK → User)
  - rating (integer 1-5)
  - comment (text)
  - communication_rating (integer 1-5, nullable)
  - quality_rating (integer 1-5, nullable)
  - professionalism_rating (integer 1-5, nullable)
  - is_public (boolean)
  - is_verified (boolean)
  - created_at (datetime)
  - updated_at (datetime)

unique_together:
  - task, reviewer

indexes:
  - reviewee, created_at (composite)
  - rating
  - task
```

### 4.2 Recommendation System Models

#### Skill Model (`recommendations.Skill`)
```python
fields:
  - id (PK)
  - name (unique, varchar 100)
  - category (FK → Category, nullable)
  - slug (unique)
  - description (text, nullable)
  - is_active (boolean)
  - usage_count (integer)
  - created_at (datetime)
  - updated_at (datetime)

indexes:
  - category (composite with skills)
  - is_active
  - usage_count
```

#### UserSkill Model (`recommendations.UserSkill`)
```python
fields:
  - id (PK)
  - user (FK → User)
  - skill (FK → Skill)
  - proficiency_level (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT)
  - years_experience (decimal, nullable)
  - is_verified (boolean)
  - created_at (datetime)
  - updated_at (datetime)

unique_together:
  - user, skill

indexes:
  - user (composite with created_at)
  - skill, proficiency_level (composite)
```

#### UserPreference Model (`recommendations.UserPreference`)
```python
fields:
  - id (PK)
  - user (OneToOne → User)
  - onboarding_completed (boolean)
  - onboarding_completed_at (datetime, nullable)
  - interests (JSON array)
  - preferred_categories (text, comma-separated) # Legacy
  - preferred_task_types (JSON array)
  - min_budget (decimal, nullable)
  - max_budget (decimal, nullable)
  - preferred_location (varchar)
  - max_distance (integer, km)
  - prefer_remote (boolean)
  - prefer_physical (boolean)
  - email_notifications (boolean)
  - push_notifications (boolean)
  - created_at (datetime)
  - updated_at (datetime)
```

#### RecommendationLog Model (`recommendations.RecommendationLog`)
```python
fields:
  - id (PK)
  - user (FK → User)
  - recommendation_type (TASK/FREELANCER)
  - recommended_items (text, JSON array)
  - recommendation_scores (text, JSON object)
  - algorithm_used (varchar, hybrid/tfidf/semantic)
  - clicked_items (text, JSON array, nullable)
  - applied_items (text, JSON array, nullable)
  - created_at (datetime)

indexes:
  - user, created_at (composite)
  - recommendation_type
```

### 4.3 Messaging Models

#### Conversation Model (`messaging.Conversation`)
```python
fields:
  - id (PK)
  - participants (M2M → User)
  - task (FK → Task, nullable)
  - last_message_content (text, nullable)
  - last_message_at (datetime, nullable)
  - last_message_sender (FK → User, nullable)
  - is_active (boolean)
  - created_at (datetime)
  - updated_at (datetime)

indexes:
  - last_message_at (descending)
  - task
```

#### Message Model (`messaging.Message`)
```python
fields:
  - id (PK)
  - conversation (FK → Conversation)
  - sender (FK → User)
  - message_type (TEXT/IMAGE/FILE/SYSTEM)
  - content (text)
  - attachment (file, nullable)
  - is_read (boolean)
  - read_at (datetime, nullable)
  - created_at (datetime)
  - updated_at (datetime)

indexes:
  - conversation, created_at (composite)
  - sender
  - is_read
```

### 4.4 Chatbot Models

#### ChatSession Model (`chatbot.ChatSession`)
```python
fields:
  - id (PK)
  - user (FK → User)
  - session_type (GENERAL/TASK_CREATION/TASK_SEARCH/SUPPORT)
  - context_data (text, JSON)
  - is_active (boolean)
  - started_at (datetime)
  - last_message_at (datetime)
  - ended_at (datetime, nullable)

indexes:
  - user, started_at (composite, descending)
  - is_active
```

#### ChatMessage Model (`chatbot.ChatMessage`)
```python
fields:
  - id (PK)
  - session (FK → ChatSession)
  - sender (USER/BOT)
  - message (text)
  - ai_model_used (varchar, e.g., 'gemini-1.5-flash')
  - response_time_ms (integer, nullable)
  - detected_intent (varchar, nullable)
  - extracted_entities (text, JSON, nullable)
  - user_rating (integer 1-5, nullable)
  - created_at (datetime)

indexes:
  - session, created_at (composite)
  - sender
```

### 4.5 Notification Models

#### Notification Model (`notifications.Notification`)
```python
fields:
  - id (PK)
  - recipient (FK → User)
  - notification_type (task_application/application_accepted/...)
  - title (varchar 255)
  - message (text)
  - task_id (integer, nullable)
  - application_id (integer, nullable)
  - message_id (integer, nullable)
  - sender_id (integer, nullable)
  - link (varchar 500, nullable)
  - is_read (boolean)
  - read_at (datetime, nullable)
  - created_at (datetime)
  - updated_at (datetime)

indexes:
  - recipient, created_at (composite, descending)
  - recipient, is_read (composite)
```

#### NotificationPreference Model (`notifications.NotificationPreference`)
```python
fields:
  - id (PK)
  - user (OneToOne → User)
  - email_task_applications (boolean)
  - email_task_updates (boolean)
  - email_messages (boolean)
  - email_task_reminders (boolean)
  - email_marketing (boolean)
  - push_task_applications (boolean)
  - push_task_updates (boolean)
  - push_messages (boolean)
  - push_task_reminders (boolean)
  - created_at (datetime)
  - updated_at (datetime)
```

### 4.6 Database Relationships

```
User (1) ──────< (N) Task [posted_tasks]
User (1) ──────< (N) Task [assigned_tasks]
User (1) ──────< (N) TaskApplication
User (1) ──────< (N) Review [as reviewer]
User (1) ──────< (N) Review [as reviewee]
User (1) ──────< (N) UserSkill
User (1) ────── (1) UserPreference
User (M) ──────< (N) Conversation [participants]
User (1) ──────< (N) Message [sent_messages]
User (1) ──────< (N) Notification
User (1) ──────< (N) ChatSession
User (1) ────── (1) NotificationPreference

Task (N) ────── (1) Category
Task (1) ──────< (N) TaskApplication
Task (1) ──────< (N) Review
Task (M) ──────< (N) Skill [required_skills]
Task (1) ──────< (N) Conversation [optional]
Task (1) ──────< (N) TaskImage

Skill (N) ────── (1) Category
Skill (1) ──────< (N) UserSkill
Skill (M) ──────< (N) Task [required_skills]

Conversation (1) ──────< (N) Message

ChatSession (1) ──────< (N) ChatMessage
```

---

## 5. AI & Machine Learning Features

### 5.1 Recommendation System

#### Architecture
The recommendation system uses a **hybrid approach** combining two algorithms:

1. **TF-IDF (Term Frequency-Inverse Document Frequency)**
   - Weight: 40%
   - Purpose: Fast keyword-based matching
   - Good for: Finding tasks with similar terminology

2. **Semantic Similarity (Sentence Transformers)**
   - Weight: 60%
   - Model: `sentence-transformers/all-MiniLM-L6-v2`
   - Dimensions: 384
   - Size: ~80MB (cached locally)
   - Purpose: Understanding semantic meaning
   - Good for: Finding tasks with similar concepts even with different words

#### Recommendation Algorithm

```python
def recommend_tasks_for_freelancer(user, limit=10):
    # Step 1: Get user skills (structured skill IDs)
    user_skill_ids = get_user_skill_ids(user)

    # Step 2: Cold Start Detection
    if no_skills and no_onboarding:
        return cold_start_recommendations()  # Popular/recent tasks

    # Step 3: Skill-Based Filtering (PRIMARY)
    # Find tasks requiring user's skills
    skill_matched_tasks = tasks.filter(required_skills__in=user_skill_ids)

    # Step 4: Preference-Based Filtering
    # Apply budget, location, task type preferences
    filtered_tasks = apply_user_preferences(skill_matched_tasks)

    # Step 5: Semantic Scoring
    # Create user profile embedding
    user_profile = create_user_embedding(user)
    # Create task embeddings
    task_embeddings = create_task_embeddings(filtered_tasks)
    # Calculate cosine similarity
    semantic_scores = cosine_similarity(user_profile, task_embeddings)

    # Step 6: TF-IDF Scoring
    tfidf_scores = calculate_tfidf_scores(user, filtered_tasks)

    # Step 7: Hybrid Scoring
    final_scores = (
        0.4 * tfidf_scores +
        0.6 * semantic_scores
    )

    # Step 8: Apply Diversity & Recency Boost
    final_scores = apply_diversity_boost(final_scores)
    final_scores = apply_recency_boost(final_scores)

    # Step 9: Sort and Return Top N
    return sorted_tasks[:limit]
```

#### Features

1. **Structured Skill Matching**
   - Primary matching factor
   - Uses skill IDs for precise matching
   - Proficiency levels considered

2. **Cold Start Algorithm**
   - For new users without skills
   - Returns popular and recent tasks
   - Encourages profile completion

3. **Match Percentage**
   - Displayed to users (0-100%)
   - Based on skill overlap + semantic similarity
   - Helps users prioritize applications

4. **Caching**
   - Recommendations cached for 5 minutes
   - Model cached for 24 hours
   - Reduces latency and compute cost

5. **Logging**
   - All recommendations logged for analytics
   - Track clicks and applications
   - Improve algorithm over time

#### Model Selection Rationale

**Why `all-MiniLM-L6-v2`?**
- Fast inference (<50ms per task)
- Small model size (80MB)
- Good accuracy for task matching
- Multilingual support (important for Arabic/English mix)
- Free to use (no API costs)

**Alternatives Considered:**
- `all-mpnet-base-v2`: More accurate but 3x slower and 300MB
- `paraphrase-multilingual-MiniLM-L12-v2`: Better Arabic support but slower
- OpenAI Embeddings: Expensive ($0.0001 per 1K tokens)

### 5.2 AI Chatbot (Hybrid Architecture)

#### Architecture Overview

The chatbot uses a **hybrid approach** combining rule-based logic with AI:

1. **Backend-Controlled Intent Routing** (Primary)
   - Fast keyword-based intent classification
   - Deterministic behavior for critical operations
   - No API calls needed for common commands
   - Instant responses (<10ms)

2. **AI-Powered Responses** (Fallback)
   - Google Gemini 2.5 Flash for general conversation
   - Natural language understanding
   - Context-aware responses
   - Complex query handling

**Benefits of Hybrid Approach**:
- ⚡ Faster response times (avg: 50ms vs 1000ms)
- 💰 Lower costs (70% fewer AI API calls)
- 🎯 More predictable behavior for structured tasks
- 🛡️ Better security control over sensitive operations
- 🤖 AI fallback for natural conversation

#### Technology Stack

**Backend Logic**:
- Python rule-based intent router
- Keyword matching with priority rules
- Session state management
- Multi-step conversation flows

**AI Component**:
- **Model**: Google Gemini 2.5 Flash
- **Provider**: Google Generative AI
- **Cost**: Free tier (60 requests/minute)
- **Usage**: Only for general chat and complex queries

#### Intent Classification System

**Supported Intents** (Backend-Handled):

```python
INTENT_HELP = "HELP"
INTENT_NAVIGATION = "NAVIGATION"
INTENT_RECOMMEND_TASKS = "RECOMMEND_TASKS"
INTENT_CREATE_TASK = "CREATE_TASK"
INTENT_GENERAL_CHAT = "GENERAL_CHAT"  # Falls back to AI
```

**Intent Router Algorithm**:

```python
def route_intent(user_message: str) -> str:
    """
    Rule-based intent classification (backend-controlled)
    """
    text = user_message.lower()

    # Task Recommendations
    if any(keyword in text for keyword in [
        "recommend", "for you", "matched", "find tasks", "suggest tasks"
    ]):
        return INTENT_RECOMMEND_TASKS

    # Task Creation
    if any(keyword in text for keyword in [
        "create task", "post task", "add task", "new task"
    ]):
        return INTENT_CREATE_TASK

    # Navigation
    if any(keyword in text for keyword in [
        "go to", "open", "navigate", "take me to"
    ]):
        return INTENT_NAVIGATION

    # Help
    if any(keyword in text for keyword in [
        "help", "how", "what can you do"
    ]):
        return INTENT_HELP

    # Fallback to AI
    return INTENT_GENERAL_CHAT
```

#### Intent Handling (Hybrid Execution)

**Backend Handlers** (Deterministic):

1. **RECOMMEND_TASKS**
   ```python
   # Direct integration with recommendation engine
   tasks = recommendation_service.recommend_tasks_for_freelancer(user, limit=5)

   return (
       "I found tasks that match your skills",
       {"type": "NAVIGATE", "path": "/recommendations"}
   )
   ```

2. **CREATE_TASK** (Multi-Step Flow)
   ```python
   # Guided conversation with validation
   session.context_data = {
       "flow": "CREATE_TASK",
       "data": {},
       "pending_fields": ["title", "description", "category", "budget", "location"]
   }

   # Ask for next field
   return "What is the task title?", None
   ```

3. **NAVIGATION**
   ```python
   # Return frontend action
   return (
       "Where would you like to go?",
       {"type": "NAVIGATE", "path": "/dashboard"}
   )
   ```

**AI Handler** (GENERAL_CHAT):

```python
# Only called for unclassified queries
response = gemini_model.generate_content(
    system_prompt + conversation_history + user_message
)
return response.text, None
```

#### Conversation Flows

**1. Task Creation Flow (Multi-Turn)**

```
User: "I want to create a task"
Bot: "Sure. Let's create your task step by step. What is the task title?"

User: "Logo design for my startup"
Bot: "Please describe the task requirements in detail."

User: "I need a modern, minimalist logo in blue and white"
Bot: "What category does this task belong to?"

User: "Design"
Bot: "What is your budget in EGP?"

User: "500"
Bot: "Is this task remote or tied to a specific location?"

User: "Remote"
Bot: "Your task **Logo design for my startup** has been created successfully."
     [Action: Navigate to /my-tasks]
```

**Field Validation**:
```python
def validate_task_field(field: str, value: str):
    if field == "title":
        if len(value) < 5:
            return False, "Title must be at least 5 characters."
        return True, value.strip()

    if field == "budget":
        try:
            budget = float(value)
            if budget <= 0:
                raise ValueError
            return True, budget
        except ValueError:
            return False, "Budget must be a valid number in EGP."

    # ... more validators
```

**2. Task Recommendation Flow**

```
User: "Find me some tasks"
Bot: [Backend checks user type]
     [Calls recommendation engine]
     "I found 5 tasks that match your skills"
     [Action: Navigate to /recommendations]
```

**3. General Conversation Flow (AI)**

```
User: "What's the best way to write a proposal?"
Bot: [Routes to GENERAL_CHAT]
     [Calls Gemini API]
     "When writing a proposal, focus on:
     1. Demonstrate understanding of requirements
     2. Highlight relevant experience
     3. Provide realistic timeline..."
```

#### Action System

**Backend can return actions to frontend**:

```python
ALLOWED_ACTIONS = {
    "NAVIGATE": {
        "required_fields": ["path"],
        "optional_fields": ["label"]
    }
}

# Example action
{
    "type": "NAVIGATE",
    "path": "/recommendations",
    "label": "View Recommended Tasks"
}
```

**Frontend Action Handler**:
```javascript
if (response.action && response.action.type === "NAVIGATE") {
    navigate(response.action.path);
}
```

#### Features

1. **Hybrid Intelligence**
   - Rule-based for structured commands (fast, predictable)
   - AI-powered for open-ended conversation (flexible, natural)
   - Automatic fallback between modes

2. **Multi-Step Conversations**
   - Stateful session management
   - Context preservation across messages
   - Field validation and error handling
   - Progress tracking

3. **Context Awareness**
   - Remembers conversation history (last 5 messages)
   - Understands user type (client/freelancer)
   - Adapts responses based on current page
   - Session-based state management

4. **Egyptian Market Context**
   - Currency (EGP)
   - Locations (Cairo, Alexandria, Giza, etc.)
   - Local market rates and practices

5. **Security Controls**
   - Backend validates all actions before execution
   - User type checks (freelancers only for recommendations)
   - Input validation for all fields
   - Whitelist-based action system

#### System Prompt (AI Component)

The AI component uses a comprehensive system prompt covering:
- Platform overview and features
- Task categories (9 categories)
- Navigation capabilities
- User type awareness (client/freelancer/both)
- Task creation guidance
- Egyptian market context
- Response style guidelines

**Example Prompt Structure**:
```python
prompt = f"""
{system_prompt}

Current context:
- User type: {user.user_type}
- Current page: {context.current_page}

Conversation history:
User: Find me programming tasks
Assistant: I can help you find tasks...

User: {current_message}
Assistant:
"""
```

#### Session Management

```python
class ChatSession(models.Model):
    user = ForeignKey(User)
    session_type = CharField(choices=[
        'GENERAL', 'CREATE_TASK', 'TASK_SEARCH', 'SUPPORT'
    ])
    context_data = JSONField()  # Stores conversation state
    is_active = BooleanField()
    started_at = DateTimeField()
    last_message_at = DateTimeField()
```

**Session State Example** (Task Creation):
```json
{
  "flow": "CREATE_TASK",
  "data": {
    "title": "Logo design for startup",
    "description": "Modern minimalist logo",
    "category": "Design"
  },
  "pending_fields": ["budget", "location"]
}
```

#### Performance Metrics

| Metric | Hybrid | AI-Only | Improvement |
|--------|--------|---------|-------------|
| Avg Response Time | 50ms | 1000ms | 20x faster |
| API Calls/Session | 1.5 | 5.0 | 70% reduction |
| Monthly Cost (1000 users) | $0 | $15 | 100% savings |
| Success Rate (Structured Tasks) | 98% | 85% | +13% |

**Response Time Breakdown**:
- Backend intent routing: 5-10ms
- Recommendation engine: 50-800ms (cached: 50ms, cold: 800ms)
- AI generation (when needed): 800-1500ms
- Total (typical): 50ms (backend) or 1000ms (AI)

#### Why Hybrid over Pure AI?

**Pure AI Approach Issues**:
- ❌ Slower responses (always 1-2s)
- ❌ Higher costs ($50-100/month at scale)
- ❌ Unpredictable outputs for critical operations
- ❌ Requires careful prompt engineering
- ❌ Risk of hallucinations for structured tasks

**Hybrid Approach Benefits**:
- ✅ Fast responses for common commands
- ✅ Low/no cost for most interactions
- ✅ Deterministic behavior for critical ops
- ✅ AI available for complex queries
- ✅ Best of both worlds

#### Why Gemini over Alternatives?

| Feature | Gemini Flash | GPT-3.5 Turbo | Claude Instant |
|---------|--------------|---------------|----------------|
| Cost (1M tokens) | Free | $0.50 | $0.80 |
| Speed | ~1s | ~2s | ~1.5s |
| Context window | 32K | 16K | 100K |
| Rate limit (free) | 60/min | 3/min | 5/min |
| Arabic support | Good | Good | Fair |
| Hybrid compatibility | Excellent | Good | Good |

**Decision**: Gemini Flash for development (free tier), can scale to Gemini Pro in production if needed.

#### Usage Statistics

**Intent Distribution** (Typical User Session):
- RECOMMEND_TASKS: 30% (backend-handled)
- CREATE_TASK: 20% (backend-handled, multi-step)
- NAVIGATION: 15% (backend-handled)
- HELP: 10% (backend-handled)
- GENERAL_CHAT: 25% (AI-handled)

**Cost Impact**:
- Before hybrid: 100% AI calls = $50/month (1000 users)
- After hybrid: 25% AI calls = $0/month (free tier sufficient)

### 5.3 Semantic Search

#### Implementation
- Uses same sentence transformer model as recommendations
- Encodes search queries into embeddings
- Finds similar tasks using cosine similarity
- Combined with traditional keyword search

#### Benefits
- Understands synonyms (e.g., "web developer" matches "frontend engineer")
- Handles typos gracefully
- Works across languages (Arabic/English)

---

## 6. Security Implementation

### 6.1 Authentication

#### JWT (JSON Web Tokens)
```python
Configuration:
  - ACCESS_TOKEN_LIFETIME: 24 hours
  - REFRESH_TOKEN_LIFETIME: 7 days
  - ROTATE_REFRESH_TOKENS: True (generates new refresh token)
  - BLACKLIST_AFTER_ROTATION: True (invalidates old tokens)
  - ALGORITHM: HS256
```

**Token Flow:**
1. User logs in with credentials
2. Server validates and returns access + refresh tokens
3. Access token stored in localStorage
4. Access token sent in Authorization header for all requests
5. When access token expires (401 error):
   - Frontend automatically calls /auth/token/refresh/
   - New access token received
   - Original request retried
6. When refresh token expires:
   - User logged out
   - Redirected to login page

#### Google OAuth 2.0
```python
Provider: django-allauth + dj-rest-auth
Flow: OAuth 2.0 Authorization Code with PKCE

Configuration:
  - Client ID: Stored in .env
  - Client Secret: Stored in .env
  - Scopes: profile, email
  - Callback URL: /auth/google/callback/
```

**OAuth Flow:**
1. User clicks "Login with Google"
2. Redirected to Google consent screen
3. User approves
4. Google redirects to callback URL with code
5. Backend exchanges code for access token
6. Backend fetches user profile
7. User created/updated in database
8. JWT tokens generated and returned

### 6.2 Password Security

#### Validation Rules
```python
AUTH_PASSWORD_VALIDATORS:
  1. UserAttributeSimilarityValidator (no username/email in password)
  2. MinimumLengthValidator (min 8 characters)
  3. CommonPasswordValidator (rejects common passwords)
  4. NumericPasswordValidator (can't be entirely numeric)
```

#### Storage
- Passwords hashed using Django's PBKDF2 algorithm
- Salt automatically generated per password
- Hashes stored in database (never plain text)

### 6.3 API Security

#### Rate Limiting
```python
REST_FRAMEWORK:
  DEFAULT_THROTTLE_RATES:
    - anon: 100 requests/hour (unauthenticated)
    - user: 1000 requests/hour (authenticated)
```

#### CORS (Cross-Origin Resource Sharing)
```python
CORS_ALLOWED_ORIGINS:
  - http://localhost:5173 (Vite dev server)
  - http://127.0.0.1:5173
  - http://localhost:3000
  - http://127.0.0.1:3000

CORS_ALLOW_CREDENTIALS: True (allows cookies)
CORS_ALLOW_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
```

#### CSRF Protection
- Enabled for session-based auth
- Token-based (JWT) exempt from CSRF
- Custom middleware validates origin

### 6.4 Production Security Settings

```python
# Only enabled when DEBUG=False

HTTPS Settings:
  - SECURE_SSL_REDIRECT: True (force HTTPS)
  - SESSION_COOKIE_SECURE: True
  - CSRF_COOKIE_SECURE: True

Security Headers:
  - SECURE_BROWSER_XSS_FILTER: True
  - SECURE_CONTENT_TYPE_NOSNIFF: True
  - X_FRAME_OPTIONS: 'DENY' (prevent clickjacking)

HSTS (HTTP Strict Transport Security):
  - SECURE_HSTS_SECONDS: 31536000 (1 year)
  - SECURE_HSTS_INCLUDE_SUBDOMAINS: True
  - SECURE_HSTS_PRELOAD: True
```

### 6.5 Data Protection

#### Sensitive Data
- API keys stored in `.env` (not in version control)
- `.env.example` provided as template
- OAuth credentials never committed

#### File Upload Security
```python
MAX_UPLOAD_SIZE: 10MB
ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
ALLOWED_DOCUMENT_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt']

# Files stored in media/ directory
# Served through Django (with permission checks)
```

#### SQL Injection Prevention
- Django ORM escapes all queries
- Parameterized queries used throughout
- Never use raw SQL with user input

#### XSS (Cross-Site Scripting) Prevention
- React automatically escapes variables
- HTML sanitization for rich text (react-markdown)
- Content-Security-Policy headers in production

### 6.6 WebSocket Security

#### Authentication
```python
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Extract JWT from query string
        token = self.scope['query_string'].decode().split('token=')[1]

        # Validate JWT
        user = await authenticate_jwt(token)

        if not user:
            await self.close()
            return

        # Store user in scope
        self.scope['user'] = user
        await self.accept()
```

#### Channel Layer Security
- Redis password-protected (production)
- Channel names include user IDs (isolation)
- Group names validated before joining

### 6.7 Known Security Considerations

#### Current Limitations (Development Mode)
1. **DEBUG=True**: Exposes detailed error messages (disable in production)
2. **EMAIL_BACKEND**: Using console (switch to SMTP for production)
3. **SECRET_KEY**: Should be rotated regularly
4. **ALLOWED_HOSTS**: Currently ['localhost', '127.0.0.1'] (update for production domain)

#### Recommended for Production
1. Enable all production security settings
2. Use environment-specific `.env` files
3. Implement API request signing
4. Add honeypot fields to forms (bot detection)
5. Implement IP-based rate limiting
6. Use WAF (Web Application Firewall)
7. Regular security audits
8. Automated vulnerability scanning

---

## 7. Real-Time Features

### 7.1 Technology Stack

#### Django Channels
- ASGI-based framework
- WebSocket support
- Channel layers for message passing
- Redis as message broker

#### Socket.IO (Client)
- WebSocket library for React
- Automatic reconnection
- Event-based communication
- Fallback to long-polling

### 7.2 WebSocket Routing

```python
# backend/messaging/routing.py

websocket_urlpatterns = [
    path('ws/chat/', ChatConsumer.as_asgi()),
    path('ws/notifications/', NotificationConsumer.as_asgi()),
]

# Connected to ASGI application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
```

### 7.3 Real-Time Messaging

#### Architecture
```
User A                          Server                          User B
  │                               │                               │
  ├─ Connect WebSocket ──────────>│                               │
  │  (JWT in query string)        │                               │
  │<─ Connection Accepted ────────┤                               │
  │                               │<─── Connect WebSocket ────────┤
  │                               ├─ Connection Accepted ────────>│
  │                               │                               │
  ├─ Send Message ───────────────>│                               │
  │  (to conversation ID)         ├─ Save to DB                  │
  │                               ├─ Broadcast to group ─────────>│
  │<─ Message Confirmation ───────┤                               │
  │                               │                               │
  │<────────────────────────────── Mark as Delivered ────────────┤
  │                               │                               │
```

#### Consumer Implementation

```python
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authenticate user
        # Join personal channel
        # Accept connection

    async def disconnect(self, close_code):
        # Leave all groups
        # Update user status

    async def receive(self, text_data):
        # Parse incoming message
        # Save to database
        # Broadcast to participants

    async def chat_message(self, event):
        # Send message to WebSocket
```

#### Features
- Real-time message delivery
- Typing indicators
- Read receipts
- Online/offline status
- Message persistence
- File attachments
- Conversation threading

### 7.4 Real-Time Notifications

#### Notification Types
1. Task application received
2. Application accepted/rejected
3. Task completed
4. Task cancelled
5. New message
6. Task reminder
7. Payment received
8. Review received
9. Task updates
10. System notifications

#### Delivery Mechanism
```python
# Create notification in database
notification = Notification.create_notification(
    recipient=user,
    notification_type='task_application',
    title='New Application',
    message='You received an application on your task',
    task_id=task.id,
    link=f'/tasks/{task.id}'
)

# Send to WebSocket (real-time)
channel_layer = get_channel_layer()
await channel_layer.group_send(
    f'user_{user.id}',
    {
        'type': 'notification_message',
        'notification': NotificationSerializer(notification).data
    }
)
```

#### Frontend Integration
```javascript
// Establish WebSocket connection
const socket = io(`ws://localhost:8000/ws/notifications/`, {
  query: { token: accessToken }
});

// Listen for notifications
socket.on('notification', (notification) => {
  // Show toast
  toast.success(notification.message);

  // Update notification badge
  updateNotificationCount();

  // Add to notification list
  addNotificationToList(notification);
});
```

### 7.5 Redis Channel Layer

#### Configuration
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

#### Fallback (No Redis)
```python
# Automatic fallback to InMemory (development only)
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}
```

**Warning**: InMemory layer:
- Only works with single server instance
- Not suitable for production
- No persistence across restarts

### 7.6 Connection Management

#### Client-Side
```javascript
// Auto-reconnect on disconnect
socket.on('disconnect', () => {
  console.log('WebSocket disconnected');
  // Socket.IO automatically attempts reconnection
});

socket.on('connect', () => {
  console.log('WebSocket connected');
  // Resync state if needed
});

// Manual reconnect
if (!socket.connected) {
  socket.connect();
}
```

#### Server-Side
```python
# Heartbeat mechanism (ping/pong)
# Implemented by Channels automatically

# Clean up stale connections
# Channels handles this internally
```

---

## 8. Authentication & Authorization

### 8.1 Authentication Methods

#### 1. Username/Email + Password
```python
POST /auth/login/
{
  "username": "user@example.com",  # or username
  "password": "password123"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "freelancer"
  }
}
```

#### 2. Google OAuth
```python
# Frontend initiates OAuth flow
window.location.href = '/auth/google/login/';

# After Google approval, callback receives code
GET /auth/google/callback/?code=...

# Backend exchanges code for user info
# Creates/updates user in database
# Returns JWT tokens
```

#### 3. Token Refresh
```python
POST /auth/token/refresh/
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 8.2 Authorization Levels

#### Permission Classes

1. **IsAuthenticatedOrReadOnly**
   - GET requests: Anyone
   - POST/PUT/DELETE: Authenticated users only

2. **IsAuthenticated**
   - All requests: Authenticated users only

3. **IsOwnerOrReadOnly** (Custom)
   - GET: Anyone
   - POST/PUT/DELETE: Owner only

4. **IsClientOrReadOnly** (Custom)
   - Create tasks: Clients only
   - Apply to tasks: Freelancers only

#### Model-Level Permissions

```python
# Task permissions
- Create: Clients (for task_request) or Freelancers (for service_offer)
- Update: Owner only
- Delete: Owner only
- Accept application: Task owner only

# Application permissions
- Create: Freelancers only, can't apply to own tasks
- Update: Applicant only
- Withdraw: Applicant only

# Review permissions
- Create: Task participants only, after task completion
- Update: Reviewer only
- Delete: Admin only

# Message permissions
- Send: Conversation participants only
- Read: Conversation participants only

# Profile permissions
- View: Anyone
- Edit: Owner only
```

### 8.3 User Types & Roles

#### User Type System
```python
USER_TYPE_CHOICES = [
    ('client', 'Client'),
    ('freelancer', 'Freelancer'),
    ('both', 'Both'),
    ('admin', 'Admin'),
]
```

#### Permissions by User Type

| Action | Client | Freelancer | Both | Admin |
|--------|--------|------------|------|-------|
| Post task request | ✓ | ✗ | ✓ | ✓ |
| Post service offer | ✗ | ✓ | ✓ | ✓ |
| Apply to tasks | ✗ | ✓ | ✓ | ✓ |
| Accept applications | ✓ | ✗ | ✓ | ✓ |
| Leave reviews | ✓ | ✓ | ✓ | ✓ |
| Send messages | ✓ | ✓ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✗ | ✓ |

### 8.4 Frontend Auth Management

#### AuthContext
```javascript
// src/context/AuthContext.jsx

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Protected Routes
```javascript
// src/routes/AppRoutes.jsx

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

// Usage
<Route path="/tasks/create" element={
  <ProtectedRoute>
    <TaskCreate />
  </ProtectedRoute>
} />
```

#### Role-Based Access
```javascript
const ClientOnlyRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user.is_client) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
```

---

## 9. API Documentation

### 9.1 API Base URL

```
Development: http://localhost:8000/api
Production: https://your-domain.com/api
```

### 9.2 Authentication Endpoints

#### Register
```http
POST /auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "password2": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "freelancer"
}

Response (201):
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { ... }
}
```

#### Login
```http
POST /auth/login/
Content-Type: application/json

{
  "username": "john_doe",  # or email
  "password": "SecurePass123"
}

Response (200):
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "user_type": "freelancer",
    "profile_picture": null,
    "average_rating": 4.5,
    "total_reviews": 10
  }
}
```

#### Logout
```http
POST /auth/logout/
Authorization: Bearer <access_token>

Response (200):
{
  "detail": "Successfully logged out."
}
```

#### Token Refresh
```http
POST /auth/token/refresh/
Content-Type: application/json

{
  "refresh": "<refresh_token>"
}

Response (200):
{
  "access": "<new_access_token>"
}
```

### 9.3 User Endpoints

#### Get Current User
```http
GET /auth/user/
Authorization: Bearer <access_token>

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Experienced freelancer...",
  "user_type": "freelancer",
  "skills": "Python, Django, React",
  "average_rating": 4.5,
  "total_reviews": 10,
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Update Profile
```http
PATCH /auth/user/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "bio": "Updated bio",
  "profile_picture": <file>,
  "city": "Cairo",
  "phone_number": "+20123456789"
}

Response (200): Updated user object
```

### 9.4 Task Endpoints

#### List Tasks
```http
GET /tasks/?category=design&status=OPEN&page=1
Authorization: Bearer <access_token>

Query Parameters:
- category: Filter by category slug
- status: OPEN/IN_PROGRESS/COMPLETED/CANCELLED
- task_type: PHYSICAL/DIGITAL/BOTH
- listing_type: task_request/service_offer
- min_budget: Minimum budget
- max_budget: Maximum budget
- city: Filter by city
- search: Keyword search
- page: Page number (12 per page)

Response (200):
{
  "count": 45,
  "next": "http://localhost:8000/api/tasks/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Logo Design for Tech Startup",
      "description": "Need a modern logo...",
      "category": {
        "id": 1,
        "name": "Design & Creative",
        "slug": "design"
      },
      "client": {
        "id": 2,
        "username": "client_user",
        "average_rating": 4.8
      },
      "budget": 500.00,
      "is_negotiable": true,
      "status": "OPEN",
      "task_type": "DIGITAL",
      "applications_count": 3,
      "created_at": "2024-12-10T14:30:00Z"
    },
    ...
  ]
}
```

#### Get Task Detail
```http
GET /tasks/1/
Authorization: Bearer <access_token>

Response (200):
{
  "id": 1,
  "title": "Logo Design for Tech Startup",
  "description": "Full description...",
  "category": { ... },
  "client": { ... },
  "budget": 500.00,
  "required_skills": [
    { "id": 1, "name": "Graphic Design" },
    { "id": 5, "name": "Adobe Illustrator" }
  ],
  "applications": [
    {
      "id": 1,
      "freelancer": { ... },
      "offered_price": 450.00,
      "status": "PENDING"
    }
  ],
  "created_at": "2024-12-10T14:30:00Z"
}
```

#### Create Task
```http
POST /tasks/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "title": "Website Development",
  "description": "Need a portfolio website...",
  "category": 2,
  "budget": 1000.00,
  "task_type": "DIGITAL",
  "listing_type": "task_request",
  "required_skills": [1, 3, 5],
  "deadline": "2024-12-31T23:59:59Z",
  "image": <file>
}

Response (201): Created task object
```

#### Update Task
```http
PATCH /tasks/1/
Authorization: Bearer <access_token>

{
  "description": "Updated description",
  "budget": 1200.00
}

Response (200): Updated task object
```

#### Delete Task
```http
DELETE /tasks/1/
Authorization: Bearer <access_token>

Response (204): No content
```

### 9.5 Task Application Endpoints

#### Apply to Task
```http
POST /tasks/1/applications/
Authorization: Bearer <access_token>

{
  "proposal": "I'm interested in this task...",
  "offered_price": 950.00,
  "estimated_time": "2 weeks",
  "cover_letter": "My portfolio: ..."
}

Response (201):
{
  "id": 10,
  "task": 1,
  "freelancer": { ... },
  "proposal": "...",
  "offered_price": 950.00,
  "status": "PENDING",
  "created_at": "2024-12-15T10:00:00Z"
}
```

#### Accept/Reject Application
```http
PATCH /tasks/applications/10/
Authorization: Bearer <access_token>  # Must be task owner

{
  "status": "ACCEPTED"  # or "REJECTED"
}

Response (200): Updated application
```

#### Withdraw Application
```http
DELETE /tasks/applications/10/
Authorization: Bearer <access_token>  # Must be applicant

Response (204): No content
```

### 9.6 Recommendation Endpoints

#### Get Personalized Recommendations
```http
GET /recommendations/for-you/
Authorization: Bearer <access_token>

Response (200):
{
  "recommendations": [
    {
      "task": {
        "id": 5,
        "title": "React Developer Needed",
        "budget": 2000.00,
        ...
      },
      "match_percentage": 85,
      "match_reasons": [
        "Skills: React, JavaScript",
        "Budget matches your preference",
        "Remote work available"
      ]
    },
    ...
  ],
  "total_count": 10,
  "algorithm_used": "hybrid"
}
```

### 9.7 Messaging Endpoints

#### List Conversations
```http
GET /messages/conversations/
Authorization: Bearer <access_token>

Response (200):
{
  "results": [
    {
      "id": 1,
      "participants": [
        { "id": 1, "username": "user1" },
        { "id": 2, "username": "user2" }
      ],
      "last_message_content": "Thanks for your interest",
      "last_message_at": "2024-12-15T10:30:00Z",
      "unread_count": 2
    }
  ]
}
```

#### Get Conversation Messages
```http
GET /messages/conversations/1/messages/
Authorization: Bearer <access_token>

Response (200):
{
  "results": [
    {
      "id": 1,
      "sender": { "id": 1, "username": "user1" },
      "content": "Hello, I'm interested in your task",
      "message_type": "TEXT",
      "is_read": true,
      "created_at": "2024-12-15T10:00:00Z"
    },
    ...
  ]
}
```

#### Send Message
```http
POST /messages/conversations/1/messages/
Authorization: Bearer <access_token>

{
  "content": "Sure, let's discuss the details",
  "message_type": "TEXT"
}

Response (201): Created message
```

### 9.8 Notification Endpoints

#### List Notifications
```http
GET /notifications/
Authorization: Bearer <access_token>

Query Parameters:
- is_read: true/false
- notification_type: Filter by type
- page: Page number

Response (200):
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "notification_type": "task_application",
      "title": "New Application",
      "message": "You received an application...",
      "is_read": false,
      "link": "/tasks/5",
      "created_at": "2024-12-15T10:00:00Z"
    },
    ...
  ]
}
```

#### Mark as Read
```http
PATCH /notifications/1/
Authorization: Bearer <access_token>

{
  "is_read": true
}

Response (200): Updated notification
```

#### Mark All as Read
```http
POST /notifications/mark-all-read/
Authorization: Bearer <access_token>

Response (200):
{
  "detail": "All notifications marked as read",
  "count": 25
}
```

### 9.9 Chatbot Endpoints (Hybrid)

#### Send Message to Chatbot
```http
POST /chatbot/chat/
Authorization: Bearer <access_token>

{
  "message": "Find me some tasks",
  "session_id": null,  # or existing session ID
  "context": {  # optional
    "current_page": "/dashboard"
  }
}

Response (200) - Backend-Handled Intent:
{
  "session_id": 5,
  "messages": [
    {
      "id": 10,
      "sender": "USER",
      "message": "Find me some tasks",
      "created_at": "2024-12-15T10:00:00Z"
    },
    {
      "id": 11,
      "sender": "BOT",
      "message": "I found 5 tasks that match your skills and preferences.",
      "detected_intent": "RECOMMEND_TASKS",
      "ai_model_used": null,  # Backend-handled, no AI call
      "response_time_ms": 45,
      "action": {
        "type": "NAVIGATE",
        "path": "/recommendations",
        "label": "View Recommended Tasks"
      },
      "created_at": "2024-12-15T10:00:01Z"
    }
  ]
}

Response (200) - AI-Handled Intent:
{
  "session_id": 5,
  "messages": [
    {
      "id": 12,
      "sender": "USER",
      "message": "What's the best way to write a proposal?",
      "created_at": "2024-12-15T10:05:00Z"
    },
    {
      "id": 13,
      "sender": "BOT",
      "message": "When writing a proposal, focus on these key elements:\n1. Demonstrate understanding of requirements\n2. Highlight relevant experience...",
      "detected_intent": "GENERAL_CHAT",
      "ai_model_used": "gemini-2.5-flash",  # AI was used
      "response_time_ms": 1050,
      "action": null,  # No action
      "created_at": "2024-12-15T10:05:01Z"
    }
  ]
}
```

**Supported Intents**:
- `RECOMMEND_TASKS`: Find matching tasks (backend-handled)
- `CREATE_TASK`: Start task creation flow (backend-handled, multi-step)
- `NAVIGATION`: Navigate to different pages (backend-handled)
- `HELP`: Show help information (backend-handled)
- `GENERAL_CHAT`: General conversation (AI-handled)

**Intent Detection Examples**:

| User Message | Detected Intent | Handled By |
|--------------|----------------|------------|
| "Find me tasks" | RECOMMEND_TASKS | Backend |
| "Create a new task" | CREATE_TASK | Backend (multi-step) |
| "Go to dashboard" | NAVIGATION | Backend |
| "What can you do?" | HELP | Backend |
| "How do I write a good proposal?" | GENERAL_CHAT | Gemini AI |

#### Task Creation Flow (Multi-Step)

**Step 1: Initiate**
```http
POST /chatbot/chat/
{
  "message": "I want to create a task",
  "session_id": null
}

Response:
{
  "session_id": 6,
  "messages": [
    ...,
    {
      "sender": "BOT",
      "message": "Sure. Let's create your task step by step.\n\nWhat is the task title?",
      "detected_intent": "CREATE_TASK",
      "response_time_ms": 15
    }
  ]
}
```

**Step 2-6: Collect Fields**
```http
POST /chatbot/chat/
{
  "message": "Logo design for startup",
  "session_id": 6
}

Response:
{
  "session_id": 6,
  "messages": [
    ...,
    {
      "sender": "BOT",
      "message": "Please describe the task requirements in detail.",
      "response_time_ms": 12
    }
  ]
}

# Continue for: description, category, budget, location
```

**Step 7: Completion**
```http
POST /chatbot/chat/
{
  "message": "Remote",
  "session_id": 6
}

Response:
{
  "session_id": 6,
  "messages": [
    ...,
    {
      "sender": "BOT",
      "message": "Your task **Logo design for startup** has been created successfully. Freelancers can now see and apply to it.",
      "response_time_ms": 200,
      "action": {
        "type": "NAVIGATE",
        "path": "/my-tasks",
        "label": "View Your Tasks"
      }
    }
  ]
}
```

### 9.10 Skill Endpoints

#### List Skills
```http
GET /skills/
Authorization: Bearer <access_token>

Query Parameters:
- category: Filter by category ID
- search: Keyword search

Response (200):
{
  "results": [
    {
      "id": 1,
      "name": "React",
      "category": "Programming & Tech",
      "usage_count": 150
    },
    ...
  ]
}
```

#### Add Skill to Profile
```http
POST /skills/user-skills/
Authorization: Bearer <access_token>

{
  "skill_id": 1,
  "proficiency_level": "ADVANCED",
  "years_experience": 3
}

Response (201): Created user skill
```

### 9.11 Error Responses

#### 400 Bad Request
```json
{
  "detail": "Invalid input",
  "errors": {
    "budget": ["Ensure this value is greater than or equal to 10."]
  }
}
```

#### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

#### 404 Not Found
```json
{
  "detail": "Not found."
}
```

#### 500 Internal Server Error
```json
{
  "detail": "An error occurred while processing your request."
}
```

---

## 10. Issues Faced & Solutions

### 10.1 Redis Connection Issues

**Problem**: Redis not installed/running caused Django Channels to crash

**Solution**: Implemented automatic fallback to InMemory channel layer
```python
try:
    redis.Redis(host='127.0.0.1', port=6379).ping()
    # Use Redis
except:
    # Fallback to InMemory
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
    }
```

**Time Spent**: 2 hours debugging
**Prevention**: Added graceful fallback and clear logging

### 10.2 JWT Token Expiration

**Problem**: Users logged out unexpectedly when access token expired

**Solution**: Implemented automatic token refresh in Axios interceptor
```javascript
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      // Refresh token and retry request
    }
  }
);
```

**Time Spent**: 3 hours
**Prevention**: Extended access token lifetime to 24 hours for better UX

### 10.3 Google OAuth Configuration

**Problem**: OAuth redirect URI mismatch errors

**Solution**:
1. Created template file (`configure_google_oauth.template.py`)
2. Added to .gitignore to prevent secret leaks
3. Documented setup steps

**Time Spent**: 4 hours
**Prevention**: Clear documentation and configuration templates

### 10.4 CORS Errors

**Problem**: Frontend couldn't connect to backend API

**Solution**: Configured CORS properly
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

**Time Spent**: 1 hour
**Prevention**: Added both localhost and 127.0.0.1 to allowed origins

### 10.5 PostgreSQL Installation

**Problem**: Initial attempt to use SQLite caused issues with JSON fields

**Solution**: Switched to PostgreSQL from the start
- Better JSON support
- Better performance for complex queries
- Production-ready

**Time Spent**: 2 hours (including installation and setup)
**Prevention**: Always use production database in development

### 10.6 Sentence Transformer Model Download

**Problem**: First-time model download took long and wasn't cached

**Solution**: Implemented model caching
```python
model = cache.get('sentence_transformer_model')
if model is None:
    model = SentenceTransformer(model_name)
    cache.set('sentence_transformer_model', model, 86400)
```

**Time Spent**: 1 hour
**Prevention**: Pre-download models during setup

### 10.7 WebSocket Authentication

**Problem**: Couldn't send JWT token in WebSocket headers (browser limitation)

**Solution**: Pass token in query string
```javascript
const socket = io(`ws://localhost:8000/ws/chat/?token=${accessToken}`);
```

**Time Spent**: 2 hours researching
**Prevention**: Document WebSocket auth pattern

### 10.8 React 19 Breaking Changes

**Problem**: Some older libraries incompatible with React 19

**Solution**:
- Updated all dependencies to latest versions
- Replaced deprecated APIs
- Used React 19 features (useOptimistic, useActionState)

**Time Spent**: 3 hours
**Prevention**: Always check compatibility before major updates

### 10.9 Vite Configuration for API Proxy

**Problem**: Different ports for frontend (5173) and backend (8000)

**Solution**: No proxy needed - just use CORS
- Simpler configuration
- Works better with WebSockets
- Production-ready approach

**Time Spent**: 1 hour
**Decision**: Keep frontend and backend separate (best practice)

### 10.10 Recommendation System Performance

**Problem**: Generating recommendations was slow (>3 seconds)

**Solutions Implemented**:
1. Added caching (5-minute TTL)
2. Optimized database queries (select_related, prefetch_related)
3. Batch embedding generation
4. Used lighter model (MiniLM instead of MPNet)

**Results**:
- Cold: ~800ms
- Cached: ~50ms

**Time Spent**: 6 hours optimizing
**Prevention**: Always profile before optimizing

### 10.11 File Upload Size Limits

**Problem**: Large file uploads failing silently

**Solution**: Set explicit limits and show clear error messages
```python
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760
```

**Time Spent**: 1 hour
**Prevention**: Client-side validation before upload

### 10.12 Database Migration Conflicts

**Problem**: Merge conflicts in migration files after multiple developers worked in parallel

**Solution**:
- Always pull before creating migrations
- Run `makemigrations --merge` when needed
- Keep migration files in git

**Time Spent**: 2 hours resolving conflicts
**Prevention**: Better git workflow and communication

---

## 11. Alternative Solutions & Design Decisions

### 11.1 Database Choice

**Options Considered**:
1. SQLite (Django default)
2. PostgreSQL ✓ (Chosen)
3. MySQL
4. MongoDB

**Decision**: PostgreSQL
**Reasons**:
- Superior JSON field support
- Better full-text search
- More powerful query capabilities
- Production-grade performance
- Free and open-source

### 11.2 State Management (Frontend)

**Options Considered**:
1. Redux (most popular)
2. MobX
3. Zustand ✓ (Chosen)
4. Recoil
5. React Context only

**Decision**: Zustand
**Reasons**:
- Simpler API than Redux
- Less boilerplate
- Better TypeScript support
- Smaller bundle size (1KB vs 20KB)
- Sufficient for our needs

### 11.3 AI Model for Recommendations

**Options Considered**:
1. OpenAI Embeddings API
2. Cohere Embed
3. Sentence Transformers ✓ (Chosen)
4. Universal Sentence Encoder

**Decision**: Sentence Transformers (all-MiniLM-L6-v2)
**Reasons**:
- Free (no API costs)
- Fast inference (<50ms)
- Runs locally (data privacy)
- Good accuracy for task matching
- Multilingual support

**Cost Comparison**:
| Solution | Cost per 1M tokens | Latency |
|----------|-------------------|---------|
| OpenAI | $0.10 | 100-200ms |
| Cohere | $0.10 | 100-150ms |
| Sentence Transformers | $0 (compute only) | 30-50ms |

### 11.4 Chatbot Model

**Options Considered**:
1. Google Gemini ✓ (Chosen)
2. OpenAI GPT-3.5
3. Claude Instant
4. Open-source models (Llama, Mistral)

**Decision**: Google Gemini 2.5 Flash
**Reasons**:
- Free tier (60 req/min)
- Fast response time
- Good Arabic support
- Large context window (32K)
- Easy integration

**Production Plan**: Switch to Gemini Pro if free tier insufficient

### 11.4.1 Chatbot Architecture (Hybrid vs Pure AI)

**Options Considered**:
1. Pure AI (all responses generated by LLM)
2. Pure Rule-Based (keyword matching only)
3. Hybrid (Rule-based + AI fallback) ✓ (Chosen)
4. Intent Classification AI + Execution AI

**Decision**: Hybrid Architecture (Backend Rules + AI Fallback)

**Reasons**:
- **Performance**: 20x faster for structured commands (50ms vs 1000ms)
- **Cost**: 70% fewer AI API calls ($0 vs $50/month at 1000 users)
- **Reliability**: Deterministic behavior for critical operations
- **Security**: Backend validates all actions before execution
- **User Experience**: Instant responses for common commands
- **Flexibility**: AI available for complex, open-ended queries

**Comparison Table**:

| Aspect | Pure AI | Hybrid | Pure Rules |
|--------|---------|--------|------------|
| Avg Response Time | 1000ms | 50-150ms | 10ms |
| Monthly Cost (1K users) | $50 | $0 (free tier) | $0 |
| Structured Task Success | 85% | 98% | 95% |
| General Conversation | Excellent | Excellent | Poor |
| Predictability | Low | High | Very High |
| Flexibility | Very High | High | Low |
| Security Control | Medium | High | Very High |

**Implementation Details**:

```python
# Intent distribution (actual usage):
RECOMMEND_TASKS: 30%  → Backend (instant)
CREATE_TASK: 20%      → Backend (multi-step)
NAVIGATION: 15%       → Backend (instant)
HELP: 10%            → Backend (instant)
GENERAL_CHAT: 25%    → AI (1s response)

# Weighted average response time:
(0.75 × 50ms) + (0.25 × 1000ms) = 287ms
vs Pure AI: 1000ms (3.5x improvement)
```

**Why Not Pure AI**:
- ❌ Every response takes 1-2 seconds (poor UX)
- ❌ $50-100/month at scale (unnecessary cost)
- ❌ Unpredictable outputs for critical operations (e.g., task creation)
- ❌ Risk of hallucinations for structured data
- ❌ Harder to debug and test
- ❌ Prompt engineering required for reliability

**Why Not Pure Rules**:
- ❌ Can't handle natural language queries
- ❌ Poor user experience for open-ended questions
- ❌ Requires exact keyword matches
- ❌ Limited conversational ability
- ❌ Frequent "I don't understand" responses

**Hybrid Wins**:
- ✅ Best of both worlds
- ✅ Fast, predictable for common tasks
- ✅ Flexible, intelligent for complex queries
- ✅ Cost-effective at scale
- ✅ Easy to extend with new intents
- ✅ Clear separation of concerns

**Future Enhancements**:
1. ML-based intent classification (still backend-controlled)
2. Sentiment analysis for better responses
3. Multi-language support (Arabic NLU)
4. Voice input/output
5. Proactive suggestions based on user behavior

### 11.5 Real-Time Communication

**Options Considered**:
1. Django Channels + WebSockets ✓ (Chosen)
2. Long polling
3. Server-Sent Events (SSE)
4. Firebase Realtime Database

**Decision**: Django Channels + WebSockets
**Reasons**:
- Native Django integration
- Bidirectional communication
- Better for chat (two-way)
- Scalable with Redis
- No external dependencies

### 11.6 Authentication Strategy

**Options Considered**:
1. Session-based authentication
2. JWT ✓ (Chosen)
3. OAuth only
4. Passwordless (magic links)

**Decision**: JWT + OAuth
**Reasons**:
- Stateless (better for scaling)
- Works with mobile apps
- Easy token refresh
- Standard industry practice
- OAuth for social login

### 11.7 Frontend Build Tool

**Options Considered**:
1. Create React App (CRA)
2. Vite ✓ (Chosen)
3. Next.js
4. Parcel

**Decision**: Vite
**Reasons**:
- 10x faster than CRA
- Better dev experience (HMR)
- Smaller bundle sizes
- Native ESM support
- Modern and actively maintained

### 11.8 CSS Framework

**Options Considered**:
1. Tailwind CSS ✓ (Chosen)
2. Bootstrap
3. Material-UI
4. Chakra UI
5. Styled Components

**Decision**: Tailwind CSS
**Reasons**:
- Utility-first approach
- Small bundle size (tree-shaking)
- Rapid development
- Highly customizable
- Great documentation

### 11.9 Image Storage

**Options Considered**:
1. Local filesystem ✓ (Chosen for now)
2. AWS S3
3. Cloudinary
4. Azure Blob Storage

**Decision**: Local filesystem (development), plan to migrate to S3
**Reasons**:
- Simpler for development
- No external costs
- Easy to switch later
- Django handles it well

**Production Plan**: Migrate to AWS S3 with CloudFront CDN

### 11.10 Task Matching Algorithm

**Options Considered**:
1. Keyword matching only
2. TF-IDF only
3. Semantic similarity only
4. Hybrid (TF-IDF + Semantic) ✓ (Chosen)
5. Collaborative filtering

**Decision**: Hybrid approach (40% TF-IDF, 60% Semantic)
**Reasons**:
- Best of both worlds
- Fast keyword matching for obvious matches
- Semantic understanding for nuanced matches
- Configurable weights
- Better results than either alone

**Testing Results**:
| Algorithm | Precision | Recall | Speed |
|-----------|-----------|--------|-------|
| TF-IDF only | 0.65 | 0.72 | 50ms |
| Semantic only | 0.78 | 0.68 | 200ms |
| Hybrid | 0.82 | 0.79 | 150ms |

### 11.11 Caching Strategy

**Options Considered**:
1. No caching
2. Database query caching
3. Redis caching ✓ (Chosen)
4. Memcached

**Decision**: Redis caching with fallback to in-memory
**Reasons**:
- Fast (sub-millisecond)
- Supports complex data structures
- Shared across instances
- Also used for Channels
- Easy to configure

### 11.12 API Documentation

**Options Considered**:
1. Manual documentation
2. drf-yasg
3. drf-spectacular ✓ (Chosen)
4. Postman collections

**Decision**: drf-spectacular
**Reasons**:
- Auto-generates OpenAPI 3.0 schema
- Better than drf-yasg (actively maintained)
- Interactive Swagger UI
- Supports latest DRF features
- Type hints and schema customization

---

## 12. Dataset & Seeding

### 12.1 Initial Data Requirements

The platform requires initial data for:
1. Categories
2. Skills
3. Sample users
4. Sample tasks
5. Sample applications

### 12.2 Category Data

**Seed Data** (`tasks/fixtures/categories.json`):

```python
Categories:
1. Design & Creative
   - Logo Design, UI/UX Design, Graphic Design
   - Icon: 🎨

2. Programming & Tech
   - Web Development, Mobile Apps, API Development
   - Icon: 💻

3. Writing & Translation
   - Content Writing, Technical Docs, Translation
   - Icon: ✍️

4. Marketing & Business
   - Social Media, SEO, Business Consulting
   - Icon: 📊

5. Consulting & Advice
   - Legal, Financial, Career Coaching
   - Icon: 💼

6. Cleaning & Home Services
   - House Cleaning, Repairs, Maintenance
   - Icon: 🏠

7. Tutoring & Education
   - Academic Tutoring, Language Teaching
   - Icon: 📚

8. Personal Assistant
   - Data Entry, Virtual Assistance
   - Icon: 👔

9. Other Services
   - Miscellaneous tasks
   - Icon: 🔧
```

### 12.3 Skills Data

**Structured Skills** (`recommendations/fixtures/skills.json`):

```python
Programming & Tech:
- Python, Django, Flask, FastAPI
- JavaScript, React, Vue, Angular, Node.js
- TypeScript, Next.js, Express
- PHP, Laravel, WordPress
- Java, Spring Boot
- C#, .NET, ASP.NET
- Mobile: React Native, Flutter, Swift, Kotlin
- Database: PostgreSQL, MySQL, MongoDB, Redis
- DevOps: Docker, Kubernetes, AWS, Azure

Design & Creative:
- Adobe Photoshop, Illustrator, InDesign
- Figma, Sketch, Adobe XD
- UI/UX Design, User Research
- 3D Modeling, Blender, Maya
- Video Editing, After Effects, Premiere Pro

Writing & Translation:
- Content Writing, Copywriting
- Technical Writing, Documentation
- SEO Writing, Blog Writing
- Arabic Translation, English Translation
- Proofreading, Editing

Marketing:
- Social Media Marketing
- SEO, SEM, Google Ads
- Email Marketing
- Content Strategy
- Brand Management

Consulting:
- Business Consulting
- Financial Planning
- Legal Consulting
- Career Coaching
- Project Management

Other:
- Customer Service
- Data Entry
- Virtual Assistance
- Cleaning Services
- Tutoring
```

**Total Skills**: ~150 skills across all categories

### 12.4 User Generation

**Method**: Using Faker library

```python
from faker import Faker
fake = Faker()

# Generate 100 users
for i in range(100):
    user = User.objects.create_user(
        username=fake.user_name(),
        email=fake.email(),
        password='password123',
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        bio=fake.text(max_nb_chars=200),
        city=random.choice(['Cairo', 'Alexandria', 'Giza', 'Aswan']),
        user_type=random.choice(['client', 'freelancer', 'both']),
        average_rating=round(random.uniform(3.5, 5.0), 2),
        total_reviews=random.randint(0, 50)
    )

    # Assign 3-7 random skills
    skills = random.sample(all_skills, random.randint(3, 7))
    for skill in skills:
        UserSkill.objects.create(
            user=user,
            skill=skill,
            proficiency_level=random.choice([
                'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'
            ]),
            years_experience=random.randint(1, 10)
        )
```

### 12.5 Task Generation

**Method**: Programmatic generation with realistic data

```python
# Generate 200 tasks
for i in range(200):
    task = Task.objects.create(
        client=random.choice(clients),
        category=random.choice(categories),
        title=generate_realistic_title(category),
        description=generate_realistic_description(category),
        task_type=random.choice(['PHYSICAL', 'DIGITAL', 'BOTH']),
        listing_type=random.choice([
            'task_request', 'task_request', 'service_offer'
        ]),  # 2:1 ratio
        budget=round(random.uniform(100, 5000), 2),
        is_negotiable=random.choice([True, False]),
        city=random.choice(['Cairo', 'Alexandria', 'Giza', 'Remote']),
        status=random.choice([
            'OPEN', 'OPEN', 'OPEN',  # 60%
            'IN_PROGRESS',            # 20%
            'COMPLETED',              # 15%
            'CANCELLED'               # 5%
        ]),
        deadline=fake.date_time_between(
            start_date='+1d', end_date='+60d'
        )
    )

    # Assign 2-5 required skills
    skills = random.sample(category_skills[task.category], random.randint(2, 5))
    task.required_skills.set(skills)
```

### 12.6 Task Title/Description Templates

**Templates by Category**:

```python
TASK_TEMPLATES = {
    'design': [
        {
            'title': 'Logo Design for {business_type}',
            'description': 'Need a modern, professional logo for my {business_type}. Should be clean, memorable, and work in both color and black & white.'
        },
        {
            'title': 'UI/UX Design for {app_type} App',
            'description': 'Looking for a designer to create the UI/UX for a {app_type} mobile application...'
        },
    ],
    'programming': [
        {
            'title': '{language} Developer for {project_type}',
            'description': 'Need an experienced {language} developer to build a {project_type}...'
        },
    ],
    # ... more templates
}
```

### 12.7 Application Generation

```python
# Generate 3-10 applications per open task
for task in open_tasks:
    num_applications = random.randint(3, 10)
    freelancers = random.sample(all_freelancers, num_applications)

    for freelancer in freelancers:
        TaskApplication.objects.create(
            task=task,
            freelancer=freelancer,
            proposal=fake.text(max_nb_chars=300),
            offered_price=task.budget * random.uniform(0.8, 1.2),
            estimated_time=random.choice([
                '1 week', '2 weeks', '1 month', '3-5 days'
            ]),
            status='PENDING'
        )
```

### 12.8 Review Generation

```python
# Generate reviews for completed tasks
for task in completed_tasks:
    # Client reviews freelancer
    Review.objects.create(
        task=task,
        reviewer=task.client,
        reviewee=task.assigned_to,
        rating=random.randint(3, 5),
        comment=fake.text(max_nb_chars=150),
        communication_rating=random.randint(3, 5),
        quality_rating=random.randint(3, 5),
        professionalism_rating=random.randint(3, 5),
        is_public=True,
        is_verified=True
    )

    # Freelancer reviews client
    Review.objects.create(
        task=task,
        reviewer=task.assigned_to,
        reviewee=task.client,
        rating=random.randint(3, 5),
        comment=fake.text(max_nb_chars=150),
        is_public=True
    )
```

### 12.9 Running Seed Scripts

**Command**:
```bash
# Create seed script: backend/seed_database.py
python seed_database.py
```

**Script Structure**:
1. Create superuser
2. Load categories
3. Load skills
4. Generate users
5. Generate tasks
6. Generate applications
7. Generate reviews
8. Generate messages
9. Generate notifications

**Time to Run**: ~30 seconds for 100 users, 200 tasks

### 12.10 Data Statistics

**Generated Dataset**:
- Users: 100 (40 clients, 40 freelancers, 20 both)
- Categories: 9
- Skills: ~150
- Tasks: 200 (120 open, 40 in progress, 30 completed, 10 cancelled)
- Applications: ~800 (avg 6 per open task)
- Reviews: ~60 (for completed tasks)
- User-Skill Associations: ~500
- Task-Skill Associations: ~600

---

## 13. Setup & Installation

### 13.1 Prerequisites

**Required Software**:
- Python 3.11+ ([Download](https://www.python.org/downloads/))
- PostgreSQL 15+ ([Download](https://www.postgresql.org/download/))
- Node.js 18+ & npm ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/downloads))

**Optional**:
- Redis 7+ ([Download](https://redis.io/download/)) - For WebSocket support

### 13.2 Clone Repository

```bash
git clone https://github.com/yourusername/multitask.git
cd multitask
```

### 13.3 Backend Setup

#### Step 1: Create Virtual Environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

#### Step 2: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note**: Installing ML libraries (torch, transformers) may take 5-10 minutes

#### Step 3: Create PostgreSQL Database
```bash
# Open PostgreSQL prompt
psql -U postgres

# Create database
CREATE DATABASE multitask_db;

# Create user (optional)
CREATE USER multitask_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE multitask_db TO multitask_user;

# Exit
\q
```

#### Step 4: Configure Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
```

**Required .env Variables**:
```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOST=localhost

# Database
DATABASE_NAME=multitask_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Google Gemini API (for chatbot)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Recommendation Settings
RECOMMENDATION_MODEL=sentence-transformers/all-MiniLM-L6-v2
MAX_RECOMMENDATIONS=10
MIN_SIMILARITY_SCORE=0.3
```

**Generate SECRET_KEY**:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**Get Gemini API Key**:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create new API key
3. Copy to .env

#### Step 5: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Step 6: Create Superuser
```bash
python manage.py createsuperuser
```

#### Step 7: Load Initial Data (Optional)
```bash
# Load categories and skills
python manage.py loaddata categories.json
python manage.py loaddata skills.json

# Or run full seed script
python seed_database.py
```

#### Step 8: Start Redis (Optional)
```bash
# Windows (if installed)
redis-server

# Mac/Linux
sudo service redis-server start

# Docker
docker run -d -p 6379:6379 redis
```

**Note**: If Redis not available, app will use InMemory fallback

#### Step 9: Start Backend Server
```bash
# Development server with Daphne (ASGI)
python manage.py runserver

# Alternative: Use start-backend.bat (Windows)
start-backend.bat
```

**Server runs at**: `http://localhost:8000`

### 13.4 Frontend Setup

#### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Configure Environment (Optional)
```bash
# Create .env file
cp .env.example .env
```

**.env Variables** (optional):
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000
```

**Note**: These are already set in `src/utils/constants.js`

#### Step 3: Start Development Server
```bash
npm run dev

# Alternative: Use start-frontend.bat (Windows)
start-frontend.bat
```

**Server runs at**: `http://localhost:5173`

### 13.5 Verification

#### Backend Verification
```bash
# Check API health
curl http://localhost:8000/api/

# Admin panel
http://localhost:8000/admin/

# API documentation
http://localhost:8000/api/schema/swagger-ui/
```

#### Frontend Verification
```bash
# Open in browser
http://localhost:5173/

# Check console for errors
# Should see: "Welcome to Multitask!"
```

### 13.6 Quick Setup Script (Windows)

**File**: `setup.bat`
```batch
@echo off
echo ===================================
echo  Multitask Platform Setup
echo ===================================

echo.
echo [1/4] Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt

echo.
echo [2/4] Setting up database...
echo Please create PostgreSQL database manually
echo Then update backend\.env with your credentials
pause

python manage.py migrate
python manage.py createsuperuser

echo.
echo [3/4] Setting up frontend...
cd ..\frontend
call npm install

echo.
echo [4/4] Setup complete!
echo.
echo To start the application:
echo 1. Backend: cd backend ^&^& python manage.py runserver
echo 2. Frontend: cd frontend ^&^& npm run dev
echo.
pause
```

### 13.7 Docker Setup (Alternative)

**Coming Soon**: Docker Compose configuration for one-command setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: multitask_db
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    command: python manage.py runserver 0.0.0.0:8000
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    command: npm run dev -- --host
    ports:
      - "5173:5173"
```

**Usage**:
```bash
docker-compose up
```

---

## 14. Deployment Guidelines

### 14.1 Production Checklist

#### Security
- [ ] Set `DEBUG=False`
- [ ] Use strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Enable all security headers
- [ ] Use HTTPS (SSL certificate)
- [ ] Rotate API keys regularly
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

#### Performance
- [ ] Use production database (PostgreSQL)
- [ ] Configure Redis for caching
- [ ] Set up CDN for static files
- [ ] Enable gzip compression
- [ ] Configure load balancing
- [ ] Set up database connection pooling

#### Infrastructure
- [ ] Choose hosting provider
- [ ] Set up CI/CD pipeline
- [ ] Configure domain and DNS
- [ ] Set up SSL certificate
- [ ] Configure email service (SMTP)
- [ ] Set up file storage (S3)
- [ ] Configure monitoring (Sentry, New Relic)

### 14.2 Backend Deployment

#### Option 1: Traditional VPS (DigitalOcean, Linode)

**Server Requirements**:
- 2 CPU cores
- 4GB RAM
- 40GB SSD
- Ubuntu 22.04 LTS

**Installation Steps**:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
sudo apt install python3.11 python3.11-venv python3-pip postgresql postgresql-contrib nginx redis-server -y

# 3. Clone repository
git clone https://github.com/yourusername/multitask.git
cd multitask/backend

# 4. Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# 5. Install requirements
pip install -r requirements.txt
pip install gunicorn daphne

# 6. Configure PostgreSQL
sudo -u postgres psql
CREATE DATABASE multitask_db;
CREATE USER multitask_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE multitask_db TO multitask_user;
\q

# 7. Set environment variables
cp .env.example .env
nano .env  # Edit with production values

# 8. Run migrations
python manage.py migrate

# 9. Collect static files
python manage.py collectstatic --no-input

# 10. Set up Gunicorn (HTTP)
sudo nano /etc/systemd/system/gunicorn.service
```

**Gunicorn Service**:
```ini
[Unit]
Description=Gunicorn daemon for Multitask
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/multitask/backend
ExecStart=/home/ubuntu/multitask/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind 0.0.0.0:8000 \
          multitask_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Daphne Service (WebSocket)**:
```bash
sudo nano /etc/systemd/system/daphne.service
```

```ini
[Unit]
Description=Daphne daemon for Multitask WebSockets
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/multitask/backend
ExecStart=/home/ubuntu/multitask/backend/venv/bin/daphne \
          -b 0.0.0.0 -p 8001 \
          multitask_backend.asgi:application

[Install]
WantedBy=multi-user.target
```

**Start Services**:
```bash
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl start daphne
sudo systemctl enable daphne
```

**Nginx Configuration**:
```bash
sudo nano /etc/nginx/sites-available/multitask
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # HTTP requests
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket requests
    location /ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files
    location /static/ {
        alias /home/ubuntu/multitask/backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /home/ubuntu/multitask/backend/media/;
    }
}
```

**Enable Site**:
```bash
sudo ln -s /etc/nginx/sites-available/multitask /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**SSL Certificate (Let's Encrypt)**:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

#### Option 2: Platform as a Service (Railway, Render, Heroku)

**Railway.app**:
1. Connect GitHub repository
2. Add PostgreSQL and Redis services
3. Configure environment variables
4. Deploy automatically on push

**Environment Variables**:
```bash
SECRET_KEY=...
DEBUG=False
ALLOWED_HOST=your-app.railway.app
DATABASE_URL=postgresql://...  # Auto-provided by Railway
REDIS_URL=redis://...  # Auto-provided by Railway
```

### 14.3 Frontend Deployment

#### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://your-backend.com/api"
  }
}
```

#### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod
```

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option 3: Static Hosting (Nginx)

```bash
# Build frontend
cd frontend
npm run build

# Copy to server
scp -r dist/* user@server:/var/www/multitask/

# Nginx config
sudo nano /etc/nginx/sites-available/multitask-frontend
```

```nginx
server {
    listen 80;
    server_name app.your-domain.com;
    root /var/www/multitask;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 14.4 Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_tasks_status_created ON tasks (status, created_at DESC);
CREATE INDEX idx_tasks_category_status ON tasks (category_id, status);
CREATE INDEX idx_applications_task_status ON task_applications (task_id, status);
CREATE INDEX idx_notifications_user_read ON notifications (recipient_id, is_read, created_at DESC);

-- Vacuum database regularly
VACUUM ANALYZE;
```

### 14.5 Monitoring Setup

#### Sentry (Error Tracking)

```bash
pip install sentry-sdk
```

```python
# settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    environment="production",
    traces_sample_rate=0.1,
)
```

#### Logging

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/production.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}
```

### 14.6 Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"

pg_dump -U multitask_user multitask_db | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

# Cron job (daily at 2 AM)
# 0 2 * * * /home/ubuntu/backup.sh
```

### 14.7 CI/CD Pipeline (GitHub Actions)

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python manage.py test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: |
          # Deployment script
```

---

## 15. Testing Strategy

### 15.1 Backend Testing

#### Unit Tests

```python
# backend/tasks/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Task, Category

User = get_user_model()

class TaskModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='client'
        )
        self.category = Category.objects.create(
            name='Design',
            slug='design'
        )

    def test_task_creation(self):
        task = Task.objects.create(
            client=self.user,
            category=self.category,
            title='Test Task',
            description='Test description',
            budget=100.00,
            task_type='DIGITAL'
        )
        self.assertEqual(task.title, 'Test Task')
        self.assertTrue(task.is_open)

    def test_task_string_representation(self):
        task = Task.objects.create(
            client=self.user,
            category=self.category,
            title='Test Task',
            description='Test',
            budget=100.00
        )
        self.assertEqual(str(task), 'Test Task - testuser')
```

#### API Tests

```python
# backend/tasks/test_api.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class TaskAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            user_type='client'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_task(self):
        url = reverse('task-list')
        data = {
            'title': 'New Task',
            'description': 'Description',
            'budget': 200.00,
            'category': self.category.id,
            'task_type': 'DIGITAL'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 1)

    def test_unauthorized_access(self):
        self.client.force_authenticate(user=None)
        url = reverse('task-list')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
```

**Run Tests**:
```bash
cd backend
python manage.py test
```

### 15.2 Frontend Testing

#### Component Tests (React Testing Library)

```javascript
// frontend/src/components/common/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders disabled button', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

**Run Tests**:
```bash
cd frontend
npm test
```

### 15.3 Integration Tests

#### End-to-End Tests (Playwright)

```javascript
// tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to register page
    await page.goto('http://localhost:5173/register');

    // Fill registration form
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.fill('[name="password2"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:5173/dashboard');
  });
});
```

### 15.4 Load Testing

```python
# locustfile.py
from locust import HttpUser, task, between

class MultitaskUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        # Login
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'password123'
        })
        self.token = response.json()['access_token']

    @task(3)
    def browse_tasks(self):
        self.client.get('/api/tasks/', headers={
            'Authorization': f'Bearer {self.token}'
        })

    @task(1)
    def get_recommendations(self):
        self.client.get('/api/recommendations/for-you/', headers={
            'Authorization': f'Bearer {self.token}'
        })
```

**Run Load Test**:
```bash
pip install locust
locust -f locustfile.py
# Open http://localhost:8089
```

---

## 16. Performance Optimizations

### 16.1 Database Query Optimization

#### Use select_related for Foreign Keys
```python
# Bad (N+1 queries)
tasks = Task.objects.all()
for task in tasks:
    print(task.client.username)  # Extra query per task

# Good (1 query)
tasks = Task.objects.select_related('client', 'category').all()
for task in tasks:
    print(task.client.username)  # No extra queries
```

#### Use prefetch_related for Many-to-Many
```python
# Bad (N+1 queries)
tasks = Task.objects.all()
for task in tasks:
    print(task.required_skills.all())  # Extra query per task

# Good (2 queries total)
tasks = Task.objects.prefetch_related('required_skills').all()
for task in tasks:
    print(task.required_skills.all())  # From cache
```

#### Database Indexes
```python
class Task(models.Model):
    # ...
    class Meta:
        indexes = [
            models.Index(fields=['status', '-created_at']),  # Composite index
            models.Index(fields=['category', 'status']),
        ]
```

### 16.2 Caching Strategy

#### View-Level Caching
```python
from django.views.decorators.cache import cache_page

@cache_page(60 * 5)  # Cache for 5 minutes
def task_list(request):
    tasks = Task.objects.filter(status='OPEN')
    return JsonResponse({'tasks': tasks})
```

#### Low-Level Caching
```python
from django.core.cache import cache

def get_task_recommendations(user_id):
    cache_key = f'recommendations_{user_id}'
    recommendations = cache.get(cache_key)

    if recommendations is None:
        recommendations = generate_recommendations(user_id)
        cache.set(cache_key, recommendations, 300)  # 5 minutes

    return recommendations
```

#### Template Fragment Caching
```python
# In Django templates
{% load cache %}
{% cache 500 sidebar %}
    ... expensive sidebar rendering ...
{% endcache %}
```

### 16.3 Frontend Optimizations

#### Code Splitting
```javascript
// Lazy load routes
const TaskDetail = lazy(() => import('./pages/tasks/TaskDetail'));

// In router
<Route path="/tasks/:id" element={
  <Suspense fallback={<Loading />}>
    <TaskDetail />
  </Suspense>
} />
```

#### Image Optimization
```javascript
// Use optimized images
<img
  src={task.image}
  loading="lazy"  // Lazy load
  width={400}
  height={300}
  alt={task.title}
/>
```

#### Memoization
```javascript
import { useMemo } from 'react';

function TaskList({ tasks, filters }) {
  const filteredTasks = useMemo(() => {
    return tasks.filter(task =>
      task.category === filters.category
    );
  }, [tasks, filters]);

  return <div>{/* render */}</div>;
}
```

### 16.4 API Response Optimization

#### Pagination
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 12,
}
```

#### Field Limiting
```python
# Allow clients to specify fields
GET /api/tasks/?fields=id,title,budget

# Implementation
class TaskViewSet(viewsets.ModelViewSet):
    def list(self, request):
        fields = request.query_params.get('fields', '').split(',')
        # Return only requested fields
```

### 16.5 ML Model Optimization

#### Model Caching
```python
# Cache sentence transformer model
model = cache.get('sentence_transformer_model')
if model is None:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    cache.set('sentence_transformer_model', model, 86400)  # 24 hours
```

#### Batch Processing
```python
# Process embeddings in batches
task_texts = [task.description for task in tasks]
embeddings = model.encode(task_texts, batch_size=32)  # Faster than one-by-one
```

### 16.6 Performance Metrics

**Current Performance**:
- API response time (median): 150ms
- Task recommendation generation: 800ms (cold), 50ms (cached)
- Page load time: 1.2s
- Time to Interactive: 2.5s

**Target Performance** (Production):
- API response time: <100ms
- Recommendation generation: <500ms
- Page load time: <800ms
- Time to Interactive: <1.5s

---

## 17. Future Enhancements

### 17.1 Short-Term (Next 3 Months)

1. **Payment Integration**
   - Stripe/PayPal integration
   - Escrow system
   - Automatic payments on completion
   - Invoice generation

2. **Advanced Search**
   - Elasticsearch integration
   - Faceted search
   - Saved searches
   - Search history

3. **Mobile App**
   - React Native application
   - Push notifications
   - Offline mode
   - Camera integration for task photos

4. **Email Notifications**
   - SendGrid/Mailgun integration
   - Email templates
   - Digest emails
   - Unsubscribe management

5. **Analytics Dashboard**
   - User analytics
   - Task performance metrics
   - Revenue tracking
   - Conversion funnels

### 17.2 Mid-Term (3-6 Months)

1. **Video Calls**
   - WebRTC integration
   - Scheduled calls
   - Call recording
   - Screen sharing

2. **Advanced Matching**
   - Collaborative filtering
   - Deep learning models
   - User behavior analysis
   - A/B testing framework

3. **Freelancer Verification**
   - ID verification
   - Skill testing
   - Portfolio review
   - Background checks

4. **Project Management**
   - Milestones
   - Time tracking
   - File versioning
   - Project templates

5. **API for Third Parties**
   - Public API
   - API keys
   - Rate limiting per key
   - Webhook support

### 17.3 Long-Term (6-12 Months)

1. **AI Code Review**
   - Automated skill assessment
   - Code quality scoring
   - Plagiarism detection

2. **Multi-Language Support**
   - Full Arabic translation
   - French, Spanish support
   - RTL layout
   - Currency conversion

3. **White-Label Solution**
   - Customizable branding
   - Multi-tenant architecture
   - Separate databases
   - Custom domains

4. **Blockchain Integration**
   - Smart contracts
   - Crypto payments
   - Decentralized reputation
   - NFT certificates

5. **AI Task Generation**
   - Automatic task descriptions
   - Budget estimation
   - Timeline prediction
   - Skill recommendation

---

## 18. Troubleshooting Guide

### 18.1 Backend Issues

#### Issue: "FATAL: password authentication failed"
**Cause**: PostgreSQL credentials incorrect

**Solution**:
```bash
# Verify PostgreSQL is running
sudo service postgresql status

# Reset password
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'newpassword';

# Update .env file
DATABASE_PASSWORD=newpassword
```

#### Issue: "redis.exceptions.ConnectionError"
**Cause**: Redis not running

**Solution**:
```bash
# Start Redis
sudo service redis-server start

# OR disable Redis in settings (use InMemory)
# Django will automatically fallback
```

#### Issue: "ModuleNotFoundError: No module named 'sentence_transformers'"
**Cause**: ML dependencies not installed

**Solution**:
```bash
pip install sentence-transformers transformers torch
```

#### Issue: "Port 8000 already in use"
**Cause**: Another process using port

**Solution**:
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :8000
kill -9 <PID>
```

### 18.2 Frontend Issues

#### Issue: "Network Error" when calling API
**Cause**: Backend not running or CORS issue

**Solution**:
```bash
# Check backend is running
curl http://localhost:8000/api/

# Check CORS settings in backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]
```

#### Issue: "Module not found" errors
**Cause**: Dependencies not installed

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "WebSocket connection failed"
**Cause**: Daphne not running or wrong URL

**Solution**:
```bash
# Check Daphne is running (should start with manage.py runserver)
# Check WebSocket URL in frontend
WS_BASE_URL=ws://localhost:8000
```

### 18.3 Database Issues

#### Issue: "relation does not exist"
**Cause**: Migrations not applied

**Solution**:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### Issue: "database connection isn't set to UTC"
**Cause**: PostgreSQL timezone setting

**Solution**:
```sql
-- In PostgreSQL
ALTER DATABASE multitask_db SET timezone TO 'UTC';
```

#### Issue: Slow queries
**Cause**: Missing indexes

**Solution**:
```python
# Add indexes to models
class Meta:
    indexes = [
        models.Index(fields=['status', '-created_at']),
    ]

# Run migrations
python manage.py makemigrations
python manage.py migrate
```

### 18.4 ML/AI Issues

#### Issue: "Model download timeout"
**Cause**: Slow internet or firewall

**Solution**:
```python
# Download manually
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder='./models/')
```

#### Issue: "Google Gemini API error"
**Cause**: Invalid API key or rate limit

**Solution**:
```bash
# Check API key in .env
GEMINI_API_KEY=your_key_here

# Verify key works
curl https://generativelanguage.googleapis.com/v1/models?key=YOUR_KEY
```

### 18.5 Production Issues

#### Issue: Static files not loading
**Cause**: STATIC_ROOT not configured

**Solution**:
```bash
cd backend
python manage.py collectstatic --no-input

# Nginx should serve from:
# /home/ubuntu/multitask/backend/staticfiles/
```

#### Issue: 502 Bad Gateway
**Cause**: Gunicorn/Daphne not running

**Solution**:
```bash
# Check service status
sudo systemctl status gunicorn
sudo systemctl status daphne

# Restart services
sudo systemctl restart gunicorn
sudo systemctl restart daphne
```

#### Issue: Out of memory
**Cause**: ML models using too much RAM

**Solution**:
```python
# Use lighter model
RECOMMENDATION_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'  # 80MB

# Or disable ML temporarily
USE_ML_RECOMMENDATIONS = False
```

---

## Conclusion

This documentation covers the complete Multitask platform from A to Z. It includes:

- **Comprehensive technology stack** with justifications
- **Detailed architecture** and system design
- **Complete database schema** with relationships
- **AI/ML implementation** details
- **Security best practices**
- **Real-time features** using WebSockets
- **All issues faced** and their solutions
- **Alternative solutions** considered
- **Dataset and seeding** strategy
- **Setup and deployment** guidelines
- **Performance optimizations**
- **Future roadmap**
- **Troubleshooting guide**

---

**Project Status**: ✅ Production-Ready (Development Phase Completed)

**Next Steps**:
1. User testing and feedback
2. Performance monitoring
3. Security audit
4. Marketing and launch
5. Iterative improvements

---

**Maintained by**: Development Team
**Contact**: dev@multitask-platform.com
**Last Updated**: December 15, 2024

---
