$env:JAVA_HOME = "d:\Jarvis-main\tools\jdk-17"
$env:PATH = "d:\Jarvis-main\tools\jdk-17\bin;d:\Jarvis-main\tools\apache-maven-3.9.5\bin;" + $env:PATH

Write-Host "Starting Phuntroo Backend..."
Write-Host "JAVA_HOME: $env:JAVA_HOME"
Write-Host "Maven: d:\Jarvis-main\tools\apache-maven-3.9.5\bin\mvn.cmd"
Write-Host ""

Set-Location "d:\Jarvis-main\phuntroo-orchestrator-java"

& "d:\Jarvis-main\tools\apache-maven-3.9.5\bin\mvn.cmd" spring-boot:run
