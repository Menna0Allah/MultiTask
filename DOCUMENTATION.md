# MultiTask Platform Documentation

A comprehensive task marketplace platform connecting clients with freelancers, built with Django REST Framework (Backend) and React + Vite (Frontend).

---

## Table of Contents

1. [Overview](#overview)
2. [User Types & Permissions](#user-types--permissions)
3. [Frontend Routes](#frontend-routes)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Features by User Type](#features-by-user-type)
6. [Authentication](#authentication)
7. [Payment System](#payment-system)
8. [Real-time Features](#real-time-features)
9. [Recommendations System](#recommendations-system)

---

## Overview

MultiTask is a task marketplace platform where:
- **Clients** can post tasks and hire freelancers
- **Freelancers** can browse tasks and apply to work on them
- **Both** users can do everything (post tasks AND apply to tasks)

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Django 5, Django REST Framework |
| Database | PostgreSQL |
| Authentication | JWT (SimpleJWT) |
| Payments | Stripe Connect |
| Real-time | Django Channels (WebSocket) |
| AI | Google Gemini API (Chatbot) |

---

## User Types & Permissions

### User Types

| Type | Description | `is_client` | `is_freelancer` |
|------|-------------|-------------|-----------------|
| `client` | Can only post tasks and hire | `true` | `false` |
| `freelancer` | Can only apply to tasks | `false` | `true` |
| `both` | Can post tasks AND apply | `true` | `true` |

### Feature Access by User Type

| Feature | Client | Freelancer | Both |
|---------|--------|------------|------|
| Browse Tasks | Yes | Yes | Yes |
| View Task Details | Yes | Yes | Yes |
| Post Task | Yes | No | Yes |
| Apply to Task | No | Yes | Yes |
| Freelancer Directory | Yes | No | Yes |
| For You (Task Recommendations) | No | Yes | Yes |
| Wallet & Payments | Yes | Yes | Yes |
| Messages | Yes | Yes | Yes |
| Notifications | Yes | Yes | Yes |

### Navigation Visibility

| Nav Item | Visible To |
|----------|------------|
| Categories | Everyone |
| Browse Tasks | Everyone |
| Freelancers | Client + Both (authenticated) |
| For You | Freelancer + Both (authenticated) |
| Post Task | Client + Both (authenticated) |
| How it Works | Everyone |

---

## Frontend Routes

### Public Routes (No Login Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page |
| `/login` | Login | User login (redirects to /dashboard if authenticated) |
| `/register` | Register | User registration |
| `/forgot-password` | ForgotPassword | Request password reset |
| `/reset-password` | ResetPassword | Reset password with token |
| `/verify-email` | VerifyEmail | Email verification |
| `/categories` | Categories | Browse task categories |
| `/how-it-works` | HowItWorks | Platform guide |
| `/privacy` | PrivacyPolicy | Privacy policy |
| `/terms` | TermsOfService | Terms of service |
| `/contact` | ContactUs | Contact form |
| `/faq` | FAQ | Frequently asked questions |
| `/about` | AboutUs | About the platform |
| `/tasks` | TaskList | Browse all open tasks |
| `/tasks/:id` | TaskDetail | View task details |
| `/users/:username` | UserProfile | Public user profile |

### Protected Routes (Login Required)

| Route | Component | User Type | Description |
|-------|-----------|-----------|-------------|
| `/dashboard` | Dashboard | All | User dashboard with stats |
| `/tasks/create` | TaskCreate | Client/Both | Create new task |
| `/tasks/:id/edit` | TaskEdit | Task Owner | Edit task |
| `/my-tasks` | MyTasks | All | User's tasks & applications |
| `/saved-tasks` | SavedTasks | All | Bookmarked tasks |
| `/profile` | Profile | All | Profile settings & preferences |
| `/messages` | Messages | All | Messaging inbox |
| `/notifications` | Notifications | All | Notifications center |
| `/recommendations` | ForYou | Freelancer/Both | Task recommendations |
| `/freelancers` | FreelancerDirectory | Client/Both | Browse freelancers |
| `/wallet` | Wallet | All | Payment wallet |
| `/transactions` | Transactions | All | Transaction history |
| `/payments/onboarding` | StripeOnboarding | Freelancer/Both | Stripe account setup |

### Error Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/500` | ServerError | Server error page |
| `/maintenance` | Maintenance | Maintenance mode |
| `/*` | NotFound | 404 page |

---

## Backend API Endpoints

**Base URL:** `http://localhost:8000/api`

### Authentication (`/api/auth/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register/` | Register new user | No |
| POST | `/auth/login/` | User login | No |
| POST | `/auth/logout/` | User logout | Yes |
| POST | `/auth/token/` | Get JWT token | No |
| POST | `/auth/token/refresh/` | Refresh JWT token | No |
| GET | `/auth/profile/` | Get user profile | Yes |
| PUT/PATCH | `/auth/profile/` | Update profile | Yes |
| POST | `/auth/profile/change-password/` | Change password | Yes |
| GET | `/auth/users/` | List users | No |
| GET | `/auth/users/<username>/` | Get user by username | No |
| GET | `/auth/check-username/` | Check username availability | No |
| GET | `/auth/check-email/` | Check email availability | No |
| POST | `/auth/resend-verification/` | Resend verification email | No |
| POST | `/auth/verify-email/` | Verify email | No |
| POST | `/auth/password-reset/` | Request password reset | No |
| POST | `/auth/password-reset/confirm/` | Confirm password reset | No |
| DELETE | `/auth/delete-account/` | Delete account | Yes |
| POST | `/auth/google/login/` | Google OAuth login | No |
| GET | `/auth/portfolio/` | List user portfolio | Yes |
| POST | `/auth/portfolio/` | Create portfolio item | Yes |
| GET/PUT/DELETE | `/auth/portfolio/<id>/` | Portfolio item CRUD | Yes |
| GET | `/auth/users/<username>/portfolio/` | Get user's portfolio | No |

### Tasks (`/api/tasks/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/tasks/categories/` | List categories | No |
| GET | `/tasks/` | List all tasks | No |
| POST | `/tasks/create/` | Create task | Yes (Client) |
| GET | `/tasks/my-tasks/` | Get user's tasks | Yes |
| GET | `/tasks/<id>/` | Get task detail | No |
| PUT/PATCH | `/tasks/<id>/update/` | Update task | Yes (Owner) |
| DELETE | `/tasks/<id>/delete/` | Delete task | Yes (Owner) |
| POST | `/tasks/<id>/complete/` | Mark complete | Yes (Owner) |
| POST | `/tasks/<id>/cancel/` | Cancel task | Yes (Owner) |
| POST | `/tasks/<id>/apply/` | Apply to task | Yes (Freelancer) |
| GET | `/tasks/<id>/applications/` | List applications | Yes (Owner) |
| GET | `/tasks/my-applications/` | Get user's applications | Yes |
| POST | `/tasks/applications/<id>/accept/` | Accept application | Yes (Owner) |
| POST | `/tasks/applications/<id>/reject/` | Reject application | Yes (Owner) |
| POST | `/tasks/<id>/review/` | Create review | Yes |
| GET | `/tasks/<id>/reviews/` | Get task reviews | No |
| GET | `/tasks/users/<username>/reviews/` | Get user reviews | No |
| GET | `/tasks/statistics/` | Task statistics | No |
| GET | `/tasks/my-statistics/` | User's statistics | Yes |
| GET | `/tasks/saved/` | List saved tasks | Yes |
| POST | `/tasks/<id>/save/` | Toggle save task | Yes |
| GET | `/tasks/<id>/saved/` | Check if saved | Yes |
| DELETE | `/tasks/saved/<id>/` | Unsave task | Yes |

### Messaging (`/api/messaging/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/messaging/conversations/` | List conversations | Yes |
| POST | `/messaging/conversations/create/` | Create conversation | Yes |
| GET | `/messaging/conversations/<id>/` | Get conversation | Yes |
| POST | `/messaging/conversations/<id>/mark-read/` | Mark as read | Yes |
| GET | `/messaging/conversations/<id>/messages/` | List messages | Yes |
| POST | `/messaging/conversations/<id>/messages/send/` | Send message | Yes |
| GET | `/messaging/statistics/` | Messaging stats | Yes |

### Notifications (`/api/notifications/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notifications/` | List notifications | Yes |
| GET | `/notifications/unread-count/` | Get unread count | Yes |
| POST | `/notifications/<id>/read/` | Mark as read | Yes |
| DELETE | `/notifications/<id>/delete/` | Delete notification | Yes |
| POST | `/notifications/mark-all-read/` | Mark all as read | Yes |
| DELETE | `/notifications/clear-all/` | Clear all read | Yes |
| GET/PUT | `/notifications/preferences/` | Notification preferences | Yes |

### Payments (`/api/payments/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/connect/create/` | Create Stripe Connect | Yes |
| POST | `/payments/connect/onboarding/` | Get onboarding link | Yes |
| GET | `/payments/connect/status/` | Get account status | Yes |
| POST | `/payments/intents/create/` | Create payment intent | Yes |
| GET | `/payments/escrow/<id>/` | Get escrow details | Yes |
| POST | `/payments/escrow/<id>/release/` | Release escrow | Yes |
| POST | `/payments/escrow/<id>/refund/` | Refund escrow | Yes |
| GET | `/payments/wallet/` | Get wallet info | Yes |
| GET | `/payments/wallet/transactions/` | List transactions | Yes |
| GET | `/payments/withdrawals/` | List withdrawals | Yes |
| POST | `/payments/withdrawals/create/` | Create withdrawal | Yes |
| GET | `/payments/payment-methods/` | List payment methods | Yes |
| POST | `/payments/payment-methods/create/` | Add payment method | Yes |
| DELETE | `/payments/payment-methods/<id>/delete/` | Delete payment method | Yes |
| POST | `/payments/payment-methods/<id>/set-default/` | Set default | Yes |
| POST | `/payments/webhooks/stripe/` | Stripe webhook | No |

### Recommendations (`/api/recommendations/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/recommendations/tasks/` | Recommended tasks | Yes (Freelancer) |
| GET | `/recommendations/service-offerings/` | Service offerings | Yes |
| GET | `/recommendations/freelancers/` | Discover freelancers | Yes (Client) |
| GET | `/recommendations/freelancers/<task_id>/` | Recommended for task | Yes (Client) |
| GET/PUT | `/recommendations/preferences/` | User preferences | Yes |
| POST | `/recommendations/onboarding/` | Complete onboarding | Yes |
| GET | `/recommendations/onboarding/status/` | Onboarding status | Yes |
| GET | `/recommendations/skills/` | Get all skills | No |
| GET | `/recommendations/skills/my/` | Get user's skills | Yes |
| POST | `/recommendations/skills/update/` | Update user skills | Yes |
| GET | `/recommendations/categories/` | Get categories | No |

### Chatbot (`/api/chatbot/`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/chatbot/sessions/` | List chat sessions | Yes |
| GET | `/chatbot/sessions/<id>/` | Get session detail | Yes |
| POST | `/chatbot/sessions/<id>/end/` | End session | Yes |
| POST | `/chatbot/chat/` | Send chat message | Yes |
| POST | `/chatbot/sessions/<id>/extract-task/` | Extract task info | Yes |
| POST | `/chatbot/suggest-category/` | Suggest category | Yes |
| POST | `/chatbot/messages/<id>/rate/` | Rate message | Yes |
| GET | `/chatbot/status/` | Chatbot status | No |
| GET | `/chatbot/statistics/` | Chatbot statistics | Yes |

---

## Features by User Type

### Client Features
- Post and manage tasks
- View and accept/reject applications
- Browse and hire freelancers
- Pay freelancers through escrow system
- Rate and review completed work
- Message freelancers

### Freelancer Features
- Browse and apply to tasks
- Receive task recommendations ("For You")
- Manage applications
- Receive payments through Stripe Connect
- Withdraw earnings to bank account
- Build portfolio
- Get rated and reviewed

### Both User Features
- All client features
- All freelancer features
- Switch between posting tasks and applying

---

## Authentication

### JWT Authentication
- Access token expires in 60 minutes
- Refresh token expires in 7 days
- Tokens stored in localStorage

### Login Methods
1. **Email/Username + Password**
2. **Google OAuth** (Social login)

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one number

---

## Payment System

### Stripe Integration
- **Stripe Connect** for freelancer payouts
- **Escrow system** for secure payments

### Payment Flow
1. Client accepts freelancer application
2. Client pays into escrow
3. Freelancer completes task
4. Client marks task complete
5. Payment released to freelancer
6. Freelancer can withdraw to bank

### Fees
- Platform fee: 15% of task amount
- Freelancer receives: 85% of task amount

---

## Real-time Features

### WebSocket Endpoints
| URL | Description |
|-----|-------------|
| `ws://localhost:8000/ws/chat/<conversation_id>/` | Real-time messaging |
| `ws://localhost:8000/ws/notifications/` | Real-time notifications |

### Real-time Updates
- New message notifications
- Task status changes
- Application updates
- Payment notifications

---

## Recommendations System

### For Freelancers (Task Recommendations)
Located at `/recommendations` (For You page)
- AI-powered task matching based on:
  - User skills
  - Past completed tasks
  - Location preferences
  - Category preferences

### For Clients (Freelancer Discovery)
Located at `/freelancers` (Freelancer Directory)
- Filter freelancers by:
  - Skills
  - Location
  - Rating
  - Verification status

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000/ws
VITE_APP_NAME=Multitask
VITE_MEDIA_URL=http://127.0.0.1:8000/media
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Backend (`.env`)
```env
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=postgres://user:pass@localhost:5432/multitask
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
GOOGLE_GEMINI_API_KEY=your_gemini_key
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your_email
EMAIL_HOST_PASSWORD=your_app_password
```

---

## Running the Project

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Database Statistics

| Model | Count |
|-------|-------|
| Users (Client) | 161 |
| Users (Freelancer) | 275 |
| Users (Both) | 120 |
| **Total Users** | **556** |

---

*Last Updated: January 2026*
