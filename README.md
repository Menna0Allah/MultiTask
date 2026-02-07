# MultiTask

A full-stack task marketplace platform connecting clients with freelancers.

## Overview

MultiTask is a comprehensive platform where:
- **Clients** post tasks and hire freelancers
- **Freelancers** browse tasks and apply for work
- **Both** users can do everything

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Django 5, Django REST Framework |
| Database | PostgreSQL |
| Auth | JWT (SimpleJWT), Google OAuth |
| Payments | Stripe Connect |
| Real-time | Django Channels (WebSocket) |
| AI | Google Gemini API |

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis (optional, for WebSocket)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env  # Configure environment variables
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Configure environment variables
npm run dev
```

## User Types

| Type | Can Post Tasks | Can Apply to Tasks |
|------|---------------|-------------------|
| Client | Yes | No |
| Freelancer | No | Yes |
| Both | Yes | Yes |

## Features

### For Clients
- Post and manage tasks
- Browse freelancer directory
- View freelancer list in Recommendations (same data source as /freelancers)
- Review applications
- Hire freelancers
- Secure escrow payments
- Rate completed work

### For Freelancers
- Browse available tasks
- AI-powered task recommendations
- Apply with proposals
- Receive payments via Stripe
- Withdraw to bank account
- Build portfolio

### General
- Real-time messaging
- Push notifications
- AI chatbot assistant
- Dark mode support
- Mobile responsive

## Recent Changes (February 7, 2026)

- `/recommendations` now shows the same freelancer list as `/freelancers` for client users.
- For You stats reflect the active tab (tasks vs freelancers) and role.
- Freelancer skills rendering handles both array and comma-separated string formats.
- Freelancer Directory search input has improved light-mode visibility while preserving dark-mode styling.

## Documentation

| Document | Description |
|----------|-------------|
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Full platform documentation |
| [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) | API endpoints reference |
| [frontend/DESIGN_SYSTEM.md](./frontend/DESIGN_SYSTEM.md) | UI/UX design guidelines |

## Project Structure

```
MultiTask/
├── backend/                 # Django backend
│   ├── accounts/           # User management
│   ├── tasks/              # Task management
│   ├── messaging/          # Real-time chat
│   ├── notifications/      # Notifications
│   ├── payments/           # Stripe integration
│   ├── recommendations/    # AI recommendations
│   ├── chatbot/            # AI chatbot
│   └── multitask_backend/  # Django settings
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utilities
│   └── public/
│
└── DOCUMENTATION.md        # Main documentation
```

## API Base URLs

- **API:** `http://localhost:8000/api`
- **WebSocket:** `ws://localhost:8000/ws`
- **Frontend:** `http://localhost:5173`

## Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:pass@localhost:5432/multitask
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
GOOGLE_GEMINI_API_KEY=xxx
```

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000/ws
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_GOOGLE_CLIENT_ID=xxx
```

## License

Private - All rights reserved

---

*Built with Django + React*
