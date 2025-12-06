@echo off
REM ========================================
REM MultiTask - Complete Setup Script
REM ========================================

echo.
echo ========================================
echo   MultiTask Project Setup
echo ========================================
echo.

REM Check Python installation
where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check Node.js installation
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check Docker installation
where docker >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    pause
    exit /b 1
)

echo ========================================
echo   BACKEND SETUP
echo ========================================
echo.

cd /d "%~dp0backend"

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo [1/4] Creating Python virtual environment...
    python -m venv venv
) else (
    echo [1/4] Virtual environment already exists
)

REM Activate and install dependencies
echo [2/4] Installing backend dependencies...
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt

REM Start Redis container
echo [3/4] Starting Redis container...
docker ps --filter "name=multitask-redis" --format "{{.Names}}" | findstr multitask-redis >nul
if errorlevel 1 (
    docker run -d --name multitask-redis -p 6379:6379 redis:alpine
) else (
    echo Redis container already running
)

REM Run migrations
echo [4/4] Running database migrations...
python manage.py migrate

echo.
echo ========================================
echo   FRONTEND SETUP
echo ========================================
echo.

cd /d "%~dp0frontend"

REM Install npm dependencies
echo [1/1] Installing frontend dependencies...
call npm install

echo.
echo ========================================
echo   SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo   1. Create a superuser: cd backend ^& venv\Scripts\activate ^& python manage.py createsuperuser
echo   2. Start backend: start-backend.bat
echo   3. Start frontend: start-frontend.bat
echo.
echo Visit: http://localhost:5173
echo.
pause
