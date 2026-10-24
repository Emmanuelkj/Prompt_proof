@echo off
setlocal enabledelayedexpansion

title PromptProof - Development Launcher

cd /d "%~dp0"

echo ==========================================================
echo        PromptProof - Development Environment (Windows)
echo ==========================================================

:: 1. Locate Python executable
set "PYTHON_CMD="
if exist "%~dp0backend\venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0backend\venv\Scripts\python.exe"
) else if exist "%~dp0venv\Scripts\python.exe" (
    set "PYTHON_CMD=%~dp0venv\Scripts\python.exe"
) else (
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        set "PYTHON_CMD=python"
    ) else (
        where py >nul 2>nul
        if %errorlevel% equ 0 (
            set "PYTHON_CMD=py"
        )
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python not found. Please install Python 3.10+ or run setup.bat first.
    pause
    exit /b 1
)

:: 2. Launch Backend in new window
echo [INFO] Starting Backend API on http://localhost:8000 (auto-reload)...
start "PromptProof - Backend API" cmd /k "cd /d \"%~dp0\" && set PYTHONPATH=%~dp0backend && title PromptProof - Backend API (Port 8000) && \"%PYTHON_CMD%\" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: 3. Launch Frontend in new window
echo [INFO] Starting Frontend Dev Server on http://localhost:5173...
start "PromptProof - Frontend Vite" cmd /k "cd /d \"%~dp0frontend\" && title PromptProof - Frontend Vite (Port 5173) && npm run dev"

echo.
echo ==========================================================
echo PromptProof development servers are now running:
echo   - Backend API: http://localhost:8000 (Docs at /docs)
echo   - Frontend UI: http://localhost:5173
echo.
echo Close the respective terminal windows to terminate.
echo ==========================================================
echo.
