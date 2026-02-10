# Playwright CDP Setup Guide

This guide shows you how to connect Playwright to your existing Chrome browser instead of launching a new one.

## What This Does

- Runs your local Chrome with remote debugging enabled
- Allows Playwright to connect and control your existing browser session
- Preserves your cookies, login sessions, and browser data

## Setup Steps

### Step 1: Launch Chrome with CDP

Choose one of these methods:

**Option A: Using Batch File (Windows CMD)**
```cmd
scripts\launch-chrome-cdp.bat
```

**Option B: Using PowerShell**
```powershell
scripts\launch-chrome-cdp.ps1
```

**Option C: Manual Command**
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%USERPROFILE%\.playwright-debug-profile"
```

### Step 2: Verify CDP is Running

Open a new terminal and test:
```cmd
curl http://localhost:9222/json/version
```

You should see JSON output with browser information.

### Step 3: Configure Playwright MCP (IMPORTANT!)

The standard `@playwright/mcp` package may not support CDP connection out of the box.

**Check if it's supported:**
1. Look for environment variables like `PLAYWRIGHT_CDP_URL` or `BROWSER_WS_ENDPOINT`
2. Check the package documentation: https://github.com/microsoft/playwright-mcp

**If NOT supported:** Unfortunately, the standard Playwright MCP plugin launches its own browser and doesn't support connecting to existing browsers. You would need to:
1. Request this feature from the Playwright MCP maintainers
2. Use Playwright directly in a script (not through MCP)
3. Continue using the isolated browser instance

### Alternative: Use Playwright Directly

If the MCP plugin doesn't support CDP, you can use Playwright in a Node.js script:

```javascript
const { chromium } = require('playwright');

async function main() {
  // Connect to your CDP-enabled Chrome
  const browser = await chromium.connectOverCDP('http://localhost:9222');

  // Get the default context (your existing browser session)
  const contexts = browser.contexts();
  const context = contexts[0];

  // Get or create a page
  const pages = context.pages();
  const page = pages[0] || await context.newPage();

  // Now you can control your browser
  await page.goto('https://example.com');

  // Don't close the browser, just disconnect
  await browser.close();
}

main();
```

## Troubleshooting

### Chrome Won't Start
- Make sure no other Chrome instance is running on port 9222
- Check if Chrome is installed in the expected location
- Try running Chrome manually with the flags

### Connection Refused
- Verify Chrome is running with CDP enabled
- Check `http://localhost:9222/json/version` in your browser
- Make sure no firewall is blocking port 9222

### Playwright Can't Connect
- The `@playwright/mcp` plugin may not support CDP connections
- Check the plugin documentation for updates
- Consider using Playwright directly in scripts instead

## Notes

- The Chrome instance uses a separate profile (`.playwright-debug-profile`) to avoid conflicts
- This profile will have its own cookies and settings
- To use your main profile's data, you'll need to log in again
- Keep the CMD/PowerShell window open while using Playwright
- Close the window to stop the debug session

## Security Warning

Running Chrome with remote debugging exposes your browser to local network connections. Only use this on trusted networks and close the debug session when done.
