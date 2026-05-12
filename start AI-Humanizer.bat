@echo off
title AI-Humanizer

echo Starting AI-Humanizer backend...
cd /d "%~dp0backend"
call .venv\Scripts\activate
start /min cmd /k "uvicorn main:app"

echo Waiting for backend to start...
timeout /t 4 /nobreak >nul

echo Launching AI-Humanizer...
start "" "C:\Users\sithi\AppData\Local\AI-Humanizer\AI-Humanizer.exe"

exit