@echo off
echo ==========================================
echo       Phuntroo AI - Starting with Custom JDK
echo ==========================================

REM Set custom JDK path
set "JAVA_HOME=D:\vs\java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64\java-1.8.0-openjdk-1.8.0.392-1.b08.redhat.windows.x86_64"

REM Check if Maven is in tools folder, otherwise use system Maven
if exist "%~dp0tools\apache-maven-3.9.5\bin\mvn.cmd" (
    set "MAVEN_HOME=%~dp0tools\apache-maven-3.9.5"
) else if exist "%~dp0tools\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MAVEN_HOME=%~dp0tools\apache-maven-3.9.6"
) else if exist "%~dp0tools\maven\bin\mvn.cmd" (
    set "MAVEN_HOME=%~dp0tools\maven"
) else (
    echo Maven not found in tools folder, checking system Maven...
    set "MAVEN_HOME="
)

REM Update PATH
if defined MAVEN_HOME (
    set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"
) else (
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

echo.
echo Java Home: %JAVA_HOME%
echo Maven Home: %MAVEN_HOME%
echo.

REM Verify Java installation
echo Verifying Java installation...
"%JAVA_HOME%\bin\java.exe" -version
if %errorlevel% neq 0 (
    echo [ERROR] Java not found at specified path!
    pause
    exit /b
)

echo.
echo Verifying Maven installation...
call mvn -version
if %errorlevel% neq 0 (
    echo [ERROR] Maven not found! Please install Maven or download to tools folder.
    pause
    exit /b
)

echo.
echo [1/2] Starting Java Backend (Orchestrator)...
cd "%~dp0phuntroo-orchestrator-java"
start "Phuntroo Backend" cmd /k "mvn spring-boot:run"

echo Waiting for backend to initialize...
timeout /t 10

echo [2/2] Starting Frontend (Web)...
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
