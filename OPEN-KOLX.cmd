@echo off
cd /d "%~dp0"
py -3 --version >nul 2>&1
if not errorlevel 1 (
    py -3 launch.py
    if errorlevel 1 pause
    exit /b
)
python --version >nul 2>&1
if not errorlevel 1 (
    python launch.py
    if errorlevel 1 pause
    exit /b
)
echo Python 3 is required. Install Python 3, then open this file again.
pause
