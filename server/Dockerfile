# Backend Dockerfile for MoneyHero AI Support

# Use Node.js LTS version
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
FROM base AS deps

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --immutable

# Build stage
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Production stage
FROM base AS runner

WORKDIR /app

# Set to production
ENV NODE_ENV=production

# Copy package files
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Install production dependencies only
RUN yarn workspaces focus --production

# Copy built application
COPY --from=builder /app/dist ./dist

# Note: docs folder will be mounted as a volume in docker-compose
# If running standalone, uncomment the line below and ensure docs is in server/
# COPY docs ./docs

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
