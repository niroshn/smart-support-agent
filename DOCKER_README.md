# Docker Setup - MoneyHero AI Support

Run the entire MoneyHero AI Support application (frontend + backend) with a single command using Docker Compose.

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### 1. Configure Environment Variables

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Anthropic API Key (get from https://console.anthropic.com/)
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-your-key-here
```

### 2. Start the Application

```bash
docker-compose up
```

Or run in detached mode (background):

```bash
docker-compose up -d
```

### 3. Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

### 4. Stop the Application

```bash
docker-compose down
```

## What Gets Started

When you run `docker-compose up`, two services start:

### 1. Backend Service (`moneyhero-backend`)
- **Port:** 3001
- **Technology:** Node.js + Express + TypeScript
- **Features:**
  - Claude 3.5 Sonnet AI integration
  - Vector database with OpenAI embeddings
  - RAG (Retrieval-Augmented Generation)
  - Server-Sent Events (SSE) streaming
- **Health Check:** Automatic health monitoring
- **Startup Time:** ~30-40 seconds (includes vector store initialization)

### 2. Frontend Service (`moneyhero-frontend`)
- **Port:** 80
- **Technology:** React + Vite + Nginx
- **Features:**
  - Modern chat interface
  - Real-time streaming responses
  - Markdown rendering
- **Depends On:** Backend (waits for backend to be healthy)
- **Startup Time:** ~5-10 seconds

## Docker Architecture

```
┌─────────────────────────────────────────────┐
│         Docker Compose Network              │
│                                             │
│  ┌────────────────┐    ┌──────────────┐   │
│  │   Frontend     │    │   Backend    │   │
│  │   (Nginx)      │───▶│  (Node.js)   │   │
│  │   Port: 80     │    │  Port: 3001  │   │
│  └────────────────┘    └──────────────┘   │
│                              │              │
│                              ▼              │
│                         ┌─────────┐         │
│                         │  /docs  │         │
│                         │ (volume)│         │
│                         └─────────┘         │
└─────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    User Browser        API Requests
```

## File Structure

```
.
├── docker-compose.yml         # Orchestration configuration
├── .env                       # Environment variables (not in git)
├── .env.example              # Template for environment variables
├── Dockerfile                # Frontend Docker image
├── nginx.conf                # Nginx configuration for frontend
├── .dockerignore             # Files to exclude from frontend build
├── server/
│   ├── Dockerfile           # Backend Docker image
│   └── .dockerignore        # Files to exclude from backend build
└── docs/                    # Knowledge base (mounted as volume)
```

## Docker Commands

### Build and Start

```bash
# Build images and start services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop and Clean Up

```bash
# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove everything including images
docker-compose down --rmi all -v
```

### Rebuild

```bash
# Rebuild a specific service
docker-compose build backend
docker-compose build frontend

# Rebuild all services
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache
```

### Monitor

```bash
# Check service status
docker-compose ps

# Check resource usage
docker stats

# Inspect a service
docker-compose exec backend sh
docker-compose exec frontend sh
```

## Environment Variables

### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ANTHROPIC_API_KEY` | Claude API key | ✅ Yes | - |
| `OPENAI_API_KEY` | OpenAI embeddings key | ✅ Yes | - |
| `PORT` | Backend server port | No | 3001 |
| `CLIENT_URL` | Frontend URL for CORS | No | http://localhost |
| `NODE_ENV` | Node environment | No | production |

### Frontend Build Arguments

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:3001 |

## Volumes

### Mounted Volumes

The `docs` folder is mounted as a read-only volume:

```yaml
volumes:
  - ./docs:/app/docs:ro
```

**Benefits:**
- Update documentation without rebuilding
- Add new documents and restart backend
- Shared across all containers

**To update docs:**
1. Edit files in `docs/` folder
2. Restart backend: `docker-compose restart backend`
3. Vector store re-initializes with new content

## Networking

Services communicate via a custom bridge network (`moneyhero-network`):

- **Internal DNS:** Services can reference each other by name
  - Backend: `http://backend:3001`
  - Frontend: `http://frontend:80`
- **External Access:** Only exposed ports are accessible from host

## Health Checks

### Backend Health Check
```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Frontend Health Check
```bash
curl http://localhost
```

**Expected:** HTML page loads successfully

### Docker Health Status
```bash
docker-compose ps
```

**Healthy Services:**
```
NAME                 STATUS
moneyhero-backend    Up (healthy)
moneyhero-frontend   Up (healthy)
```

## Troubleshooting

### Backend Won't Start

**Problem:** Backend container exits or restarts continuously

**Solutions:**
1. Check API keys are set:
   ```bash
   docker-compose exec backend env | grep API_KEY
   ```
2. Check logs:
   ```bash
   docker-compose logs backend
   ```
3. Common issues:
   - Missing `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
   - Invalid API keys
   - Port 3001 already in use

### Frontend Can't Connect to Backend

**Problem:** Frontend loads but can't fetch data

**Solutions:**
1. Verify backend is healthy:
   ```bash
   curl http://localhost:3001/api/health
   ```
2. Check CORS settings in backend
3. Check browser console for errors
4. Ensure backend started before frontend (health check should handle this)

### Port Already in Use

**Problem:** Port 80 or 3001 is already in use

**Solutions:**
1. **Option 1:** Stop the conflicting service
   ```bash
   # Find process using port
   lsof -ti:80
   lsof -ti:3001

   # Kill the process
   kill -9 <PID>
   ```

2. **Option 2:** Change ports in `docker-compose.yml`
   ```yaml
   ports:
     - "8080:80"      # Frontend on port 8080
     - "3002:3001"    # Backend on port 3002
   ```

### Slow Startup

**Problem:** Backend takes long to start

**Expected:** Backend startup includes:
1. Loading markdown files (~1-2s)
2. Creating embeddings (~20-30s for 11 files)
3. Starting server (~1-2s)

**Total:** ~30-40 seconds is normal

**To speed up:**
- Use a persistent vector store (future enhancement)
- Cache embeddings between restarts

### Out of Memory

**Problem:** Docker runs out of memory

**Solution:** Increase Docker memory allocation:
- **Docker Desktop:** Settings → Resources → Memory (recommend 4GB+)

### Build Fails

**Problem:** `docker-compose build` fails

**Solutions:**
1. **Clear cache:**
   ```bash
   docker-compose build --no-cache
   ```

2. **Check disk space:**
   ```bash
   docker system df
   docker system prune -a  # Clean up (warning: removes all unused images)
   ```

3. **Check .dockerignore:**
   Ensure `node_modules` is excluded

## Production Deployment

### For Production Use

1. **Use a reverse proxy** (Nginx/Traefik) for HTTPS
2. **Set production environment:**
   ```yaml
   environment:
     - NODE_ENV=production
   ```
3. **Use secrets management** instead of .env files
4. **Add resource limits:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1'
         memory: 1024M
   ```
5. **Use persistent vector store** (Pinecone/Chroma)
6. **Enable logging** to external service
7. **Add monitoring** (Prometheus/Grafana)

### Docker Compose Production Example

```yaml
services:
  backend:
    image: moneyhero-backend:latest
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Development vs Production

### Development (Current Setup)
- ✅ Easy to start: `docker-compose up`
- ✅ Hot reload with volume mounts (optional)
- ✅ Detailed logs
- ✅ No HTTPS required
- ⚠️ In-memory vector store (resets on restart)

### Production (Recommended Changes)
- Use external vector database (Pinecone/Chroma)
- Add HTTPS/SSL certificates
- Use environment secrets
- Enable auto-restart policies
- Add monitoring and logging
- Use CDN for frontend static files
- Set resource limits
- Use health checks with alerts

## Advanced Usage

### Custom Network

```bash
# Create custom network
docker network create moneyhero-custom

# Use in docker-compose.yml
networks:
  default:
    external:
      name: moneyhero-custom
```

### Volume Backup

```bash
# Backup docs volume
docker run --rm -v $(pwd)/docs:/source -v $(pwd)/backup:/backup alpine tar czf /backup/docs-backup.tar.gz -C /source .

# Restore
docker run --rm -v $(pwd)/docs:/dest -v $(pwd)/backup:/backup alpine tar xzf /backup/docs-backup.tar.gz -C /dest
```

### Multi-Stage Caching

Both Dockerfiles use multi-stage builds for:
- **Smaller images:** Only production dependencies
- **Faster builds:** Cached dependency layers
- **Security:** No dev tools in production image

## FAQ

### Q: Do I need to rebuild after changing .env?

**A:** No, just restart:
```bash
docker-compose down
docker-compose up
```

### Q: How do I add new documents?

**A:** Add `.md` files to `docs/` folder and restart backend:
```bash
docker-compose restart backend
```

### Q: Can I run only the backend or frontend?

**A:** Yes:
```bash
# Only backend
docker-compose up backend

# Only frontend
docker-compose up frontend
```

### Q: How do I update to the latest code?

**A:**
```bash
git pull
docker-compose down
docker-compose build
docker-compose up
```

### Q: How much disk space do I need?

**A:**
- Frontend image: ~150MB
- Backend image: ~300MB
- Total: ~500MB + docs

### Q: Can I use Docker Hub images?

**A:** Yes, push to Docker Hub:
```bash
docker tag moneyhero-backend:latest your-username/moneyhero-backend:latest
docker push your-username/moneyhero-backend:latest
```

Then update `docker-compose.yml`:
```yaml
services:
  backend:
    image: your-username/moneyhero-backend:latest
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)

## Support

If you encounter issues:
1. Check logs: `docker-compose logs`
2. Verify health: `docker-compose ps`
3. Check environment: `docker-compose config`
4. Review this guide's troubleshooting section

---

**That's it!** Your entire application runs with one command: `docker-compose up` 🐳
