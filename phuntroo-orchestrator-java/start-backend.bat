@echo off
setlocal

REM Set Java and Maven paths
set "JAVA_HOME=%~dp0..\tools\jdk-17"
set "MAVEN_HOME=%~dp0..\tools\apache-maven-3.9.5"
set "PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%"

echo Starting Phuntroo Backend...
echo JAVA_HOME=%JAVA_HOME%
echo MAVEN_HOME=%MAVEN_HOME%
echo.

REM Run Maven
mvn spring-boot:run

pause
