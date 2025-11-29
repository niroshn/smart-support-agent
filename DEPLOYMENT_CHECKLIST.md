# Deployment Checklist

Quick reference for deploying MoneyHero AI Support to Vercel.

## Pre-Deployment

- [ ] API keys ready
  - [ ] Anthropic API Key (Claude)
  - [ ] OpenAI API Key (Embeddings)
- [ ] Code pushed to GitHub
- [ ] Tests passing locally (`yarn test`)
- [ ] Build successful locally (`yarn build`)
- [ ] Environment variables documented

## Vercel Setup

### 1. Create Vercel Project

- [ ] Sign up/login at [vercel.com](https://vercel.com)
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Select project

### 2. Configure Build Settings

- [ ] Framework Preset: **Vite**
- [ ] Build Command: `yarn build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `yarn install`
- [ ] Node.js Version: **20.x**

### 3. Add Environment Variables

Go to Settings → Environment Variables

- [ ] Add `ANTHROPIC_API_KEY`
  - Value: `sk-ant-...`
  - Environments: ✓ Production ✓ Preview ✓ Development
- [ ] Add `OPENAI_API_KEY`
  - Value: `sk-proj-...`
  - Environments: ✓ Production ✓ Preview ✓ Development

### 4. Deploy

- [ ] Click "Deploy"
- [ ] Wait for build to complete (~3-5 minutes)
- [ ] Verify deployment URL

## Post-Deployment

### Verify Deployment

- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Health check works: `https://your-app.vercel.app/api/health`
- [ ] Chat functionality works
- [ ] Vector store initializes (check function logs)
- [ ] No console errors

### Test Core Features

- [ ] Send a chat message
- [ ] Verify streaming response
- [ ] Test escalation flow ("I want to speak to a human")
- [ ] Test off-topic handling ("How do I cook pasta?")
- [ ] Test product queries ("What credit cards do you offer?")
- [ ] Check conversation history
- [ ] Test markdown rendering

### Performance Check

- [ ] First request time < 40s (cold start + vector init)
- [ ] Warm requests < 5s
- [ ] No timeout errors
- [ ] Check function logs for errors

### Optional: Custom Domain

- [ ] Go to Settings → Domains
- [ ] Add custom domain
- [ ] Configure DNS (CNAME to `cname.vercel-dns.com`)
- [ ] Wait for SSL provisioning
- [ ] Verify custom domain works

## Production Optimizations

### Recommended Upgrades

- [ ] Migrate to persistent vector database
  - [ ] Set up Pinecone account
  - [ ] Create index
  - [ ] Update vector service
  - [ ] Test cold start improvements
- [ ] Add error tracking (Sentry)
- [ ] Set up monitoring/alerts
- [ ] Enable Vercel Analytics
- [ ] Add rate limiting
- [ ] Implement caching strategy

### Security

- [ ] Review CORS settings
- [ ] Add rate limiting
- [ ] Set up API authentication (if needed)
- [ ] Enable Deployment Protection
- [ ] Review function permissions
- [ ] Rotate API keys if exposed

### Documentation

- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Add troubleshooting guide
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

## Monitoring

### Set Up Alerts

- [ ] Function errors > 5%
- [ ] Response time > 10s
- [ ] Cold starts > 50%
- [ ] API quota warnings

### Regular Checks

- [ ] Weekly: Review function logs
- [ ] Weekly: Check error rates
- [ ] Monthly: Review costs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Review architecture

## Rollback Plan

If deployment fails:

1. [ ] Go to Vercel Dashboard → Deployments
2. [ ] Find last working deployment
3. [ ] Click ⋯ → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Cost Tracking

### Expected Costs

**Vercel (Hobby - Free)**:
- 100 GB bandwidth
- 1000 function invocations/day

**API Costs** (1000 queries/month):
- OpenAI: ~$5/month
- Anthropic: ~$5/month
- **Total: ~$10/month**

### When to Upgrade

Consider Vercel Pro ($20/month) if:
- [ ] > 1000 requests/day
- [ ] Need faster cold starts
- [ ] Want team collaboration
- [ ] Need advanced analytics

## Support Resources

- [ ] Bookmark: [Vercel Status](https://vercel-status.com)
- [ ] Join: [Vercel Discord](https://vercel.com/discord)
- [ ] Save: Emergency contact info
- [ ] Document: On-call procedures

---

## Quick Deploy Commands

```bash
# Deploy to production
vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls

# Rollback
vercel rollback

# Pull environment variables
vercel env pull
```

## Deployment Complete! 🎉

Once all items are checked:
- [ ] Notify team
- [ ] Update status page
- [ ] Share deployment URL
- [ ] Celebrate! 🚀
