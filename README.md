# MoneyHero AI Support - Full Stack Application

An AI-powered customer support chat application for financial products using Claude AI with LangChain.js orchestration.

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Backend**: Express + TypeScript REST API
- **AI Orchestration**: LangChain.js
- **AI Model**: Claude 3.5 Sonnet (Anthropic)

## Quick Start

### ☁️ Deploy to Vercel (Recommended for Production)

**One-click deployment:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/moneyhero-ai-support)

Or deploy via CLI:

```bash
vercel
```

**Setup Guide:** See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

---

### 🐳 Docker (Local Development)

**One command to run everything:**

```bash
docker-compose up
```

Access the app at http://localhost

**Requirements:** Docker Desktop installed
**Setup Guide:** See [DOCKER_README.md](DOCKER_README.md)

---

### 🛠️ Manual Setup

**Prerequisites:** Node.js 18+ and Yarn

#### 1. Backend Setup

```bash
cd server
yarn install
# Edit server/.env and add your API keys
# ANTHROPIC_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
yarn dev
```

#### 2. Frontend Setup

```bash
# In root directory
yarn install
yarn dev
```

**Detailed Instructions:** See [QUICK_START.md](QUICK_START.md)

## Features

- 🤖 **Real-time AI Chat** - Streaming responses with Claude 3.5 Sonnet
- 🔍 **RAG (Retrieval-Augmented Generation)** - Vector database with semantic search
- 📚 **Smart Knowledge Base** - OpenAI embeddings on markdown documentation
- 🎯 **Intent Classification** - Automatic routing (queries, escalations, off-topic)
- 💬 **Conversation History** - Persistent chat with local storage
- 🚀 **Docker Support** - One-command deployment
- 🎨 **Modern UI** - React with markdown rendering and real-time updates

## Development

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3001`
- Both services support hot reload

## Testing

### Run Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage
```

### Test Coverage

- **32 passing tests** covering components and services
- React Testing Library for component tests
- Jest for unit and integration tests
- See [TESTING.md](TESTING.md) for complete testing guide

## Deployment

### Vercel (Recommended)

Deploy to Vercel with one command:

```bash
vercel
```

**Features**:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless Functions
- ✅ Zero configuration
- ✅ Preview deployments

**Guide**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

### Docker

Deploy using Docker Compose:

```bash
docker-compose up -d
```

**Guide**: [DOCKER_README.md](DOCKER_README.md)

### Environment Variables

Required for deployment:
- `ANTHROPIC_API_KEY` - Claude AI API key
- `OPENAI_API_KEY` - OpenAI embeddings API key

See `.env.vercel.example` for configuration.

# smart-support-agent
