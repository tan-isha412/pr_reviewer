# STAGE 1: Dependencies Installer
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# STAGE 2: Production Runner
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Create persistent data storage directories and set ownership to 'node' user
RUN mkdir -p data/raw data/processed && chown -R node:node /app

# Copy production node_modules from deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node . .

# Run container as non-root user for security
USER node

# Expose port 3000 for Express webhook server
EXPOSE 3000

# Default command starts the webhook server
CMD ["node", "app.js"]