# Vector Store & RAG Implementation Guide

This guide explains the new vector store implementation using LangChain and OpenAI embeddings for Retrieval-Augmented Generation (RAG).

## Overview

The application now uses a **vector database** (MemoryVectorStore) to store and retrieve document embeddings from the `/docs` folder. This enables semantic search and more accurate, context-aware responses.

### What Changed

**Before**: Static hardcoded knowledge base in `products.ts`
**After**: Dynamic vector-based retrieval from markdown files in `/docs` folder

### Benefits

- **Scalable**: Add new documents by simply creating markdown files
- **Accurate**: Semantic search finds the most relevant information
- **Flexible**: Supports complex queries across multiple documents
- **Maintainable**: Update knowledge base without code changes

## Architecture

```
User Query
    ↓
Intent Classification (Claude)
    ↓
Vector Store Similarity Search (OpenAI Embeddings)
    ↓
Retrieve Top 4 Most Relevant Chunks
    ↓
Generate Response with Context (Claude)
    ↓
Stream Response to User
```

## Files Created

### 1. `src/services/vectorService.ts`
Main vector store service with three key functions:

- `initializeVectorStore()`: Load docs, create embeddings, build vector store
- `retrieveRelevantDocs(query, k)`: Find k most similar documents
- `getContextForQuery(query)`: Get formatted context string for LLM

### 2. `src/scripts/testVectorStore.ts`
Test script to verify vector store functionality

## Setup Instructions

### Step 1: Install Dependencies

Already installed during setup:
```bash
yarn add @langchain/community @langchain/openai openai
```

Dependencies added:
- `@langchain/community` - Document loaders and utilities
- `@langchain/openai` - OpenAI embeddings integration
- `openai` - OpenAI SDK

### Step 2: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to `server/.env`:

```env
OPENAI_API_KEY=sk-...your-key-here...
```

### Step 3: Organize Your Documents

Place markdown files in the `/docs` folder with this structure:

```
docs/
├── credit-cards/
│   ├── citi-cashback-plus.md
│   ├── dbs-live-fresh.md
│   └── hsbc-revolution.md
├── personal-loans/
│   ├── dbs-personal-loan.md
│   └── standard-chartered-cashone.md
└── faqs/
    ├── application-process.md
    ├── fees-and-charges.md
    └── credit-card-basics.md
```

### Step 4: Start the Server

The vector store initializes automatically on server startup:

```bash
yarn dev
```

You should see:
```
🔄 Initializing vector store...
📂 Loading documents from: /path/to/docs
📄 Loaded 11 documents
✂️  Split into 45 chunks
✅ Vector store initialized successfully
🚀 Server running on http://localhost:3001
```

## Testing

### Option 1: Run Test Script

```bash
npx tsx src/scripts/testVectorStore.ts
```

This will:
1. Initialize the vector store
2. Run test queries
3. Show retrieved documents and context

### Option 2: Test via API

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [],
    "newMessage": "What credit cards do you offer?"
  }'
```

### Option 3: Use Frontend

Start the frontend and ask questions:
- "What are the best cashback credit cards?"
- "Compare DBS Live Fresh and Citi Cash Back+"
- "How do I apply for a personal loan?"

## How It Works

### 1. Document Loading

On server startup, the `DirectoryLoader` loads all `.md` files:

```typescript
const loader = new DirectoryLoader(docsPath, {
  '.md': (filePath: string) => new TextLoader(filePath),
});
const docs = await loader.load();
```

### 2. Text Splitting

Documents are split into 1000-character chunks with 200-character overlap:

```typescript
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const chunks = await textSplitter.splitDocuments(docs);
```

**Why chunk?**
- Embeddings work better on focused content
- Retrieve only relevant sections, not entire documents
- Overlap ensures context continuity

### 3. Embedding Creation

Each chunk is converted to a vector using OpenAI's `text-embedding-3-small`:

```typescript
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
});
```

**Model details:**
- Dimensions: 1536
- Cost: $0.00002 per 1K tokens
- Fast and accurate for semantic search

### 4. Vector Storage

Vectors are stored in `MemoryVectorStore`:

```typescript
vectorStore = await MemoryVectorStore.fromDocuments(chunks, embeddings);
```

**MemoryVectorStore:**
- In-memory storage (no external database needed)
- Fast lookups
- Resets on server restart (fine for demos)

### 5. Similarity Search

When a user asks a question, we find the most similar chunks:

```typescript
const relevantDocs = await vectorStore.similaritySearch(query, 4);
```

**Algorithm:** Cosine similarity between query embedding and document embeddings

### 6. Context Injection

Retrieved chunks are formatted and injected into the Claude prompt:

```typescript
const context = docs
  .map((doc, i) => `[Source ${i+1}: ${category}/${file}]\n${content}`)
  .join('\n\n---\n\n');
