# Playwright MCP CDP Configuration

## Created Files

- `.mcp.json` - Modified Playwright MCP configuration with CDP support (in project root)

## How to Use

### Option 1: Replace the Plugin Config (Recommended)

Replace the existing Playwright plugin config with the CDP-enabled version:

```cmd
copy .mcp.json "%USERPROFILE%\.claude\plugins\marketplaces\claude-plugins-official\external_plugins\playwright\.mcp.json"
```

### Option 2: Manual Copy

1. Open: `C:\Users\trala\.claude\plugins\marketplaces\claude-plugins-official\external_plugins\playwright\.mcp.json`
2. Replace the contents with the configuration from `.mcp.json` in your project root

## Configuration Details

The new config adds these environment variables:
- `PLAYWRIGHT_CDP_URL`: http://localhost:9222
- `BROWSER_WS_ENDPOINT`: ws://localhost:9222
- `PLAYWRIGHT_CONNECT_OPTIONS`: WebSocket endpoint configuration

## Steps to Test

1. **Launch Chrome with CDP:**
   ```cmd
   scripts\launch-chrome-cdp.bat
   ```

2. **Verify CDP is running:**
   ```cmd
   curl http://localhost:9222/json/version
   ```

3. **Replace the MCP config:**
   ```cmd
   copy .mcp.json "%USERPROFILE%\.claude\plugins\marketplaces\claude-plugins-official\external_plugins\playwright\.mcp.json"
   ```

4. **Restart Claude Code** to load the new configuration

5. **Test if it works:**
   - Ask Claude to navigate to a website
   - Check if it uses your existing Chrome or launches a new one

## Important Notes

⚠️ **This may not work!** The standard `@playwright/mcp` package might not support CDP connection through environment variables. If it doesn't work, you'll see Playwright still launching its own browser.

### If It Doesn't Work

The `@playwright/mcp` package may need to be modified or replaced with a custom implementation. Alternatives:

1. **Use Playwright directly in scripts** (connect to CDP manually)
2. **Request CDP support** from the Playwright MCP maintainers
3. **Create a custom MCP server** that wraps Playwright with CDP support

## Reverting to Original Config

If you want to go back to the default behavior:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

## Verification

After restarting Claude Code:
- Chrome with CDP should be running (scripts\launch-chrome-cdp.bat)
- Ask Claude to use Playwright
- Check if it controls your existing Chrome or launches a new one
- Look at the Chrome windows to see which one is being controlled

## Troubleshooting

### Config Not Loading
- Make sure you copied to the correct location
- Restart Claude Code completely
- Check for syntax errors in the JSON file

### Still Launching New Browser
- The MCP plugin likely doesn't support CDP
- Check Playwright MCP documentation for updates
- Consider using custom scripts instead
