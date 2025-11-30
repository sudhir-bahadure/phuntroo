@echo off
echo ==========================================
echo       Phuntroo AI - Starting...
echo ==========================================

REM Set environment variables
set "JAVA_HOME=%~dp0tools\jdk-17"
set "MAVEN_HOME=%~dp0tools\apache-maven-3.9.5"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo Java: %JAVA_HOME%
echo Maven: %MAVEN_HOME%
echo.

echo [1/2] Starting Java Backend...
cd "%~dp0phuntroo-orchestrator-java"
start "Phuntroo Backend" cmd /k "mvn spring-boot:run"

echo Waiting for backend to initialize...
timeout /t 10

echo [2/2] Starting Frontend...
cd "%~dp0web"
start "Phuntroo Frontend" cmd /k "npm run dev"

echo.
echo ==========================================
echo   Both servers are starting!
echo   Backend: http://localhost:8080
echo   Frontend: http://localhost:5173
echo ==========================================
echo.
timeout /t 5
start http://localhost:5173

pause