```

## Configuration

### Adjust Chunk Size

In `vectorService.ts`:

```typescript
const VECTOR_CONFIG = {
  chunkSize: 1000,      // Larger = more context, fewer chunks
  chunkOverlap: 200,    // Higher = more redundancy
  topK: 4,              // Number of chunks to retrieve
};
```

**Recommendations:**
- **Small docs** (FAQs): 500-800 chars
- **Medium docs** (product pages): 1000-1500 chars
- **Large docs** (guides): 1500-2000 chars

### Change Embedding Model

In `vectorService.ts`:

```typescript
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-large', // More accurate, higher cost
  // or 'text-embedding-3-small'       // Faster, lower cost (current)
});
```

### Retrieve More Documents

```typescript
const relevantDocs = await retrieveRelevantDocs(query, 6); // Retrieve 6 instead of 4
```

**Trade-off:** More context = better answers, but higher token costs

## Cost Considerations

### Embedding Costs (One-time on startup)

Example with 11 docs split into 45 chunks:
- Total tokens: ~30,000
- Cost: 30 × $0.00002 = **$0.0006** per startup

### Query Costs (Per user question)

- Embedding query: ~10 tokens × $0.00002 = **$0.0000002**
- Claude tokens: ~600 input + 200 output = **$0.0048**
- **Total per query: ~$0.0048** (embedding cost negligible)

### Optimization Tips

1. **Cache vector store**: Serialize to disk to avoid re-embedding on restart
2. **Use cheaper models**: Switch to Haiku for simple queries
3. **Reduce topK**: Retrieve fewer documents when possible

## Production Considerations

### 1. Persistent Vector Store

For production, use a persistent database:

```typescript
// Option 1: Pinecone (cloud)
import { PineconeStore } from '@langchain/pinecone';

// Option 2: Chroma (self-hosted)
import { Chroma } from '@langchain/community/vectorstores/chroma';

// Option 3: Supabase (PostgreSQL + pgvector)
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
```

### 2. Caching

Cache embeddings to avoid re-computing:

```typescript
import { CacheBackedEmbeddings } from 'langchain/embeddings/cache_backed';
import { InMemoryStore } from '@langchain/core/storage';

const cache = new InMemoryStore();
const cachedEmbeddings = CacheBackedEmbeddings.fromBytesStore(
  embeddings,
  cache,
  { namespace: 'moneyhero' }
);
```

### 3. Monitoring

Track these metrics:
- Vector store initialization time
- Query retrieval time
- Document relevance scores
- Token usage per query

### 4. Error Handling

The service includes fallback behavior:
- If vector store fails to initialize, server exits (ensures no broken experience)
- If retrieval fails, returns empty context (Claude uses general knowledge)

## Troubleshooting

### "OPENAI_API_KEY not found"

**Fix:** Add your OpenAI API key to `server/.env`

### "No documents found in docs directory"

**Fix:** Ensure markdown files exist in `/docs` folder

### Vector store initialization slow

**Expected:** First startup takes 2-5 seconds to load and embed all documents

### Retrieved documents not relevant

**Possible causes:**
1. Query too vague - be more specific
2. topK too low - increase from 4 to 6-8
3. Documents missing key information - update docs

### "Module not found" errors

**Fix:**
```bash
cd server
yarn install
```

## Adding New Documents

### Step 1: Create Markdown File

```bash
touch docs/credit-cards/new-product.md
```

### Step 2: Write Content

Use clear headings and structure:

```markdown
# Product Name

## Overview
Brief description...

## Key Benefits
- Benefit 1
- Benefit 2

## Eligibility Requirements
- Requirement 1
- Requirement 2

## Fees and Charges
| Fee Type | Amount |
|----------|--------|
| Annual Fee | $100 |
```

### Step 3: Restart Server

```bash
yarn dev
```

The new document is automatically:
1. Loaded
2. Chunked
3. Embedded
4. Added to vector store

No code changes needed!

## Advanced Usage

### Custom Retrieval

Retrieve documents with similarity scores:

```typescript
import { vectorStore } from './vectorService.js';

const results = await vectorStore.similaritySearchWithScore(query, 4);
results.forEach(([doc, score]) => {
  console.log(`Score: ${score}, Content: ${doc.pageContent}`);
});
```

### Filter by Metadata

Retrieve only from specific categories:

```typescript
const creditCardDocs = await vectorStore.similaritySearch(query, 4, {
  category: 'credit-cards',
});
```

### Hybrid Search

Combine keyword and semantic search:

```typescript
// 1. Keyword filter
const keywordFiltered = docs.filter(doc =>
  doc.pageContent.includes('cashback')
);

// 2. Semantic search on filtered results
const semanticResults = await similaritySearch(query, keywordFiltered);
```

## Migration from Static Knowledge Base

The old static knowledge base (`products.ts`) is now unused. To migrate:

1. Convert products to markdown files (already done in `/docs`)
2. Vector service now handles retrieval (no changes needed)
3. Old `products.ts` can be deleted (optional, kept for reference)

## Resources

- [LangChain JS Docs](https://js.langchain.com/docs)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Vector Store Comparison](https://js.langchain.com/docs/modules/data_connection/vectorstores)
- [RAG Best Practices](https://www.anthropic.com/index/retrieval-augmented-generation)

## Support

For issues:
1. Check server logs for error messages
2. Run test script: `npx tsx src/scripts/testVectorStore.ts`
3. Verify OpenAI API key is valid
4. Ensure docs folder has markdown files
