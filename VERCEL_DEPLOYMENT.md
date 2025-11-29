# Vercel Deployment Guide - MoneyHero AI Support

Deploy your full-stack MoneyHero AI Support application to Vercel with frontend and backend together.

## Architecture

```
Vercel Deployment
├── Frontend (Static) - Vite build → /dist
├── Backend (Serverless) - /api functions
│   ├── /api/chat.ts → Handles chat requests
│   └── /api/health.ts → Health check endpoint
└── Docs (Static) - /docs → Mounted for vector store
```

## Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **API Keys**:
   - Anthropic API Key (for Claude)
   - OpenAI API Key (for embeddings)
3. **GitHub Account** (recommended for automatic deployments)

## Quick Deploy

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Configure project settings (see below)
   - Deploy!

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Environment Variables

### Required Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Your Anthropic API key for Claude |
| `OPENAI_API_KEY` | `sk-proj-...` | Your OpenAI API key for embeddings |

### How to Add Environment Variables

#### Via Vercel Dashboard

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Your API key
   - **Environments**: Check all (Production, Preview, Development)
4. Click **Save**
5. Redeploy for changes to take effect

#### Via Vercel CLI

```bash
# Add environment variable
vercel env add ANTHROPIC_API_KEY

# Pull environment variables to local
vercel env pull .env.local
```

## Project Configuration

### vercel.json

The project includes a `vercel.json` configuration file:

```json
{
  "version": 2,
  "buildCommand": "yarn build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x",
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

### Build Settings

When setting up in Vercel dashboard:

- **Framework Preset**: Vite
- **Build Command**: `yarn build`
- **Output Directory**: `dist`
- **Install Command**: `yarn install`
- **Node Version**: 20.x

## API Routes (Serverless Functions)

### Available Endpoints

After deployment, your API will be available at:

- **Chat**: `https://your-app.vercel.app/api/chat`
- **Health**: `https://your-app.vercel.app/api/health`

### Function Configuration

Each API route is a serverless function with:
- **Runtime**: Node.js 20
- **Memory**: 1024 MB
- **Timeout**: 60 seconds
- **Region**: Automatically distributed globally

## Deployment Process

### What Happens During Deployment

1. **Install Dependencies**:
   ```bash
   yarn install
   ```

2. **Build Frontend**:
   ```bash
   yarn build  # Builds Vite app to /dist
   ```

3. **Deploy Serverless Functions**:
   - `/api/chat.ts` → Serverless function
   - `/api/health.ts` → Serverless function

4. **Deploy Static Assets**:
   - Frontend files from `/dist`
   - Documentation from `/docs`

### Deployment Times

- **Initial deployment**: ~3-5 minutes
- **Subsequent deployments**: ~1-2 minutes
- **Preview deployments**: ~1-2 minutes

## Vector Store Considerations

### Current Implementation

The vector store uses **MemoryVectorStore** which:
- ✅ Initializes on first request
- ✅ Cached within serverless function instance
- ⚠️ Resets on cold starts (every ~5-10 minutes)
- ⚠️ Not ideal for production at scale

### Cold Start Impact

On first request or after inactivity:
1. Serverless function cold starts (~2-3 seconds)
2. Vector store initializes (~20-30 seconds)
3. **Total first request: ~30-35 seconds**

Subsequent requests (warm function):
- **Response time: ~2-4 seconds** ✅

### Production Recommendations

For production, migrate to a persistent vector database:

#### Option 1: Pinecone (Recommended)

```typescript
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const vectorStore = await PineconeStore.fromExistingIndex(
  embeddings,
  { pineconeIndex: pinecone.Index('moneyhero') }
);
```

**Benefits**:
- No cold start delays
- Instant queries
- Scalable
- Free tier available

#### Option 2: Supabase Vector

```typescript
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabase,
  tableName: 'documents',
});
```

#### Option 3: Vercel KV + Upstash

Store pre-computed embeddings in Vercel KV for instant access.

## Custom Domain

### Add Custom Domain

1. Go to Project Settings → **Domains**
2. Add your domain: `chat.yourdomain.com`
3. Configure DNS:
   - **Type**: CNAME
   - **Name**: chat
   - **Value**: cname.vercel-dns.com
4. Wait for DNS propagation (~1-5 minutes)

### SSL Certificate

- Automatically provisioned by Vercel
- Free Let's Encrypt certificate
- Auto-renewal

