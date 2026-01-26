# MultiTask Backend API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### Register User
```http
POST /api/auth/register/
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "password2": "string",
  "first_name": "string",
  "last_name": "string",
  "user_type": "client|freelancer|both",
  "phone_number": "string",
  "city": "string",
  "country": "string"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "username": "string",
    "email": "string",
    "user_type": "string"
  },
  "access": "jwt_token",
  "refresh": "refresh_token"
}
```

### Login
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
  "username_or_email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "user": {...},
  "access": "jwt_token",
  "refresh": "refresh_token"
}
```

### Refresh Token
```http
POST /api/auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "refresh_token"
}
```

### Get Profile
```http
GET /api/auth/profile/
```
**Auth Required:** Yes

### Update Profile
```http
PATCH /api/auth/profile/
```
**Auth Required:** Yes

### Change Password
```http
POST /api/auth/profile/change-password/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "old_password": "string",
  "new_password": "string"
}
```

### Check Username Availability
```http
GET /api/auth/check-username/?username=<username>
```

### Check Email Availability
```http
GET /api/auth/check-email/?email=<email>
```

### List Users
```http
GET /api/auth/users/
```

**Query Parameters:**
- `user_type` - Filter by type (client, freelancer, both)
- `search` - Search by name/username
- `city` - Filter by city

### Get User by Username
```http
GET /api/auth/users/<username>/
```

### Delete Account
```http
DELETE /api/auth/delete-account/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "password": "string"
}
```

---

## Task Endpoints

### List Tasks
```http
GET /api/tasks/
```

**Query Parameters:**
- `status` - OPEN, IN_PROGRESS, COMPLETED, CANCELLED
- `category` - Category ID
- `search` - Search in title/description
- `city` - Filter by city
- `min_budget` / `max_budget` - Budget range
- `ordering` - created_at, -created_at, budget, -budget

### Create Task
```http
POST /api/tasks/create/
```
**Auth Required:** Yes (Client only)

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "category": 1,
  "budget": 100.00,
  "deadline": "2024-12-31",
  "city": "string",
  "address": "string",
  "task_type": "physical|digital"
}
```

### Get Task Detail
```http
GET /api/tasks/<id>/
```

### Update Task
```http
PATCH /api/tasks/<id>/update/
```
**Auth Required:** Yes (Owner only)

### Delete Task
```http
DELETE /api/tasks/<id>/delete/
```
**Auth Required:** Yes (Owner only)

### Apply to Task
```http
POST /api/tasks/<id>/apply/
```
**Auth Required:** Yes (Freelancer only)

**Request Body:**
```json
{
  "proposal": "string",
  "offered_price": 100.00,
  "estimated_duration": "2 days"
}
```

### List Task Applications
```http
GET /api/tasks/<id>/applications/
```
**Auth Required:** Yes (Task owner only)

### Accept Application
```http
POST /api/tasks/applications/<id>/accept/
```
**Auth Required:** Yes (Task owner only)

### Reject Application
```http
POST /api/tasks/applications/<id>/reject/
```
**Auth Required:** Yes (Task owner only)

### Complete Task
```http
POST /api/tasks/<id>/complete/
```
**Auth Required:** Yes (Task owner only)

### Cancel Task
```http
POST /api/tasks/<id>/cancel/
```
**Auth Required:** Yes (Task owner only)

### Get My Tasks
```http
GET /api/tasks/my-tasks/
```
**Auth Required:** Yes

### Get My Applications
```http
GET /api/tasks/my-applications/
```
**Auth Required:** Yes

### Save/Unsave Task
```http
POST /api/tasks/<id>/save/
```
**Auth Required:** Yes

### Get Saved Tasks
```http
GET /api/tasks/saved/
```
**Auth Required:** Yes

### Check if Task is Saved
```http
GET /api/tasks/<id>/saved/
```
**Auth Required:** Yes

### Create Review
```http
POST /api/tasks/<id>/review/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "rating": 5,
  "comment": "string"
}
```

### Get Task Statistics
```http
GET /api/tasks/statistics/
```

### Get My Statistics
```http
GET /api/tasks/my-statistics/
```
**Auth Required:** Yes

---

## Messaging Endpoints

### List Conversations
```http
GET /api/messaging/conversations/
```
**Auth Required:** Yes

### Create Conversation
```http
POST /api/messaging/conversations/create/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "participant_id": 1,
  "task_id": 1
}
```

### Get Conversation Messages
```http
GET /api/messaging/conversations/<id>/messages/
```
**Auth Required:** Yes

### Send Message
```http
POST /api/messaging/conversations/<id>/messages/send/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "content": "string"
}
```

### Mark Conversation as Read
```http
POST /api/messaging/conversations/<id>/mark-read/
```
**Auth Required:** Yes

