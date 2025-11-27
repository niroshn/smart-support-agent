# MoneyHero AI Support Backend

Express + TypeScript backend service for the MoneyHero AI Support chat application.

## Features

- REST API with chat endpoint
- Server-Sent Events (SSE) for streaming responses
- **LangChain.js** orchestration layer
- **Claude (Anthropic)** AI integration
- CORS enabled for frontend communication
- TypeScript for type safety

## Setup

### 1. Install Dependencies

```bash
cd server
yarn install
```

### 2. Configure Environment

Edit `server/.env` and add your Anthropic API key:

```env
PORT=3001
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Get your API key from: https://console.anthropic.com/

### 3. Run Development Server

```bash
yarn dev
```

The server will start at `http://localhost:3001`

### 4. Build for Production

```bash
yarn build
yarn start
```

## API Endpoints

### POST /api/chat

Send a chat message and receive a streaming response.

**Request:**
```json
{
  "messages": [
    {
      "id": "1",
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "newMessage": "Tell me about credit cards"
}
```

**Response:** Server-Sent Events stream

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Project Structure

```
server/
├── src/
│   ├── data/
│   │   └── products.ts       # Product knowledge base
│   ├── routes/
│   │   └── chat.ts           # Chat API routes
│   ├── services/
│   │   └── aiService.ts      # LangChain + Claude integration
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── server.ts             # Express app entry point
├── .env                      # Environment variables
├── package.json
└── tsconfig.json
```
