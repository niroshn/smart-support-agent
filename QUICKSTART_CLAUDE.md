# Quick Start Guide - Claude Version

## Prerequisites
- Node.js 18+ and Yarn installed
- Anthropic API key

## Get Your API Key

1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-`)

## Setup (5 minutes)

### Step 1: Backend Setup
```bash
cd server
yarn install
```

### Step 2: Configure API Key
Edit `server/.env`:
```env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 3: Start Backend
```bash
yarn dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📡 API available at http://localhost:3001/api
```

### Step 4: Start Frontend (New Terminal)
```bash
# In root directory
yarn dev
```

Visit: http://localhost:5173

## Test the Application

Try these prompts:
1. "What credit cards do you offer?"
2. "Compare your two credit cards"
3. "I need a personal loan"
4. "I want to speak to a human" (tests escalation)

## Architecture Overview

```
Frontend (React) → Backend API (Express) → LangChain → Claude 3.5 Sonnet
```

## What's Using LangChain?

### 1. Intent Classification
```typescript
const chain = classificationPrompt.pipe(model).pipe(parser);
const intent = await chain.invoke({ query: newMessage });
```

### 2. Chat Response
```typescript
const chain = chatPrompt.pipe(model).pipe(parser);
const stream = await chain.stream({
  chat_history: chatHistory,
  input: newMessage
});
```

## LangChain Benefits

- ✅ **Standardized API** - Easy to switch AI providers
- ✅ **Prompt Templates** - Reusable, maintainable prompts
- ✅ **Streaming** - Built-in streaming support
- ✅ **Message History** - Automatic conversation management
- ✅ **Extensible** - Add tools, agents, memory easily

## File Structure

```
server/src/
├── services/
│   └── aiService.ts          # LangChain + Claude integration
├── routes/
│   └── chat.ts               # REST API endpoint
├── data/
│   └── products.ts           # Knowledge base
└── server.ts                 # Express app
```

## Key Code Snippets

### Initialize Claude with LangChain
```typescript
import { ChatAnthropic } from "@langchain/anthropic";

const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20241022",
  anthropicApiKey: apiKey,
  temperature: 0,
  streaming: true,
});
```

### Create Prompt Template
```typescript
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", systemMessage],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"]
]);
```

### Build Chain
```typescript
import { StringOutputParser } from "@langchain/core/output_parsers";

const parser = new StringOutputParser();
const chain = chatPrompt.pipe(model).pipe(parser);
```

### Stream Response
```typescript
const stream = await chain.stream({
  chat_history: chatHistory,
  input: newMessage
});

for await (const chunk of stream) {
  yield chunk;
}
```

## Troubleshooting

### Error: ANTHROPIC_API_KEY not configured
**Solution**: Check that API key is in `server/.env` and restart server

### Error: Cannot find module '@langchain/anthropic'
**Solution**: Run `yarn install` in server directory

### Port 3001 already in use
**Solution**: Kill the process using port 3001
```bash
lsof -ti:3001 | xargs kill -9
```

### Frontend can't connect to backend
**Solution**: Ensure backend is running first at http://localhost:3001

## API Endpoints

### POST /api/chat
Send a chat message, receive streaming response

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
  "newMessage": "What credit cards do you offer?"
}
```

**Response:** Server-Sent Events stream

### GET /api/health
Health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Next Steps

1. **Add RAG**: Use LangChain vector stores for semantic search
2. **Add Tools**: Give Claude access to external APIs
3. **Add Memory**: Implement conversation memory across sessions
4. **Add Agents**: Let Claude make autonomous decisions
5. **Multi-Model**: Use different models for different tasks

## Resources

- [Anthropic API Docs](https://docs.anthropic.com/)
- [LangChain.js Docs](https://js.langchain.com/)
- [Claude Model Info](https://docs.anthropic.com/en/docs/about-claude/models)
- [LangChain Anthropic Integration](https://js.langchain.com/docs/integrations/chat/anthropic)

## Cost Estimate

Claude 3.5 Sonnet pricing:
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

Typical chat interaction:
- ~500 tokens input (knowledge base + conversation)
- ~200 tokens output
- Cost: ~$0.0045 per interaction

## Support

Questions? Check:
- [MIGRATION_TO_CLAUDE.md](MIGRATION_TO_CLAUDE.md) - Detailed migration guide
- [SETUP.md](SETUP.md) - Full setup instructions
- [server/README.md](server/README.md) - Backend documentation
