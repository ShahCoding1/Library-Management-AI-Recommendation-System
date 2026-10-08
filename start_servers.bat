@echo off
title FYP System Launch Orchestrator
echo ========================================================
echo   BOOK RECOMMENDATION, SCREEN-TIME ^& LIBRARY SYSTEM
echo ========================================================
echo.
echo Starting Django Backend Server on http://127.0.0.1:8000 ...
start "Backend - Django Server" cmd /k "cd /d ""%~dp0backend"" && python manage.py runserver 127.0.0.1:8000"

timeout /t 2 /nobreak >nul

echo Starting React Vite Frontend Server on http://localhost:5173 ...
start "Frontend - React Vite" cmd /k "cd /d ""%~dp0frontend"" && node node_modules\vite\bin\vite.js --host"

echo.
echo ========================================================
echo   SYSTEM SERVERS LAUNCHED SUCCESSFULLY!
echo   Frontend URL: http://localhost:5173
echo   Backend API:  http://127.0.0.1:8000/api/v1/
echo ========================================================
