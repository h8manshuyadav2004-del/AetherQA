# Installation Guide

## Quick Start

1. **Install dependencies** (with legacy peer deps to resolve conflicts):
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Run setup** (creates directories and installs Playwright):
   ```bash
   npm run setup
   ```

3. **Configure environment**:
   - Copy `.env.local.example` to `.env.local` (if exists)
   - Or create `.env.local` with:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```

4. **Start the application**:
   ```bash
   npm run dev:full
   ```

## Troubleshooting

### Dependency Conflicts
If you encounter dependency resolution errors:
```bash
npm install --legacy-peer-deps --force
```

### Playwright Installation
If Playwright browsers aren't installed:
```bash
npx playwright install
```

### Port Conflicts
If port 3001 is in use, update `.env.local`:
```
PORT=3002
```

### Windows-Specific Issues
On Windows, you might need to:
1. Run as Administrator for Playwright installation
2. Use PowerShell instead of Command Prompt

**Note**: We use `sql.js` instead of `better-sqlite3` to avoid Visual Studio Build Tools requirement on Windows.

## Manual Setup

If automatic setup fails:

1. **Create directories**:
   ```bash
   mkdir screenshots traces har queries
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install chromium
   ```

3. **Create .env.local**:
   ```
   GEMINI_API_KEY=your_api_key_here
   PORT=3001
   NODE_ENV=development
   ```

## Verification

Test that everything works:

1. **Backend health check**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Frontend access**:
   Open http://localhost:5173

3. **Run a test**:
   - Enter a URL (e.g., https://example.com)
   - Click "Start Test"
   - Watch real agents perform actual testing

## Dependencies Explained

- **playwright**: Real browser automation
- **axios**: HTTP client for API testing  
- **sql.js**: Pure JavaScript SQLite database (no compilation required)
- **mongodb**: MongoDB database driver (v5.9 for compatibility)
- **pg**: PostgreSQL client
- **mysql2**: MySQL client
- **express**: Web server
- **ws**: WebSocket server
- **cors**: Cross-origin resource sharing

## System Requirements

- **Node.js**: 18+ 
- **RAM**: 4GB+ (for browser automation)
- **Disk**: 1GB+ (for Playwright browsers)
- **OS**: Windows, macOS, or Linux