# ==========================================
# Stage 1: Build React frontend
# ==========================================
FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY client/package*.json ./
RUN npm ci

COPY client/ ./

RUN npm run build


# ==========================================
# Stage 2: Run Express backend
# ==========================================
FROM node:22-alpine

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY server/src ./src

# Copy React production build
COPY --from=frontend-build /frontend/dist ./public

EXPOSE 10000

CMD ["node", "src/index.js"]