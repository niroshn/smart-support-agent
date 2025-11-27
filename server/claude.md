# MoneyHero Backend - Context for Claude

## Backend Overview

Express + TypeScript backend service that provides a REST API for AI-powered chat using Claude 3.5 Sonnet with LangChain.js orchestration.

## Architecture

```
Express Server (Port 3001)
    ↓
Chat Routes (/api/chat, /api/health)
    ↓
AI Service (aiService.ts)
    ↓
LangChain.js Chains
    ↓
Claude 3.5 Sonnet API
```

## Tech Stack

- **Framework**: Express 4.18.2
- **Language**: TypeScript 5.8.2 (ES Modules)
- **AI SDK**: @anthropic-ai/sdk 0.27.0
- **Orchestration**: LangChain.js 0.3.0
- **Runtime**: Node.js with tsx for development
- **Linter**: Biome 2.3.7
- **CORS**: cors 2.8.5

## File Structure

```
server/
├── src/
│   ├── services/
│   │   └── aiService.ts       # LangChain + Claude integration
│   ├── routes/
│   │   └── chat.ts            # Express routes
│   ├── data/
│   │   └── products.ts        # Knowledge base (4 products)
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── server.ts              # Express app entry point
├── dist/                      # Compiled JavaScript (gitignored)
├── node_modules/              # Dependencies
├── biome.json                 # Linter/formatter config
├── tsconfig.json              # TypeScript config
├── package.json               # Dependencies and scripts
├── .env                       # Environment variables (gitignored)
└── README.md                  # Backend documentation
```

## Key Files Explained

### src/server.ts
Express application setup:
- CORS configuration for frontend
- JSON body parser
- Route mounting
- Server startup on port 3001

### src/routes/chat.ts
API endpoints:
- **POST /api/chat**: Main chat endpoint with SSE streaming
- **GET /api/health**: Health check endpoint

Request validation and error handling.

### src/services/aiService.ts
Core AI logic with three main functions:

1. **Intent Classification Chain**
   - Uses Claude to classify user intent
   - Returns: ESCALATE, OFF_TOPIC, or ANSWER

2. **Static Response Streams**
   - Escalation message
   - Off-topic message
   - Simulates streaming for consistency

3. **Main Chat Chain**
   - Constructs prompt with knowledge base
   - Manages conversation history
   - Streams Claude responses

### src/data/products.ts
Static knowledge base:
- 2 credit cards
- 2 personal loans
- Product features, fees, eligibility

### src/types/index.ts
TypeScript interfaces:
- Message interface
- ChatRequest interface
- StreamingResponse interface

## LangChain Components Used

### ChatAnthropic
```typescript
const model = new ChatAnthropic({
  model: "claude-3-5-sonnet-20241022",
  anthropicApiKey: apiKey,
  temperature: 0,
  streaming: true,
});
```

### Prompt Templates
```typescript
const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", systemMessage],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"]
]);
```

### Output Parser
```typescript
const parser = new StringOutputParser();
```

### Chains
```typescript
const chain = chatPrompt.pipe(model).pipe(parser);
```

### Message Conversion
```typescript
const chatHistory = convertToLangChainMessages(currentHistory);
```

## Environment Variables

Required in `.env`:
```env
PORT=3001                          # Server port
ANTHROPIC_API_KEY=sk-ant-...      # Anthropic API key
CLIENT_URL=http://localhost:5173  # Frontend URL for CORS
```

## API Specification

### POST /api/chat

**Request Body:**
```typescript
{
  messages: Message[];      // Conversation history
  newMessage: string;       // New user message
}
```

**Response:** Server-Sent Events stream

Event types:
```typescript
// 1. Escalation status (first event)
data: {"type":"escalation","isEscalation":boolean}

// 2. Content chunks (streaming)
data: {"type":"chunk","content":string}

// 3. Completion signal
data: {"type":"done"}

// 4. Error (if occurs)
data: {"type":"error","message":string}
```

**Status Codes:**
- 200: Success (streaming)
- 400: Bad request (missing fields)
- 500: Server error

### GET /api/health

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Streaming Flow

1. Client sends POST to `/api/chat`
2. Server validates request
3. Server sets SSE headers
4. Server invokes AI service
5. AI service streams response
6. Server forwards chunks as SSE events
7. Server sends completion event
8. Connection closes

## Error Handling

### Request Validation
```typescript
if (!newMessage || !messages) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

### API Key Check
```typescript
if (!apiKey) {
  return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
}
```

### Stream Errors
```typescript
try {
  // streaming...
} catch (error) {
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream error' })}\n\n`);
    res.end();
  }
}
```

### Service Errors
```typescript
catch (error) {
  console.error("Claude API Error:", error);
  return {
    stream: stringToStream("Connection issue. Please try again."),
    isEscalation: false,
  };
}
```

## Development Commands

```bash
# Install dependencies
yarn install

# Start dev server (with hot reload)
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint with Biome
yarn lint

# Format with Biome
yarn format

