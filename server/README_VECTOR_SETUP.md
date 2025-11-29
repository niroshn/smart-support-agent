# Vector Store Setup - Quick Start

## What Was Implemented

Your MoneyHero AI Support application now uses **Retrieval-Augmented Generation (RAG)** with a vector database to provide accurate, context-aware responses based on your documentation in the `/docs` folder.

### Key Changes

1. **Vector Store Service** (`src/services/vectorService.ts`)
   - Loads all markdown files from `/docs` folder
   - Creates embeddings using OpenAI's `text-embedding-3-small`
   - Stores in MemoryVectorStore for fast retrieval
   - Performs semantic search to find relevant context

2. **Updated AI Service** (`src/services/aiService.ts`)
   - Now uses RAG instead of hardcoded knowledge base
   - Retrieves top 4 most relevant document chunks per query
   - Provides context-aware responses

3. **Server Initialization** (`src/server.ts`)
   - Vector store initializes automatically on startup
   - Takes ~5-10 seconds to load and embed all documents

4. **Dependencies Added**
   - `@langchain/community` - Document utilities
   - `@langchain/openai` - OpenAI embeddings
   - `@langchain/classic` - MemoryVectorStore
   - `openai` - OpenAI SDK

## Setup Instructions

### 1. Get Your OpenAI API Key

The vector store uses OpenAI embeddings, so you need an API key:

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### 2. Add API Key to .env

Your `.env` file has been updated with a placeholder. Replace it with your actual key:

```env
OPENAI_API_KEY=sk-proj-...your-actual-key-here...
```

**Important:** Never commit your `.env` file to git!

### 3. Start the Server

```bash
yarn dev
```

You should see:
```
🔄 Initializing vector store...
📂 Loading documents from: /path/to/docs
📄 Found 11 markdown files
📚 Loaded 11 documents
✂️  Split into 44 chunks
✅ Vector store initialized successfully
🚀 Server running on http://localhost:3001
📡 API available at http://localhost:3001/api
```

### 4. Test It Out

**Via Frontend:**
Start your React frontend and ask questions like:
- "What credit cards do you offer?"
- "Compare DBS Live Fresh and Citi Cash Back+"
- "How do I apply for a personal loan?"

**Via curl:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [],
    "newMessage": "What are the best cashback credit cards?"
  }'
```

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

## How It Works

### Document Loading (On Startup)

1. **Scan** `/docs` folder recursively for `.md` files
2. **Read** each file and create Document objects
3. **Split** documents into ~1000 character chunks (200 char overlap)
4. **Embed** each chunk using OpenAI embeddings
5. **Store** vectors in MemoryVectorStore

### Query Processing (Per Request)

1. **User asks** a question
2. **Classify intent** (ANSWER, ESCALATE, or OFF_TOPIC)
3. **Embed query** using same OpenAI model
4. **Find top 4** most similar document chunks
5. **Inject context** into Claude's prompt
6. **Generate response** using Claude 3.5 Sonnet
7. **Stream** response back to user

## Adding New Documents

### Easy Method
1. Create a new `.md` file in `/docs` folder
2. Restart the server
3. Done! The new content is automatically indexed

### Example

```bash
# Create new FAQ file
cat > docs/faqs/interest-rates.md << 'EOF'
# Interest Rates FAQ

## What are typical credit card interest rates?
Most credit cards in Singapore have interest rates between 24-28% p.a.
...
EOF

# Restart server
yarn dev
```

## Cost Information

### Embedding Costs (One-time per startup)
- Model: `text-embedding-3-small`
- Cost: $0.00002 per 1K tokens
- **Your setup:** ~44 chunks = ~$0.0006 per startup

### Query Costs (Per user question)
- Embedding query: ~$0.0000002
- Claude response: ~$0.0048
- **Total:** ~$0.0048 per interaction

**Very cost-effective!** Embeddings are negligible compared to Claude costs.

## Configuration

Edit `src/services/vectorService.ts`:

```typescript
const VECTOR_CONFIG = {
  chunkSize: 1000,      // Larger = more context per chunk
  chunkOverlap: 200,    // Higher = more redundancy
  topK: 4,              // Number of chunks to retrieve
};
```

**Recommendations:**
- **More accuracy:** Increase `topK` to 6-8
- **Faster responses:** Decrease `topK` to 2-3
- **Better context:** Increase `chunkOverlap` to 300

## Testing

### Run Test Script

```bash
npx tsx src/scripts/testVectorStore.ts
```

This will:
- Initialize the vector store
- Run test queries
- Show retrieved documents and relevance

### Manual Testing

Test with different query types:
1. **Product queries:** "What credit cards are available?"
2. **Comparisons:** "Compare Citi vs DBS cards"
3. **Process questions:** "How do I apply?"
4. **Specific details:** "What are the fees?"

## Troubleshooting

### "OPENAI_API_KEY not found"
**Fix:** Add your API key to `server/.env`

### "No documents found"
**Fix:** Ensure markdown files exist in `/docs` folder

### Server slow to start
**Expected:** First startup takes 5-10 seconds to embed all documents

### Incorrect responses
**Possible causes:**
1. Query too vague - try being more specific
2. Information not in docs - add it to a markdown file
3. topK too low - increase in `VECTOR_CONFIG`

### Port already in use
**Fix:**
```bash
lsof -ti:3001 | xargs kill -9
```

## What's Next?

### Immediate
1. Add your OpenAI API key ✅
2. Test with various queries ✅
3. Add more documents to `/docs` as needed

### Future Enhancements
- **Persistent Storage:** Use Pinecone or Chroma instead of MemoryVectorStore
- **Caching:** Cache embeddings to avoid re-computing on restart
- **Hybrid Search:** Combine keyword + semantic search
- **Multi-language:** Add support for non-English queries
- **Analytics:** Track which documents are most retrieved

## Documentation

For detailed information, see:
- `VECTOR_STORE_GUIDE.md` - Comprehensive guide
- `src/services/vectorService.ts` - Implementation
- `src/scripts/testVectorStore.ts` - Test script

## Support

If you encounter issues:
1. Check server logs for error messages
2. Run test script: `npx tsx src/scripts/testVectorStore.ts`
3. Verify `.env` has valid OpenAI API key
4. Ensure `/docs` folder has markdown files

---

**That's it!** Your AI support system now uses RAG for accurate, document-based responses. 🎉
