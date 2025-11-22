param(
    [string]$vrmPath = "D:\Jarvis-main\web\public\models\avatar.vrm"
)

if (!(Test-Path $vrmPath)) {
    Write-Host "❌ VRM file not found: $vrmPath" -ForegroundColor Red
    Write-Host "   Expected location: $vrmPath" -ForegroundColor Yellow
    Write-Host "   You can download a sample VRM from: https://pixiv.github.io/three-vrm/" -ForegroundColor Cyan
    exit
}

$size = (Get-Item $vrmPath).Length
$sizeMB = [math]::Round($size / 1MB, 2)

Write-Host "✔ VRM file found!" -ForegroundColor Green
Write-Host "  Path: $vrmPath" -ForegroundColor Cyan
Write-Host "  Size: $sizeMB MB ($size bytes)" -ForegroundColor Cyan

if ($size -gt 200000000) {
    Write-Host "⚠️ WARNING: VRM file is too large for browser!" -ForegroundColor Yellow
    Write-Host "   Recommended: < 200 MB for optimal performance" -ForegroundColor Yellow
} else {
    Write-Host "✔ Size is acceptable for browser loading" -ForegroundColor Green
}

Write-Host "`n✔ VRM Validation complete." -ForegroundColor Green
