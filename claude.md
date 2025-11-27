# MoneyHero AI Support - Project Context for Claude

## Project Overview

MoneyHero AI Support is a full-stack AI-powered customer support chat application for financial products. It uses Claude 3.5 Sonnet with LangChain.js orchestration to provide intelligent, context-aware responses about credit cards and personal loans.

## Architecture

```
Frontend (React + Vite + TypeScript)
    ↓ HTTP REST API
Backend (Express + TypeScript)
    ↓ LangChain.js
Claude 3.5 Sonnet (Anthropic)
```

## Technology Stack

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 6.2.0
- **Language**: TypeScript 5.8.2
- **UI Components**: Custom React components
- **Icons**: lucide-react
- **Markdown**: react-markdown
- **Styling**: Tailwind CSS (via utility classes)

### Backend
- **Framework**: Express 4.18.2
- **Language**: TypeScript 5.8.2
- **Runtime**: Node.js (ES Modules)
- **AI Orchestration**: LangChain.js 0.3.0
- **AI Provider**: Claude 3.5 Sonnet (@anthropic-ai/sdk)
- **Streaming**: Server-Sent Events (SSE)

### Development Tools
- **Linter/Formatter**: Biome
- **Package Manager**: Yarn 4.9.1
- **Type Checking**: TypeScript strict mode

## Project Structure

```
moneyhero-ai-support/
├── components/          # React components
│   ├── ChatMessage.tsx  # Message display component
│   └── ChatInput.tsx    # Input field component
├── services/
│   └── geminiService.ts # Frontend API client (calls backend)
├── data/
│   └── products.ts      # Product knowledge base (deprecated, moved to backend)
├── server/              # Backend service
│   ├── src/
│   │   ├── services/
│   │   │   └── aiService.ts      # LangChain + Claude integration
│   │   ├── routes/
│   │   │   └── chat.ts           # API routes
│   │   ├── data/
│   │   │   └── products.ts       # Knowledge base
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript interfaces
│   │   └── server.ts             # Express app entry
│   ├── biome.json       # Backend Biome config
│   └── .env             # Environment variables
├── App.tsx              # Main React app
├── types.ts             # Frontend TypeScript types
├── biome.json           # Frontend Biome config
└── .env.local           # Frontend environment variables
```

## Key Concepts

### 1. Intent Classification
The system classifies user queries into three categories:
- **ESCALATE**: User wants human support
- **OFF_TOPIC**: Query unrelated to finance
- **ANSWER**: Standard product query

### 2. Knowledge Base
Hardcoded product information about:
- Credit cards (CashBack Plus, TravelElite Platinum)
- Personal loans (QuickCash, DebtConsolidation Saver)

### 3. Streaming Responses
- Backend streams responses via Server-Sent Events
- Frontend consumes stream and updates UI in real-time

### 4. LangChain Components
- **ChatAnthropic**: Claude model wrapper
- **ChatPromptTemplate**: Reusable prompt templates
- **StringOutputParser**: Parse LLM output
- **MessagesPlaceholder**: Conversation history management

## Coding Standards

### TypeScript
- Use strict mode
- Prefer interfaces over types for object shapes
- Use `const` over `let` when possible
- Avoid `any` type (use `unknown` if needed)
- Always define return types for functions

### React
- Functional components only (no class components)
- Use hooks for state management
- Props should have TypeScript interfaces
- Keep components focused and single-purpose

### Backend
- Use async/await (no callback hell)
- Error handling with try/catch
- Validate request data
- Use proper HTTP status codes
- Log errors to console

### Formatting (Biome)
- 2-space indentation
- Single quotes for strings
- Semicolons required
- 100 character line width
- ES5 trailing commas

## Important Files

### Frontend
- **App.tsx**: Main chat interface with message history and state management
- **services/geminiService.ts**: API client that calls backend `/api/chat`
- **components/ChatMessage.tsx**: Renders individual messages with markdown support
- **components/ChatInput.tsx**: Text input with send button