# Type check
npx tsc --noEmit
```

## TypeScript Configuration

Key settings in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**Important**: ES Modules require `.js` extensions in imports:
```typescript
import { sendMessageToAgent } from '../services/aiService.js';  // ✅
import { sendMessageToAgent } from '../services/aiService';      // ❌
```

## Biome Configuration

Located in `biome.json`:
- Linting enabled with recommended rules
- Formatting with 2-space indentation
- Single quotes, semicolons required
- 100 character line width
- Console.log allowed (backend needs logging)

## Common Modifications

### Adding New Product
1. Edit `src/data/products.ts`
2. Add to `KNOWLEDGE_BASE` array
3. No restart needed (dev mode auto-reloads)

### Changing AI Model
Edit `src/services/aiService.ts`:
```typescript
const model = new ChatAnthropic({
  model: "claude-3-opus-20240229",  // or other model
  // ...
});
```

Available models:
- `claude-3-5-sonnet-20241022` (current, balanced)
- `claude-3-opus-20240229` (most capable, expensive)
- `claude-3-sonnet-20240229` (fast, cheaper)
- `claude-3-haiku-20240307` (fastest, cheapest)

### Adjusting Temperature
```typescript
const model = new ChatAnthropic({
  temperature: 0,    // Deterministic (current)
  // temperature: 0.7,  // More creative
  // ...
});
```

### Modifying System Prompt
Edit `systemMessage` in `src/services/aiService.ts`:
```typescript
const systemMessage = `You are the MoneyHero AI Assistant.
Use the provided Knowledge Base to answer the User's Question.

Knowledge Base:
${productContext}

Guidelines:
- Your custom guidelines here
`;
```

### Adding New Intent Type
1. Update classification prompt in `aiService.ts`
2. Add new condition:
```typescript
if (intent.includes("NEW_INTENT")) {
  return {
    stream: stringToStream("Your response here"),
    isEscalation: false,
  };
}
```

### Changing Port
Edit `.env`:
```env
PORT=8080  # New port
```

## Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3001/api/health

# Chat request
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [],
    "newMessage": "What credit cards do you offer?"
  }'
```

### Test Scenarios
1. **Product Query**: "Tell me about credit cards"
2. **Comparison**: "Compare CashBack Plus and TravelElite"
3. **Escalation**: "I want to speak to a human"
4. **Off-topic**: "How do I cook pasta?"
5. **Unknown Product**: "Tell me about the Premium Gold card"

## Debugging

### Enable Verbose Logging
Add to `aiService.ts`:
```typescript
console.log('Intent:', intent);
console.log('Chat history length:', chatHistory.length);
```

### Check API Key
```bash
cd server
cat .env | grep ANTHROPIC_API_KEY
```

### Monitor Requests
```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Check Port Availability
```bash
lsof -ti:3001
```

## Performance Considerations

### Response Times
- Intent classification: ~500-800ms
- First chunk: ~600ms-1s
- Streaming: Real-time
- Total interaction: ~2-4s

### Token Usage
Typical request:
- Input: ~500 tokens (knowledge base + history)
- Output: ~200 tokens
- Cost: ~$0.0045 per interaction

### Optimization Strategies
1. **Cache**: Cache common queries
2. **Streaming**: Already implemented
3. **Model Selection**: Use cheaper models for simple queries
4. **Knowledge Base**: Minimize size or use RAG
5. **Rate Limiting**: Prevent abuse

## Security Best Practices

1. **API Key**: Never commit `.env` to git
2. **CORS**: Whitelist specific origins in production
3. **Input Validation**: Validate all request data
4. **Rate Limiting**: Implement in production
5. **Error Messages**: Don't leak sensitive info
6. **HTTPS**: Use in production
7. **API Authentication**: Add auth layer for production

## Production Deployment

### Build
```bash
yarn build
```

### Environment Variables
Set in production environment:
```env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-prod-key
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Start
```bash
yarn start
```

### Process Manager
Use PM2 or similar:
```bash
pm2 start dist/server.js --name moneyhero-api
```

## Monitoring

Recommended metrics:
- Request count
- Response times
- Error rates
- Token usage
- API costs
- Streaming latency

## Future Enhancements

1. **Database Integration**: Replace static knowledge base
2. **Caching**: Redis for common queries
3. **Rate Limiting**: Express rate limiter
4. **Authentication**: JWT tokens
5. **Logging**: Winston or Pino
6. **Monitoring**: Prometheus + Grafana
7. **Testing**: Jest unit tests
8. **Documentation**: OpenAPI/Swagger
9. **Vector Store**: For RAG capability
10. **Multi-model**: Route by complexity

## Troubleshooting

### "ANTHROPIC_API_KEY not configured"
**Solution**: Check `.env` file exists and has valid key

### "Port 3001 already in use"
**Solution**: `lsof -ti:3001 | xargs kill -9`

### "Cannot find module"
**Solution**:
1. Check `.js` extensions in imports
2. Run `yarn install`
3. Check `tsconfig.json` module settings

### Streaming not working
**Solution**:
1. Check SSE headers are set
2. Verify no response sent before streaming
3. Test with curl or browser dev tools

### Type errors
**Solution**: Run `npx tsc --noEmit` for details

## Resources

- [Express Docs](https://expressjs.com/)
- [Anthropic API](https://docs.anthropic.com/)
- [LangChain.js](https://js.langchain.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Biome](https://biomejs.dev/)

## Notes for AI Assistants

- This backend uses **ES Modules**, not CommonJS
- All imports must include `.js` extension
- LangChain chains return AsyncIterables for streaming
- SSE format: `data: {...}\n\n`
- Knowledge base is intentionally minimal
- No database, all data in memory
- CORS configured for development (localhost:5173)
- Temperature set to 0 for consistency
- Claude 3.5 Sonnet used for quality
