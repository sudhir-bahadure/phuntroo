@echo off
echo ==========================================
echo       Phuntroo AI - Quick Start
echo ==========================================
echo.
echo IMPORTANT: Maven setup is having issues.
echo.
echo Please use ONE of these options:
echo.
echo OPTION 1 (Recommended): Use IntelliJ IDEA or Eclipse
echo   1. Open 'd:\Jarvis-main\phuntroo-orchestrator-java' in your IDE
echo   2. Run PhuntrooOrchestratorApplication.java
echo   3. Wait for it to start on port 8080
echo   4. Then run this script again to start the frontend
echo.
echo OPTION 2: Install Maven manually
echo   1. Download from: https://maven.apache.org/download.cgi
echo   2. Extract and add to PATH
echo   3. Run this script again
echo.
echo ==========================================
echo.
set /p choice="Do you want to start the FRONTEND only? (y/n): "
if /i "%choice%"=="y" goto frontend
goto end

:frontend
echo.
echo [1/1] Starting Frontend...
cd web
start "Phuntroo Web" cmd /k "npm run dev"
timeout /t 3
start http://localhost:5173
echo.
echo Frontend started! Make sure backend is running on port 8080.
goto end

:end
pause
