@echo off
title FYP System Test Suite
echo ========================================================
echo   RUNNING ALL SYSTEM TESTS ^& VALIDATIONS
echo ========================================================
echo.
echo [1/3] Running Django Backend Automated Tests...
cd /d "%~dp0backend"
python manage.py test
if errorlevel 1 goto failed

echo.
echo [2/3] Evaluating ML Recommendation Model Metrics...
python manage.py evaluate_recommendation_model
if errorlevel 1 goto failed

echo.
echo [3/3] Building React Frontend Production Bundle...
cd /d "%~dp0frontend"
node "node_modules\vite\bin\vite.js" build
if errorlevel 1 goto failed

echo.
echo ========================================================
echo   ALL TESTS, EVALUATIONS ^& BUILDS PASSED (100%% OK)!
echo ========================================================
exit /b 0

:failed
echo.
echo [!] TEST OR BUILD FAILURE DETECTED.
exit /b 1
