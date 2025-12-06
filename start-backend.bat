@echo off
REM ========================================
REM MultiTask Backend Startup Script
REM ========================================

echo.
echo ========================================
echo   MultiTask Backend Server
echo ========================================
echo.

REM Change to backend directory
cd /d "%~dp0backend"

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please run setup first: python -m venv venv
    pause
    exit /b 1
)

REM Activate virtual environment
echo [1/4] Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if Redis is running
echo [2/4] Checking Redis connection...
docker ps --filter "name=multitask-redis" --format "{{.Names}}" | findstr multitask-redis >nul
if errorlevel 1 (
    echo [WARNING] Redis container not running!
    echo Starting Redis container...
    docker run -d --name multitask-redis -p 6379:6379 redis:alpine
    timeout /t 2 >nul
)

REM Run migrations
echo [3/4] Running database migrations...
python manage.py migrate --noinput

REM Start server with Daphne (ASGI) for WebSocket support
echo [4/4] Starting Daphne ASGI server with WebSocket support...
echo.
echo ========================================
echo   Server running at: http://127.0.0.1:8000
echo   WebSocket support: ENABLED
echo   API Docs: http://127.0.0.1:8000/api/docs/
echo   Admin: http://127.0.0.1:8000/admin/
echo ========================================
echo.
echo Press CTRL+C to stop the server
echo.

daphne -b 127.0.0.1 -p 8000 multitask_backend.asgi:application