## Monitoring & Logs

### View Logs

1. Go to your project on Vercel
2. Click **Deployments** → Select deployment
3. Click **Function Logs**

Or via CLI:
```bash
vercel logs
vercel logs --follow  # Real-time logs
```

### Analytics

Vercel provides built-in analytics:
- Page views
- Unique visitors
- Top pages
- Performance metrics

Enable in: Project Settings → **Analytics**

## Performance Optimization

### Edge Caching

Frontend static assets are automatically cached at the edge for fast global delivery.

### Function Optimization

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,        // Increase for faster vector operations
      "maxDuration": 60      // Max 60s for hobby, 300s for pro
    }
  }
}
```

### Cold Start Reduction

1. **Use Vercel Pro**: Lower cold start times
2. **Keep functions warm**: Implement ping endpoint
3. **Optimize imports**: Lazy load heavy dependencies

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Working

**Problem**: API keys not available in functions

**Solution**:
- Check variable names match exactly
- Ensure selected for all environments (Production, Preview, Development)
- Redeploy after adding variables

#### 2. Vector Store Initialization Timeout

**Problem**: First request times out after 60 seconds

**Solution**:
- Reduce document count
- Use persistent vector store (Pinecone)
- Increase function timeout (requires Vercel Pro)

#### 3. Function Size Limit

**Problem**: `Error: Function size exceeds limit`

**Solution**:
```json
{
  "functions": {
    "api/**/*.ts": {
      "includeFiles": "docs/**"  // Only include necessary files
    }
  }
}
```

#### 4. CORS Errors

**Problem**: Frontend can't connect to API

**Solution**:
The API routes automatically handle CORS. Ensure your frontend makes requests to the same domain.

#### 5. Build Failures

**Problem**: Build fails on Vercel

**Check**:
```bash
# Test build locally first
yarn build

# Check build logs on Vercel
vercel logs --build
```

### Debug Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Start local development
vercel dev

# Test serverless functions
curl http://localhost:3000/api/health
```

## CI/CD Workflow

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Preview Deployments

Each PR gets a unique preview URL:
- `https://your-app-git-feature-username.vercel.app`
- Share with team for review
- Automatically deleted after merge

### Deployment Protection

Enable in Settings → **Deployment Protection**:
- Password protection
- Vercel Authentication
- IP allowlist

## Cost Considerations

### Vercel Pricing

**Hobby (Free)**:
- 100 GB bandwidth
- Unlimited deployments
- 100 GB-hours serverless function execution
- 1000 serverless function invocations/day

**Pro ($20/month)**:
- 1000 GB bandwidth
- Unlimited serverless invocations
- Advanced analytics
- Faster builds
- Team collaboration

### OpenAI Costs

- **Embeddings**: ~$0.0006 per cold start (44 chunks)
- **Claude**: ~$0.0048 per query

**Estimated monthly cost** (1000 queries):
- OpenAI: ~$5
- Anthropic: ~$5
- **Total: ~$10/month**

## Production Checklist

Before going live:

- [ ] Add custom domain
- [ ] Set all environment variables
- [ ] Test deployment thoroughly
- [ ] Set up monitoring/alerts
- [ ] Configure error tracking (Sentry)
- [ ] Migrate to persistent vector store (Pinecone)
- [ ] Enable Vercel Analytics
- [ ] Add rate limiting (Vercel Edge Config)
- [ ] Set up backup API keys
- [ ] Document API endpoints
- [ ] Add CHANGELOG.md
- [ ] Set up status page

## Rollback

If deployment has issues:

### Via Dashboard

1. Go to **Deployments**
2. Find previous working deployment
3. Click **⋯** → **Promote to Production**

### Via CLI

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Advanced Configuration

### Redirects

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

### Headers

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

### Environment-specific Config

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "@anthropic_api_key_production"
  },
  "build": {
    "env": {
      "ANTHROPIC_API_KEY": "@anthropic_api_key_preview"
    }
  }
}
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/domains)
- [Analytics](https://vercel.com/docs/analytics)

## Support

- **Vercel Community**: [github.com/vercel/community](https://github.com/vercel/community)
- **Vercel Discord**: [vercel.com/discord](https://vercel.com/discord)
- **Status Page**: [vercel-status.com](https://vercel-status.com)

---

**Your app is ready for deployment!** 🚀

Run `vercel` to deploy now, or push to GitHub for automatic deployments.
