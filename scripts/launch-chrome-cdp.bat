@echo off
REM Launch Chrome with remote debugging enabled
REM This allows Playwright to connect to your browser

REM Find Chrome executable
set CHROME_PATH=

REM Try common Chrome installation paths
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME_PATH=%LocalAppData%\Google\Chrome\Application\chrome.exe"
) else (
    echo Chrome not found in standard locations
    echo Please edit this script and set CHROME_PATH manually
    pause
    exit /b 1
)

echo Found Chrome at: %CHROME_PATH%
echo.
echo Starting Chrome with remote debugging on port 9222...
echo CDP URL: http://localhost:9222
echo Profile: %USERPROFILE%\.playwright-debug-profile
echo.
echo PERSISTENT PROFILE:
echo   - All cookies, history, and logins will be saved
echo   - You'll stay logged in between sessions
echo   - Same profile every time you run this script
echo.

REM Launch Chrome with CDP enabled
start "" "%CHROME_PATH%" --remote-debugging-port=9222 --user-data-dir="%USERPROFILE%\.playwright-debug-profile" --restore-last-session

echo.
echo Chrome launched successfully!
echo The browser will continue running in the background.
echo You can close this window now.
