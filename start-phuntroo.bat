@echo off
echo ==========================================
echo       Phuntroo AI - One-Click Start
echo ==========================================

echo [0/2] Checking Environment...
if not exist "tools\jdk-17\bin\java.exe" (
    if not exist "tools\jdk-17.0.9+8\bin\java.exe" (
        echo Java/Maven not found. Running setup script...
        powershell -ExecutionPolicy Bypass -File setup-env.ps1
    )
)

REM Find JDK folder dynamically
if exist "tools\jdk-17\bin\java.exe" (
    set "JAVA_HOME=%CD%\tools\jdk-17"
) else (
    set "JAVA_HOME=%CD%\tools\jdk-17.0.9+8"
)

set "PATH=%JAVA_HOME%\bin;%CD%\tools\maven\bin;%CD%\tools\apache-maven-3.9.6\bin;%PATH%"

echo [1/2] Starting Java Backend (Orchestrator)...
call mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Maven setup failed.
    pause
    exit /b
)

start "Phuntroo Backend" cmd /k "cd phuntroo-orchestrator-java && mvn spring-boot:run"

echo Waiting for backend to initialize...
timeout /t 5

echo [2/2] Starting Frontend (Web)...
start "Phuntroo Web" cmd /k "cd web && npm run dev"

echo ==========================================
echo    All systems go! Opening Browser...
echo ==========================================
timeout /t 3
start http://localhost:5173

pause
