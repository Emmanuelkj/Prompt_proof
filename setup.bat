@echo off
setlocal enabledelayedexpansion

title PromptProof - Windows Environment Setup

cd /d "%~dp0"

echo ==========================================================
echo        PromptProof - Windows Environment Setup
echo ==========================================================
echo.

:: 1. Check Python
set "PYTHON_CMD="
where python >nul 2>nul
if %errorlevel% equ 0 (
    set "PYTHON_CMD=python"
) else (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set "PYTHON_CMD=py"
    )
)

if "%PYTHON_CMD%"=="" (
    echo [ERROR] Python not found. Please install Python 3.10 or higher from python.org.
    echo Ensure "Add Python to PATH" is checked during installation.
    pause
    exit /b 1
)

echo [1/4] Found Python: %PYTHON_CMD%

:: 2. Create Python virtual environment
echo [2/4] Setting up Python virtual environment in backend\venv...
if not exist "%~dp0backend\venv" (
    "%PYTHON_CMD%" -m venv "%~dp0backend\venv"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

:: 3. Install Python dependencies
echo [3/4] Installing backend dependencies...
"%~dp0backend\venv\Scripts\python.exe" -m pip install --upgrade pip
"%~dp0backend\venv\Scripts\pip.exe" install -r "%~dp0backend\requirements.txt"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend requirements.
    pause
    exit /b 1
)

:: 4. Install Node/NPM and build frontend
echo [4/4] Setting up frontend assets...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    pushd "%~dp0frontend"
    call npm install
    call npm run build
    popd
) else (
    echo [WARNING] Node.js/NPM not detected.
    echo Please install Node.js 18+ from https://nodejs.org/ to build the frontend.
)

echo.
echo ==========================================================
echo [SUCCESS] Setup complete!
echo.
echo To start the production server:
echo   Run: start.bat
echo   Or double-click start.bat in File Explorer
echo.
echo To launch the development environment:
echo   Run: dev.bat
echo ==========================================================
echo.
pause
