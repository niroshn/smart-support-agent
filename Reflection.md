# Vercel Deployment Reflection

## Date: 2025-11-30

## Overview
Attempted to deploy MoneyHero AI Support application to Vercel serverless platform. Encountered multiple configuration and runtime issues that required iterative debugging and fixes.

---

## Problems Encountered

### 1. **Conflicting Vercel Configuration**
**Error:** `The 'functions' property cannot be used in conjunction with the 'builds' property`

**Root Cause:**
- `vercel.json` contained both `builds` and `functions` properties
- These are mutually exclusive in Vercel's configuration

**Solution:**
- Removed `builds` array from `vercel.json`
- Removed deprecated `routes` array (replaced by `rewrites`)
- Removed unnecessary `version: 2` property

**Files Changed:**
- `vercel.json`

---

### 2. **Invalid Runtime Configuration**
**Error:** `Function Runtimes must have a valid version, for example 'now-php@1.0.0'`

**Root Cause:**
- Used AWS Lambda-style runtime syntax: `"runtime": "nodejs20.x"`
- Vercel automatically detects runtime from file type

**Solution:**
- Removed `runtime` field from functions configuration
- Kept only `memory` and `maxDuration` settings

**Files Changed:**
- `vercel.json`

---

### 3. **Missing Environment Variables**
**Error:** `Environment Variable "ANTHROPIC_API_KEY" references Secret "anthropic_api_key", which does not exist`

**Root Cause:**
- Used `@anthropic_api_key` syntax in `vercel.json` which references Vercel Secrets
- No secrets were created in Vercel project

**Solution:**
- Removed `env` section from `vercel.json`
- Added environment variables directly via Vercel CLI:
  ```bash
  echo "sk-ant-api03..." | vercel env add ANTHROPIC_API_KEY production
  echo "sk-ant-api03..." | vercel env add ANTHROPIC_API_KEY preview
  echo "sk-ant-api03..." | vercel env add ANTHROPIC_API_KEY development
  ```

**Verification:**
```bash
vercel env ls
# Output:
# ANTHROPIC_API_KEY  Encrypted  Development
# ANTHROPIC_API_KEY  Encrypted  Preview
# ANTHROPIC_API_KEY  Encrypted  Production
```

**Files Changed:**
- `vercel.json` (removed env section)

---

### 4. **CORS Issues - Frontend Calling Localhost**
**Error:** CORS errors when hosted app tried to call `http://localhost:3001`

**Root Cause:**
- Frontend hardcoded to use `VITE_API_URL=http://localhost:3001`
- In production, API functions are on the same domain, so relative URLs should be used

**Solution:**
- Updated `services/geminiService.ts` to detect production environment:
  ```typescript
  const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '' : 'http://localhost:3001');
  ```
- This uses:
  - Empty string (relative URLs) in production → calls `/api/chat` on same domain
  - `http://localhost:3001` in development → calls local backend

**Files Changed:**
- `services/geminiService.ts`

---

### 5. **Missing LangChain Dependencies**
**Error:** `500 Internal Server Error` when calling `/api/chat`

**Root Cause:**
- API functions in `/api/` directory imported LangChain packages
- Root `package.json` didn't include LangChain dependencies
- Vercel builds from root, not from `/server/`

**Solution:**
- Added LangChain dependencies to root `package.json`:
  ```json
  "@anthropic-ai/sdk": "^0.27.0",
  "@langchain/anthropic": "^1.1.3",
  "@langchain/core": "^1.1.0",
  "@langchain/openai": "^1.1.3",
  "langchain": "^1.1.1",
  "openai": "^6.9.1"
  ```

**Files Changed:**
- `package.json`

---

### 6. **Vector Store File System Dependencies**
**Error:** Function crashes trying to read from file system

**Root Cause:**
- Original `/api/chat.ts` imported `vectorService` which:
  - Used `fs.readFile()` to read markdown files
  - Used `path.join(__dirname, '../../../docs')` for file paths
  - Vercel serverless functions have limited file system access
  - `__dirname` behaves differently in bundled serverless functions

**Solution:**
- Simplified `/api/chat.ts` to use static in-memory knowledge base
- Removed dependency on `vectorService.ts`
- Embedded product data directly in the API function:
  ```typescript
  const KNOWLEDGE_BASE: FinancialProduct[] = [
    { id: 'cc-001', name: 'MoneyHero CashBack Plus', ... },
    { id: 'cc-002', name: 'TravelElite Platinum', ... },
    // ...
  ];
  ```

