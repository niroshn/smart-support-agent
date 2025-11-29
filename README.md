<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# MoneyHero AI Support - Full Stack Application

An AI-powered customer support chat application for financial products using Claude AI with LangChain.js orchestration.

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Backend**: Express + TypeScript REST API
- **AI Orchestration**: LangChain.js
- **AI Model**: Claude 3.5 Sonnet (Anthropic)

## Quick Start

### 🐳 Docker (Recommended)

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
# smart-support-agent
