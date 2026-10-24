@echo off
setlocal enabledelayedexpansion

title PromptProof - Production Server

cd /d "%~dp0"

echo ==========================================================
echo        PromptProof - Production Server (Windows)
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

echo [OK] Using Python: %PYTHON_CMD%

:: 2. Check if frontend distribution exists
if not exist "%~dp0frontend\dist\index.html" (
    echo [INFO] Frontend distribution not found. Building production bundle...
    where npm >nul 2>nul
    if %errorlevel% equ 0 (
        pushd "%~dp0frontend"
        call npm install
        call npm run build
        popd
    ) else (
        echo [WARNING] Node/NPM not found. Serving without static frontend build.
    )
)

:: 3. Set environment and start Uvicorn
set "PYTHONPATH=%~dp0backend"
echo.
echo ==========================================================
echo Server launching on http://localhost:8000
echo Access the Web UI in your browser: http://localhost:8000
echo Press CTRL+C to stop the server.
echo ==========================================================
echo.

"%PYTHON_CMD%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000

pause
