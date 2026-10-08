@echo off
title Database Snapshot & Backup
echo ========================================================
echo   DATABASE BACKUP UTILITY
echo ========================================================
echo.
set "BACKUP_DIR=%~dp0backups"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set "dt=%%I"
set "TIMESTAMP=%dt:~0,8%_%dt:~8,6%"
set "BACKUP_FILE=%BACKUP_DIR%\db_backup_%TIMESTAMP%.sqlite3"

echo Creating snapshot: "%BACKUP_FILE%"
copy "%~dp0backend\db.sqlite3" "%BACKUP_FILE%" >nul

if errorlevel 1 (
    echo [!] Failed to create database backup.
) else (
    echo.
    echo ========================================================
    echo   DATABASE BACKUP SAVED SUCCESSFULLY!
    echo   File: %BACKUP_FILE%
    echo ========================================================
)
pause
