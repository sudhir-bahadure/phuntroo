# 🚀 Phuntroo Quick Start Guide

## Prerequisites
- Node.js installed (for frontend)
- Internet connection (first run only, to download dependencies)

## Starting Phuntroo

### Step 1: Start Backend
Open **PowerShell** and run:
```powershell
cd d:\Jarvis-main
powershell -ExecutionPolicy Bypass -File start-backend.ps1
```

Wait for the message: `Started PhuntrooOrchestratorApplication`

### Step 2: Frontend (Already Running)
The frontend is already running at: http://localhost:5173

If not, open a new terminal:
```bash
cd d:\Jarvis-main\web
npm run dev
```

### Step 3: Open Browser
Navigate to: http://localhost:5173

## Testing
1. Type "Hello Phuntroo" in the chat
2. Press Enter
3. You should see a response from Cohere AI

## Troubleshooting

**Backend won't start?**
- Make sure port 8080 is free
- Check that Java and Maven were extracted to `d:\Jarvis-main\tools\`

**Frontend shows blank page?**
- Make sure backend is running on port 8080
- Check browser console for errors (F12)

**No response from chat?**
- Verify Cohere API key in `phuntroo-orchestrator-java\src\main\resources\application.properties`
- Check backend console for errors

## Architecture
```
Browser → React Frontend (port 5173)
              ↓
         Java Backend (port 8080)
              ↓
         Cohere API
```

Your Cohere API key is already configured!
