# Windows Setup Guide

## Quick Fix for Windows Users ✅

The original error was caused by `better-sqlite3` requiring Visual Studio Build Tools. We've fixed this by switching to `sql.js` which is pure JavaScript and requires no compilation.

## Installation Steps

### 1. Install Dependencies (No Build Tools Required)
```powershell
npm install --legacy-peer-deps
```

### 2. Run Setup
```powershell
npm run setup
```

### 3. Configure Environment
Create `.env.local` with:
```
GEMINI_API_KEY=your_api_key_here
PORT=3001
```

### 4. Start Application
```powershell
npm run dev:full
```

## What We Fixed

### ❌ Before (Problematic)
- `better-sqlite3` - Required Visual Studio Build Tools
- Native compilation needed
- Windows-specific build errors

### ✅ After (Working)
- `sql.js` - Pure JavaScript SQLite
- No compilation required
- Works on all platforms

## Verification

Test that everything works:

```powershell
# Check Node version
node --version

# Install dependencies
npm install --legacy-peer-deps

# Verify Playwright
npx playwright --version

# Start backend
npm run server

# In another terminal, start frontend
npm run dev

# Or start both together
npm run dev:full
```

## Common Windows Issues & Solutions

### Issue: PowerShell Execution Policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Long Path Names
Enable long paths in Windows:
1. Open Group Policy Editor (`gpedit.msc`)
2. Navigate to: Computer Configuration > Administrative Templates > System > Filesystem
3. Enable "Enable Win32 long paths"

### Issue: Antivirus Blocking
Add project folder to antivirus exclusions:
- Windows Defender: Settings > Virus & threat protection > Exclusions
- Add folder: `C:\Users\[username]\...\web-application-test-ai-agent`

### Issue: Port Already in Use
Change port in `.env.local`:
```
PORT=3002
```

## Alternative: Using WSL (Windows Subsystem for Linux)

If you prefer a Linux environment:

```bash
# Install WSL2
wsl --install

# In WSL terminal:
cd /mnt/c/Users/[username]/path/to/project
npm install --legacy-peer-deps
npm run dev:full
```

## Dependencies That Work on Windows

✅ **No Compilation Required**:
- `sql.js` - Pure JavaScript SQLite
- `axios` - HTTP client
- `express` - Web server
- `ws` - WebSocket server
- `mongodb` - Database driver
- `pg` - PostgreSQL client
- `mysql2` - MySQL client

✅ **Playwright** - Handles Windows automatically:
- Downloads Chromium binaries
- No manual browser installation needed
- Works with Windows Defender

## Success Indicators

When everything is working correctly:

1. **Dependencies install cleanly** - No compilation errors
2. **Playwright ready** - `npx playwright --version` shows version
3. **Backend starts** - http://localhost:3001/api/health returns JSON
4. **Frontend loads** - http://localhost:5173 shows the app
5. **Real testing works** - Can run tests against actual websites

## Performance Notes

- **sql.js** is slightly slower than `better-sqlite3` but sufficient for testing
- **In-memory database** - Fast for test scenarios
- **No file I/O** - Reduces Windows permission issues
- **Cross-platform** - Same code works on Windows, Mac, Linux

Your system is now Windows-friendly and ready for real multi-agent testing! 🚀