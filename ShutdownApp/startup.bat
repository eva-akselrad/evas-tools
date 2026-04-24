@echo off
REM JARVIS Shutdown Server - Startup Script
REM This script starts the JARVIS control system on port 1234

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo.
echo ╔════════════════════════════════════════╗
echo ║  JARVIS System Control - Starting Up   ║
echo ║  Version 1.0.0                         ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if node_modules exists, install if not
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Build the project
echo Building project...
call npm run build
if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

REM Start the server
echo.
echo Starting JARVIS server on port 1234...
echo.
call npm start

pause
