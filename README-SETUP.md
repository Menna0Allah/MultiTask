# 🚀 MultiTask - Setup & Development Guide

AI-powered freelance marketplace platform with real-time messaging and intelligent recommendations.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.14** ([Download](https://www.python.org/downloads/))
- **Node.js 24.x** ([Download](https://nodejs.org/))
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/)) - for Redis
- **Git** ([Download](https://git-scm.com/downloads))

---

## ⚡ Quick Start (Windows)

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd MultiTask

# Run automated setup script
setup.bat

# Create superuser account
cd backend
venv\Scripts\activate
python manage.py createsuperuser

# Start the application (2 terminals)
# Terminal 1:
start-backend.bat

# Terminal 2:
start-frontend.bat
```

Visit **http://localhost:5173** in your browser!

---

### Option 2: Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database and user
psql -U postgres

CREATE DATABASE multitask_db;
CREATE USER multitask_db_user WITH PASSWORD 'your-secure-password';
ALTER ROLE multitask_db_user SET client_encoding TO 'utf8';
ALTER ROLE multitask_db_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE multitask_db_user SET timezone TO 'Africa/Cairo';
GRANT ALL PRIVILEGES ON DATABASE multitask_db TO multitask_db_user;
\q
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env
# Edit .env and add your credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files (optional)
python manage.py collectstatic --noinput
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
# Ensure VITE_API_URL points to backend
```

#### 4. Redis Setup (Docker)

```bash
# Start Redis container
docker run -d --name multitask-redis -p 6379:6379 redis:alpine

# Verify it's running
docker ps
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access Points:**
- Frontend: http://localhost:5173
- Backend API: http://127.0.0.1:8000/api/
- Django Admin: http://127.0.0.1:8000/admin/
- API Docs (Swagger): http://127.0.0.1:8000/api/docs/

---

## 🔧 Configuration

### Backend Environment Variables (.env)

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database
DATABASE_NAME=multitask_db
DATABASE_USER=multitask_db_user
DATABASE_PASSWORD=your-db-password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Google Gemini AI (Get key at https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# Google OAuth (Get at https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables (.env)

```bash
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WS_URL=ws://127.0.0.1:8000/ws
VITE_MEDIA_URL=http://127.0.0.1:8000/media
VITE_APP_NAME=Multitask
VITE_GOOGLE_CLIENT_ID=your-client-id
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
venv\Scripts\activate
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Linting
```bash
# Frontend
cd frontend
npm run lint
```

---

## 📦 Project Structure

```
MultiTask/
├── backend/                    # Django REST API
│   ├── accounts/              # User authentication & profiles
│   ├── tasks/                 # Task management
│   ├── messaging/             # Real-time chat
│   ├── chatbot/               # AI chatbot
│   ├── recommendations/       # ML recommendations
│   ├── multitask_backend/     # Django settings
│   ├── media/                 # Uploaded files
│   ├── logs/                  # Application logs
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context
│   │   ├── services/         # API services
│   │   ├── hooks/            # Custom hooks
│   │   └── routes/           # Route configuration
│   ├── public/               # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── start-backend.bat          # Backend startup script
├── start-frontend.bat         # Frontend startup script
├── setup.bat                  # Automated setup script
├── SECURITY-WARNINGS.md       # Security documentation
└── README-SETUP.md            # This file
```

---

## 🔑 Key Features

- **User Authentication:** JWT + Google OAuth2
- **Task Marketplace:** Post tasks, receive applications, assign freelancers
- **Real-time Messaging:** WebSocket-powered chat with read receipts
- **AI Chatbot:** Google Gemini integration for task assistance
- **Smart Recommendations:** Hybrid ML algorithm (TF-IDF + semantic similarity)
- **Reviews & Ratings:** Multi-tier rating system
- **API Documentation:** Auto-generated Swagger/OpenAPI docs

---

## 🐛 Troubleshooting

### "No module named 'django'"
```bash
# Ensure virtual environment is activated
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### "Redis connection failed"
```bash
# Check if Redis container is running
docker ps

# Start Redis if not running
docker run -d --name multitask-redis -p 6379:6379 redis:alpine
```

### "Database connection error"
```bash
# Verify PostgreSQL is running
# Check credentials in backend/.env match your database setup
```

### "Port 8000 already in use"
```bash
# Find and kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Frontend build errors
```bash
cd frontend
# Delete node_modules and reinstall
rmdir /s /q node_modules
npm install
```

---

## 📝 Development Workflow

### Creating Database Migrations
```bash
cd backend
venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate
```

### Creating a New Django App
```bash
cd backend
venv\Scripts\activate
python manage.py startapp myapp
# Add 'myapp' to INSTALLED_APPS in settings.py
```

### Adding New Dependencies

**Backend:**
```bash
pip install package-name
pip freeze > requirements.txt
```

**Frontend:**
```bash
npm install package-name
```

---

## 🚀 Deployment

See **SECURITY-WARNINGS.md** for critical security considerations before deployment.

### Pre-Deployment Checklist

- [ ] Set `DEBUG=False` in production .env
- [ ] Configure `ALLOWED_HOSTS` with production domain
- [ ] Set up HTTPS/SSL certificates
- [ ] Rotate all API keys and secrets
- [ ] Configure production database
- [ ] Set up Redis (managed service or dedicated server)
- [ ] Configure real email backend (SendGrid, etc.)
- [ ] Run `python manage.py check --deploy`
- [ ] Set up error monitoring (Sentry)
- [ ] Configure database backups
- [ ] Review **SECURITY-WARNINGS.md**

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI:** http://127.0.0.1:8000/api/docs/
- **OpenAPI Schema:** http://127.0.0.1:8000/api/schema/

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `python manage.py test` and `npm run test`
4. Commit: `git commit -m "Add your feature"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

---

## 📄 License

[Your License Here]

---

## 🆘 Support

- **Issues:** https://github.com/your-repo/issues
- **Discussions:** https://github.com/your-repo/discussions
- **Email:** support@yourdomain.com

---

**Last Updated:** 2025-11-30
**Version:** 1.0.0
