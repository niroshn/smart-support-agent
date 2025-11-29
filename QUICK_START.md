# Quick Start Guide - MoneyHero AI Support

## 🚀 Start with Docker (Recommended)

### One-Command Setup

```bash
# 1. Ensure .env file exists with your API keys
# (Already configured with your keys)

# 2. Start everything
docker-compose up

# That's it! 🎉
```

**Access:**
- Frontend: http://localhost
- Backend: http://localhost:3001

**Stop:**
```bash
docker-compose down
```

---

## 🛠️ Start Manually (Development)

### Backend

```bash
cd server
yarn install
yarn dev
```

**Runs on:** http://localhost:3001

### Frontend

```bash
# In new terminal, from project root
yarn install
yarn dev
```

**Runs on:** http://localhost:5173

---

## 📋 Prerequisites

### Docker Setup
- Docker Desktop installed
- API keys in `.env` file (already configured)

### Manual Setup
- Node.js 20+
- Yarn 4.9.1+
- API keys:
  - `ANTHROPIC_API_KEY` in `server/.env`
  - `OPENAI_API_KEY` in `server/.env`
  - `VITE_API_URL` in `.env.local`

---

## ✅ Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:3001/api/health
```

**Expected:**
```json
{"status":"ok","timestamp":"..."}
```

### 2. Test Chat
Open http://localhost and ask:
> "What credit cards do you offer?"

### 3. Check Vector Store
Backend logs should show:
```
✅ Vector store initialized successfully
📄 Found 11 markdown files
✂️  Split into 44 chunks
```

---

## 🐛 Troubleshooting

### Docker Issues

**Backend won't start:**
```bash
docker-compose logs backend
```
- Check API keys are set in `.env`
- Ensure port 3001 is free

**Frontend can't connect:**
```bash
# Check backend is running
curl http://localhost:3001/api/health
```

### Manual Issues

**Port conflicts:**
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

**Dependencies:**
```bash
# Backend
cd server && yarn install

# Frontend
yarn install
```

---

## 📚 Next Steps

- **Add documents:** Place `.md` files in `docs/` folder
- **Update knowledge:** Restart backend to re-index
- **Deploy:** See `DOCKER_README.md` for production setup
- **Learn more:** See `server/VECTOR_STORE_GUIDE.md` for RAG details

---

## 🎯 Common Commands

### Docker
```bash
docker-compose up           # Start all services
docker-compose up -d        # Start in background
docker-compose down         # Stop all services
docker-compose logs -f      # View logs
docker-compose restart      # Restart services
```

### Development
```bash
# Backend
cd server
yarn dev                    # Start dev server
yarn build                  # Build for production
yarn lint                   # Lint code

# Frontend
yarn dev                    # Start dev server
yarn build                  # Build for production
yarn lint                   # Lint code
```

---

**Need help?** Check `DOCKER_README.md` for detailed documentation.
