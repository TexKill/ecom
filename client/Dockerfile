FROM node:20-alpine AS deps
WORKDIR /workspace/client
COPY client/package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /workspace
COPY --from=deps /workspace/client/node_modules ./client/node_modules
COPY client ./client
COPY api/src/types/shared.ts ./api/src/types/shared.ts
WORKDIR /workspace/client
ARG NEXT_PUBLIC_API_URL=http://localhost:9000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:20-alpine AS prod-deps
WORKDIR /workspace/client
COPY client/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /workspace/client
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ARG NEXT_PUBLIC_API_URL=http://localhost:9000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=prod-deps /workspace/client/node_modules ./node_modules
COPY --from=builder /workspace/client/.next ./.next
COPY --from=builder /workspace/client/public ./public
COPY --from=builder /workspace/client/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start"]
