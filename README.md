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

**Prerequisites:** Node.js 18+ and Yarn

### 1. Backend Setup

```bash
cd server
yarn install
# Edit server/.env and add your Anthropic API key
# ANTHROPIC_API_KEY=your_key_here
yarn dev
```

### 2. Frontend Setup

```bash
# In root directory
yarn install
yarn dev
```

For detailed setup instructions, see [SETUP.md](SETUP.md)

## Features

- Real-time streaming chat responses
- Intent classification (product queries, escalations, off-topic)
- Financial product knowledge base
- Conversation history with local storage
- Human agent escalation workflow

## Development

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3001`
- Both services support hot reload
# smart-support-agent
