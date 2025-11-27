# MoneyHero AI Support - Full Stack Setup Guide

This guide will help you set up both the frontend and backend services.

## Architecture

- **Frontend**: React + Vite + TypeScript (Port 5173)
- **Backend**: Express + TypeScript REST API (Port 3001)
- **AI Orchestration**: LangChain.js
- **AI Model**: Claude 3.5 Sonnet (Anthropic)

## Prerequisites

- Node.js 18+ and Yarn
- Anthropic API key (get from https://console.anthropic.com/)

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
yarn install

# Configure environment
# Edit server/.env and add your API key:
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Start development server
yarn dev
```

Backend will run at: `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate back to root directory
cd ..

# Install dependencies (if not already done)
yarn install

# Start development server
yarn dev
```

Frontend will run at: `http://localhost:5173`

### 3. Verify Setup

1. Backend health check: `http://localhost:3001/api/health`
2. Open frontend: `http://localhost:5173`
3. Try sending a chat message

## Environment Variables

### Backend (`server/.env`)
```env
PORT=3001
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLIENT_URL=http://localhost:5173
```

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3001
```

## Production Build

### Backend
```bash
cd server
yarn build
yarn start
```

### Frontend
```bash
yarn build
yarn preview
```

## Troubleshooting

### CORS Issues
- Ensure backend `CLIENT_URL` matches your frontend URL
- Check that backend is running before starting frontend

### API Key Issues
- Verify API key is valid and not expired
- Check that `.env` file is in the `server/` directory
- Restart backend after changing environment variables

### Connection Issues
- Verify both services are running
- Check firewall settings
- Ensure ports 3001 and 5173 are available

## Development Workflow

1. Start backend first: `cd server && yarn dev`
2. Start frontend in another terminal: `yarn dev`
3. Make changes - both services have hot reload enabled

## API Documentation

See `server/README.md` for detailed API documentation.