### Backend
- **server/src/services/aiService.ts**: Core AI logic with LangChain chains
- **server/src/routes/chat.ts**: Express routes for chat API
- **server/src/data/products.ts**: Product knowledge base
- **server/src/server.ts**: Express app setup with CORS

## Environment Variables

### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (`server/.env`)
```env
PORT=3001
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
```

## Development Workflow

1. Start backend: `cd server && yarn dev`
2. Start frontend: `yarn dev`
3. Lint: `yarn lint` (uses Biome)
4. Format: `yarn format` (uses Biome)
5. Type check: `npx tsc --noEmit`

## API Endpoints

### POST /api/chat
**Request:**
```json
{
  "messages": Message[],
  "newMessage": string
}
```

**Response:** Server-Sent Events stream
```
data: {"type":"escalation","isEscalation":false}

data: {"type":"chunk","content":"Hello"}

data: {"type":"done"}
```

### GET /api/health
Health check endpoint

## Common Tasks

### Adding a New Product
1. Edit `server/src/data/products.ts`
2. Add product to `KNOWLEDGE_BASE` array
3. Restart backend server

### Changing AI Model
1. Edit `server/src/services/aiService.ts`
2. Update `model` parameter in `ChatAnthropic` constructor
3. Available models: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, etc.

### Adding New Intent Category
1. Update classification prompt in `aiService.ts`
2. Add handler for new intent type
3. Update types if needed

### Modifying Prompt Templates
1. Edit system messages in `aiService.ts`
2. Use LangChain prompt templates for reusability
3. Test with different queries

## Testing Queries

### Product Queries
- "What credit cards do you offer?"
- "Compare CashBack Plus and TravelElite"
- "Tell me about personal loans"
- "What are the fees for CashBack Plus?"

### Edge Cases
- "I want to speak to a human" (escalation)
- "How to cook pasta?" (off-topic)
- "Tell me about a product you don't have" (unknown product)

## Known Limitations

1. **Static Knowledge Base**: Products are hardcoded, not from database
2. **No Authentication**: API is open, no user auth
3. **No Rate Limiting**: Unlimited requests allowed
4. **No Conversation Persistence**: History stored in browser only
5. **No Multi-language**: English only

## Future Enhancements

1. **RAG**: Add vector store for semantic search over product data
2. **Tools**: Give Claude function calling for dynamic data
3. **Database**: Move products to database
4. **Authentication**: Add user auth and API keys
5. **Multi-model**: Route simple queries to cheaper models
6. **Memory**: Persist conversations across sessions
7. **Analytics**: Track usage and conversation quality

## Debugging

### Backend Not Starting
- Check `ANTHROPIC_API_KEY` in `server/.env`
- Verify port 3001 is not in use
- Check dependencies: `cd server && yarn install`

### Frontend Can't Connect
- Ensure backend is running first
- Check `VITE_API_URL` in `.env.local`
- Verify CORS settings in `server/src/server.ts`

### Streaming Not Working
- Check browser console for errors
- Verify SSE headers in backend
- Test with `curl` or Postman

### Type Errors
- Run `npx tsc --noEmit` to check types
- Ensure types are synced between frontend and backend
- Check imports are correct

## Resources

- [Anthropic API Docs](https://docs.anthropic.com/)
- [LangChain.js Docs](https://js.langchain.com/)
- [Biome Docs](https://biomejs.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Express Docs](https://expressjs.com/)

## Contributing Guidelines

1. **Code Style**: Use Biome formatter before committing
2. **Type Safety**: No `any` types without justification
3. **Testing**: Test all changes with various queries
4. **Documentation**: Update claude.md when making significant changes
5. **Commits**: Clear, descriptive commit messages

## Notes for AI Assistants

- This project uses **ES Modules** (`.js` imports in `.ts` files)
- Backend imports must include `.js` extension
- Frontend uses Vite's import.meta.env for environment variables
- Backend uses process.env with dotenv
- LangChain streaming returns AsyncIterable
- Frontend parses SSE stream manually
- Knowledge base is intentionally small for demo purposes
- Claude 3.5 Sonnet is expensive but provides high quality
