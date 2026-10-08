@echo off
title Reset and Seed Database
echo ========================================================
echo   DATABASE RESET ^& RE-SEEDING SCRIPT
echo ========================================================
echo.
echo WARNING: This will flush existing data and re-seed fresh catalog data.
set /p confirm="Are you sure you want to proceed? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Operation cancelled.
    pause
    exit /b 0
)

cd /d "%~dp0backend"
echo.
echo [1/3] Running migrations...
python manage.py migrate

echo.
echo [2/3] Seeding fresh realistic library catalog ^& users...
python manage.py seed_library_data

echo.
echo [3/3] Recomputing TF-IDF recommendation matrices...
python manage.py rebuild_recommendation_model

echo.
echo ========================================================
echo   DATABASE RESET ^& SEEDING COMPLETED SUCCESSFULLY!
echo ========================================================
pause