---

## Notification Endpoints

### List Notifications
```http
GET /api/notifications/
```
**Auth Required:** Yes

**Query Parameters:**
- `is_read` - true/false
- `type` - notification type

### Get Unread Count
```http
GET /api/notifications/unread-count/
```
**Auth Required:** Yes

### Mark as Read
```http
POST /api/notifications/<id>/read/
```
**Auth Required:** Yes

### Mark All as Read
```http
POST /api/notifications/mark-all-read/
```
**Auth Required:** Yes

### Delete Notification
```http
DELETE /api/notifications/<id>/delete/
```
**Auth Required:** Yes

### Clear All Read Notifications
```http
DELETE /api/notifications/clear-all/
```
**Auth Required:** Yes

### Get/Update Preferences
```http
GET /api/notifications/preferences/
PUT /api/notifications/preferences/
```
**Auth Required:** Yes

---

## Payment Endpoints

### Create Stripe Connect Account
```http
POST /api/payments/connect/create/
```
**Auth Required:** Yes

### Get Onboarding Link
```http
POST /api/payments/connect/onboarding/
```
**Auth Required:** Yes

### Get Connect Account Status
```http
GET /api/payments/connect/status/
```
**Auth Required:** Yes

### Create Payment Intent
```http
POST /api/payments/intents/create/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "application_id": 1
}
```

### Get Wallet
```http
GET /api/payments/wallet/
```
**Auth Required:** Yes

**Response:**
```json
{
  "available_balance": "100.00",
  "escrowed_balance": "50.00",
  "pending_balance": "0.00",
  "lifetime_earnings": "500.00",
  "lifetime_spent": "200.00"
}
```

### Get Transactions
```http
GET /api/payments/wallet/transactions/
```
**Auth Required:** Yes

### Create Withdrawal
```http
POST /api/payments/withdrawals/create/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "amount": 50.00
}
```

### Get Escrow Detail
```http
GET /api/payments/escrow/<escrow_id>/
```
**Auth Required:** Yes

### Release Escrow
```http
POST /api/payments/escrow/<escrow_id>/release/
```
**Auth Required:** Yes (Task owner only)

### Refund Escrow
```http
POST /api/payments/escrow/<escrow_id>/refund/
```
**Auth Required:** Yes

---

## Recommendation Endpoints

### Get Recommended Tasks (For Freelancers)
```http
GET /api/recommendations/tasks/
```
**Auth Required:** Yes (Freelancer only)

### Discover Freelancers (For Clients)
```http
GET /api/recommendations/freelancers/
```
**Auth Required:** Yes (Client only)

### Get Recommended Freelancers for Task
```http
GET /api/recommendations/freelancers/<task_id>/
```
**Auth Required:** Yes (Task owner only)

### Get User Preferences
```http
GET /api/recommendations/preferences/
PUT /api/recommendations/preferences/
```
**Auth Required:** Yes

### Get Skills
```http
GET /api/recommendations/skills/
```

### Get User Skills
```http
GET /api/recommendations/skills/my/
```
**Auth Required:** Yes

### Update User Skills
```http
POST /api/recommendations/skills/update/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "skills": [1, 2, 3]
}
```

---

## Chatbot Endpoints

### Send Message to Chatbot
```http
POST /api/chatbot/chat/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "message": "string",
  "session_id": 1
}
```

### List Chat Sessions
```http
GET /api/chatbot/sessions/
```
**Auth Required:** Yes

### Get Session Detail
```http
GET /api/chatbot/sessions/<id>/
```
**Auth Required:** Yes

### Extract Task from Chat
```http
POST /api/chatbot/sessions/<id>/extract-task/
```
**Auth Required:** Yes

### Suggest Category
```http
POST /api/chatbot/suggest-category/
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "description": "string"
}
```

---

## WebSocket Endpoints

### Real-time Messaging
```
ws://localhost:8000/ws/chat/<conversation_id>/?token=<jwt_token>
```

**Message Format (Send):**
```json
{
  "type": "chat_message",
  "message": "string"
}
```

**Message Format (Receive):**
```json
{
  "type": "chat_message",
  "message": {
    "id": 1,
    "content": "string",
    "sender": {...},
    "created_at": "timestamp"
  }
}
```

### Real-time Notifications
```
ws://localhost:8000/ws/notifications/?token=<jwt_token>
```

**Message Format (Receive):**
```json
{
  "type": "new_notification",
  "notification": {
    "id": 1,
    "title": "string",
    "message": "string",
    "notification_type": "string",
    "is_read": false,
    "created_at": "timestamp"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Server Error
```json
{
  "detail": "Internal server error."
}
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "count": 100,
  "next": "http://api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

---

*Last Updated: January 2026*
