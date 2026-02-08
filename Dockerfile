# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

RUN npm config set fetch-retries 10 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 180000 \
 && npm config set fetch-timeout 600000

RUN npm ci --prefer-offline --legacy-peer-deps

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist     
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts

EXPOSE 3200
CMD ["npm", "run", "dev"]
