Write-Host "=== PHUNTROO AUTO-LAUNCH ===" -ForegroundColor Cyan

# Go to working directory
cd "D:\Jarvis-main\web"

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 node_modules missing — installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if package.json exists
if (!(Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found!" -ForegroundColor Red
    exit
}

# Auto-clean npm cache if corrupted
if (Test-Path "$env:APPDATA\npm-cache\_logs") {
    Remove-Item "$env:APPDATA\npm-cache\_logs" -Recurse -Force -ErrorAction SilentlyContinue
}

# Clean temporary files
Get-ChildItem -Path . -Include *.log,*.tmp -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Host "🧹 Logs cleaned" -ForegroundColor Green

# Auto-start server with crash recovery
Write-Host "🚀 Launching dev server..." -ForegroundColor Cyan
while ($true) {
    npm run dev
    Write-Host "`n⚠️ Dev server crashed or exited — restarting in 3 seconds..." -ForegroundColor Red
    Start-Sleep -Seconds 3
}