**Files Changed:**
- `api/chat.ts` (complete rewrite)

**Trade-offs:**
- ✅ Works in serverless environment
- ✅ Faster cold starts (no file I/O)
- ❌ Lost RAG (Retrieval Augmented Generation) capability
- ❌ Lost vector similarity search
- ❌ Knowledge base now hardcoded instead of file-based

---

### 7. **TypeScript Module System Mismatch**
**Error:** Runtime errors due to ES modules vs CommonJS confusion

**Root Cause:**
- Root `package.json` has `"type": "module"` (ES modules)
- `api/tsconfig.json` had `"module": "commonjs"`
- This mismatch caused import/export issues

**Solution:**
- Updated `api/tsconfig.json` to use ES modules:
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "lib": ["ES2022"]
    }
  }
  ```

**Files Changed:**
- `api/tsconfig.json`

---

### 8. **LangChain Serverless Performance Issues**
**Status:** ONGOING - Not fully resolved

**Symptoms:**
- `/api/health` endpoint works: ✅
- `/api/test` endpoint works: ✅
- `/api/chat` endpoint fails: ❌ (500 error or timeout)
- `/api/chat-simple` endpoint hangs: ❌

**Suspected Root Causes:**
1. **Cold Start Time:** LangChain has many dependencies, causing slow cold starts
2. **Bundle Size:** Large dependency tree may exceed Vercel limits
3. **Module Resolution:** ES modules bundling issues with LangChain
4. **Async Generator Issues:** LangChain's streaming may not work in Vercel's Node.js environment

**Evidence:**
- Simple endpoints without LangChain work fine
- Health check with just env variable access works
- Chat endpoints with LangChain/Anthropic fail

**Attempted Solutions:**
- ✅ Fixed TypeScript config (didn't solve it)
- ✅ Simplified knowledge base (didn't solve it)
- ⏳ Created `chat-simple.ts` without LangChain (still testing)

**Next Steps to Debug:**
1. Check Vercel Function logs in dashboard
2. Test if Anthropic SDK works without LangChain streaming
3. Consider switching to REST API instead of streaming
4. May need to abandon LangChain for Vercel deployment

---

## Deployment Protection Issues

**Problem:**
Preview deployments have Vercel Authentication enabled, showing "Authentication Required" page

**Impact:**
- Can't test preview deployments without logging in
- Production URL works: `https://smart-support-agent-topaz.vercel.app`
- Preview URLs blocked: `https://smart-support-agent-9zwwc3ngr-*.vercel.app`

**Solution Options:**
1. Disable Deployment Protection in Vercel Settings → Deployment Protection
2. Use bypass tokens for automated testing
3. Only test on production deployments

---

## Working Endpoints

### ✅ Health Check
```bash
curl https://smart-support-agent-topaz.vercel.app/api/health
# Response: {"status":"ok","timestamp":"...","environment":"vercel-serverless"}
```

### ✅ Test Endpoint (API Key Check)
```bash
curl https://smart-support-agent-topaz.vercel.app/api/test
# Response: {"status":"ok","hasApiKey":true,"apiKeyLength":109,"method":"GET"}
```

### ❌ Chat Endpoint (LangChain-based)
```bash
curl -X POST https://smart-support-agent-topaz.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [], "newMessage": "Hello"}'
# Response: 500 Internal Server Error
```

### ❌ Simple Chat Endpoint (Anthropic SDK only)
```bash
curl -X POST https://smart-support-agent-topaz.vercel.app/api/chat-simple \
  -H "Content-Type: application/json" \
  -d '{"messages": [], "newMessage": "Hello"}'
# Response: Hangs/Timeout
```

---

## Architecture Comparison

### Local Development (Working) ✅
```
Frontend (Vite) → http://localhost:3001/api/chat → Express Server
                                                    ↓
                                            LangChain + Claude
                                                    ↓
                                            Vector Store (Markdown files)
```

### Vercel Deployment (Partially Working) ⚠️
```
Frontend (Static) → /api/health → Serverless Function ✅
                   → /api/test → Serverless Function ✅
                   → /api/chat → Serverless Function ❌
                   → /api/chat-simple → Serverless Function ❌
```

