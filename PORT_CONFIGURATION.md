# Port Configuration Guide

## Current Setup

### Backend Server
- **Port**: `3001`
- **URL**: `http://localhost:3001`
- **Configured in**: `server/.env` → `PORT=3001`

### Frontend Application
- **Port**: `3000`
- **URL**: `http://localhost:3000`
- **Type**: React development server (default port)

### API Communication
- Frontend at `http://localhost:3000` → Backend at `http://localhost:3001`

## Allowed CORS Origins

The backend accepts requests from these origins:

```
✓ http://localhost:3000  (React default - YOUR CURRENT SETUP)
✓ http://localhost:5173  (Vite default)
✓ http://localhost:5174  (Vite alternate)
```

## Port Reference

### Common Frontend Ports

| Tool/Framework | Default Port | Notes |
|----------------|--------------|-------|
| Create React App | 3000 | React default (YOUR SETUP) |
| Vite | 5173 | Modern build tool |
| Next.js | 3000 | React framework |
| Angular CLI | 4200 | Angular default |
| Vue CLI | 8080 | Vue default |

### Common Backend Ports

| Service | Port | Notes |
|---------|------|-------|
| Your Backend | 3001 | Express server |
| MongoDB | 27017 | Database |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |

## Configuration Files

### Backend Port
**File**: `server/.env`
```env
PORT=3001
```

To change backend port:
1. Edit `server/.env`
2. Update `PORT=3001` to desired port
3. Restart backend server
4. Update frontend API URL

### Frontend API URL
**File**: `.env.local`
```env
VITE_API_URL=http://localhost:3001      # For Vite
REACT_APP_API_URL=http://localhost:3001 # For Create React App
```

### CORS Configuration
**File**: `server/src/server.ts`
```typescript
const allowedOrigins = [
  'http://localhost:3000', // React default
  'http://localhost:5173', // Vite default
  'http://localhost:5174', // Vite alternate
];
```

## Troubleshooting Port Issues

### Issue: "Port 3001 already in use"

**Find what's using the port**:
```bash
# macOS/Linux
lsof -ti:3001

# Kill the process
lsof -ti:3001 | xargs kill -9
```

**Or change the port**:
```bash
# In server/.env
PORT=3002
```

### Issue: "Port 3000 already in use"

**Frontend options**:
```bash
# Option 1: Kill the process
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port (React)
PORT=3001 npm start

# Option 3: Use different port (Vite)
vite --port 3002
```

### Issue: CORS Error After Port Change

If you change frontend port, update backend CORS:

1. Edit `server/src/server.ts`
2. Add your new port to `allowedOrigins`
3. Restart backend server

Example:
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002', // ← Add your new port
  'http://localhost:5173',
];
```

## How to Check Current Ports

### Check if Backend is Running
```bash
curl http://localhost:3001/api/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### Check if Frontend is Running
Open browser to:
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)

### List All Used Ports
```bash
# macOS/Linux
lsof -i -P -n | grep LISTEN

# Windows
netstat -ano | findstr LISTENING
```

## Production Considerations

### Environment Variables

**Development**:
```env
# Backend
PORT=3001
CLIENT_URL=http://localhost:3000

# Frontend
REACT_APP_API_URL=http://localhost:3001
```

**Production**:
```env
# Backend
PORT=3001
CLIENT_URL=https://yourdomain.com

# Frontend
REACT_APP_API_URL=https://api.yourdomain.com
```

### Reverse Proxy Setup

In production, use a reverse proxy (nginx/Apache):

```nginx
# nginx example
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
    }
}
```

## Quick Reference

### Start Backend
```bash
cd server
yarn dev
# Runs on http://localhost:3001
```

### Start Frontend
```bash
yarn dev
# Runs on http://localhost:3000 (React)
# OR http://localhost:5173 (Vite)
```

### Change Ports

**Backend Port**:
```bash
# Edit server/.env
PORT=8080
```

**Frontend Port (React)**:
```bash
PORT=8080 npm start
```

**Frontend Port (Vite)**:
```bash
vite --port 8080
```

### Test Connection
```bash
# Test backend
curl http://localhost:3001/api/health

# Test CORS
curl -H "Origin: http://localhost:3000" \
     -i http://localhost:3001/api/health
```

## Current Working Configuration

✅ **Backend**: Port 3001
✅ **Frontend**: Port 3000
✅ **CORS**: Configured for port 3000
✅ **API URL**: `http://localhost:3001`

This is your current setup and should work after restarting the backend server!

## Need Help?

If you're still having issues:

1. ✅ Check both servers are running
2. ✅ Verify ports in configuration files
3. ✅ Check browser console for errors
4. ✅ Review CORS_TROUBLESHOOTING.md
5. ✅ Restart both servers
6. ✅ Clear browser cache

---

**Last Updated**: November 27, 2024
**Your Setup**: Frontend (3000) → Backend (3001)
