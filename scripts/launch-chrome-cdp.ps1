# Launch Chrome with remote debugging enabled for Playwright CDP connection

Write-Host "Chrome CDP Launcher for Playwright" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Find Chrome executable
$chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
)

$chromePath = $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $chromePath) {
    Write-Host "ERROR: Chrome not found in standard locations" -ForegroundColor Red
    Write-Host "Please install Chrome or edit this script to set the path manually" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found Chrome at: $chromePath" -ForegroundColor Green
Write-Host ""
Write-Host "Starting Chrome with remote debugging on port 9222..." -ForegroundColor Yellow
Write-Host "CDP URL: http://localhost:9222" -ForegroundColor Cyan
Write-Host "Profile: $env:USERPROFILE\.playwright-debug-profile" -ForegroundColor Cyan
Write-Host ""
Write-Host "PERSISTENT PROFILE:" -ForegroundColor Green
Write-Host "  - All cookies, history, and logins will be saved" -ForegroundColor White
Write-Host "  - You'll stay logged in between sessions" -ForegroundColor White
Write-Host "  - Same profile every time you run this script" -ForegroundColor White
Write-Host ""

# Create debug profile directory
$debugProfile = "$env:USERPROFILE\.playwright-debug-profile"
if (-not (Test-Path $debugProfile)) {
    New-Item -ItemType Directory -Path $debugProfile -Force | Out-Null
}

# Launch Chrome with CDP (start as separate process)
Start-Process -FilePath $chromePath -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=$debugProfile", "--restore-last-session"

Write-Host "`nChrome launched successfully!" -ForegroundColor Green
Write-Host "The browser will continue running independently." -ForegroundColor White
Write-Host "You can close this window now." -ForegroundColor White
Write-Host ""
Start-Sleep -Seconds 2
