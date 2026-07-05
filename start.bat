@echo off
:: AI Price Compare Startup Utility Script
:: This script checks for Node.js, installs local dependencies, and boots the unified full-stack application.

title AI Price Compare - Unified Fullstack Application

echo =======================================================
echo     AI PRICE COMPARISON WEB APPLICATION LAUNCHER
echo =======================================================
echo.

:: Check for Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js (v18+) from https://nodejs.org/ and try again.
    pause
    exit /b
)

echo [1/3] Node.js environment detected.
echo [2/3] Installing package dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm packages. Please check your internet connection.
    pause
    exit /b
)

echo.
echo [3/3] Dependencies successfully validated.
echo Starting the fullstack development server (Express + Vite on Port 3000)...
echo Press Ctrl+C at any time in this window to stop the server.
echo.
echo Launching browser to http://localhost:3000 ...
start http://localhost:3000

:: Start server
call npm run dev

pause
