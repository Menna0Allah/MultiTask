@echo off
REM ========================================
REM MultiTask Frontend Startup Script
REM ========================================

echo.
echo ========================================
echo   MultiTask Frontend (React + Vite)
echo ========================================
echo.

REM Change to frontend directory
cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] Dependencies not installed!
    echo Installing dependencies...
    call npm install
)

REM Start development server
echo.
echo ========================================
echo   Starting Vite development server...
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Press CTRL+C to stop the server
echo.

call npm run dev