---

## Lessons Learned

### 1. **Serverless Constraints**
- File system access is limited/unreliable
- Large dependencies increase cold start time
- Not all Node.js libraries work well in serverless
- Streaming can be problematic

### 2. **Vercel-Specific**
- Use environment variables via CLI or dashboard, not in `vercel.json`
- Relative URLs for API calls in production (same domain)
- Functions are auto-detected from `/api/` directory
- TypeScript is bundled/transpiled by Vercel

### 3. **LangChain Challenges**
- Heavy framework, may not be ideal for serverless
- Lots of dependencies (increases bundle size)
- Consider using Anthropic SDK directly for better performance
- Streaming with async generators needs testing in Vercel

### 4. **Configuration Evolution**
```
vercel.json (v1 - broken)
├── builds ← Conflicted with functions
├── functions
├── routes ← Deprecated
└── env ← Should use Vercel dashboard

vercel.json (v2 - working)
├── functions (simplified)
└── rewrites
```

---

## Recommended Next Actions

### Option A: Debug LangChain Deployment
1. Access Vercel dashboard function logs
2. Check specific error messages for `/api/chat`
3. Try deploying with smaller LangChain subset
4. Test streaming vs non-streaming responses

### Option B: Replace LangChain
1. Use Anthropic SDK directly (no LangChain)
2. Implement simpler prompt management
3. Manual conversation history handling
4. Simpler streaming implementation

### Option C: Hybrid Approach
1. Keep LangChain for local development
2. Use simplified Anthropic SDK for Vercel
3. Share knowledge base between both
4. Accept feature parity differences

### Option D: Different Hosting
1. Deploy backend to Railway/Render/Fly.io (long-running servers)
2. Keep frontend on Vercel
3. Use CORS to connect them
4. Maintain full feature set with LangChain

---

## Current Status Summary

| Component | Local Dev | Vercel Production |
|-----------|-----------|-------------------|
| Frontend Build | ✅ Works | ✅ Works |
| Static Assets | ✅ Works | ✅ Works |
| Health Check API | ✅ Works | ✅ Works |
| Environment Vars | ✅ Works | ✅ Works |
| Chat API (LangChain) | ✅ Works | ❌ Fails |
| Chat API (Simple) | ⏳ Untested | ❌ Hangs |
| Streaming Responses | ✅ Works | ❌ Unknown |
| RAG / Vector Store | ✅ Works | ❌ Removed |

---

## Files Modified During Deployment

### Configuration Files
- `vercel.json` - Simplified, removed conflicts
- `package.json` - Added LangChain dependencies
- `api/tsconfig.json` - Fixed module system
- `services/geminiService.ts` - Production URL handling

### API Functions Created
- `api/chat.ts` - LangChain-based (not working in Vercel)
- `api/health.ts` - Health check (working)
- `api/test.ts` - Debug endpoint (working)
- `api/chat-simple.ts` - Anthropic SDK only (testing)

### Git Commits
1. `Simplify API for Vercel deployment - use static data instead of vector store`
2. `Fix API tsconfig for ES modules compatibility`
3. `Add test endpoint for debugging`
4. `Add simplified chat endpoint without LangChain`

---

## Technical Debt

1. **No RAG capability in Vercel deployment** - Lost vector similarity search
2. **Hardcoded knowledge base** - Should be in database or external service
3. **Two API implementations** - Local (with LangChain) vs Vercel (TBD)
4. **No comprehensive error logging** - Need better observability
5. **Deployment protection** - Preview URLs require authentication

---

## Resources & References

- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [LangChain.js Serverless Guide](https://js.langchain.com/docs/guides/deployment/serverless)
- [Anthropic API Streaming](https://docs.anthropic.com/claude/reference/streaming)

---

## Conclusion

The Vercel deployment is **partially successful**:
- ✅ Frontend deploys and builds correctly
- ✅ Static hosting works
- ✅ Environment variables configured
- ✅ Basic API endpoints functional
- ❌ Main chat functionality still failing

**Root Issue:** LangChain framework appears incompatible with Vercel's serverless environment, likely due to:
- Large dependency bundle size
- Module resolution issues
- Streaming implementation conflicts
- Cold start performance

**Recommended Path Forward:** Option B (Replace LangChain with Anthropic SDK directly) for Vercel, while maintaining LangChain for local development flexibility.
