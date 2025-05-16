@echo off
REM Start-Urban-Commute.cmd - Script to check compatibility and start the Urban Commute Assistant
TITLE Urban Commute Assistant Launcher

echo ======================================================
echo Urban Commute Assistant - Compatibility Check and Launch
echo ======================================================
echo.

echo Checking Python compatibility...
python check_compatibility.py

echo.
echo ======================================================
echo Starting Urban Commute Assistant Backend
echo ======================================================
echo.

cd backend
start "Urban Commute Backend" cmd /c "python run_with_patching.py"

echo.
echo ======================================================
echo Starting Urban Commute Assistant Frontend
echo ======================================================
echo.

timeout /t 5 > nul
cd ..\frontend
start "Urban Commute Frontend" cmd /c "npm run dev"

echo.
echo Both applications are now running in separate windows.
echo Press any key to close this window...
pause > nul
