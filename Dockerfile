# syntax=docker/dockerfile:1

# ---- Build stage ----------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install deps first so this layer caches unless the lockfile changes.
COPY package.json ./
RUN npm install

# Build the static bundle.
COPY . .
RUN npm run build

# ---- Runtime stage --------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# Custom config: SPA fallback + no-cache for apps.json so runtime overrides
# (bind-mounted apps.json) are picked up on refresh without a rebuild.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static assets produced by the build stage.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine ships a healthy default entrypoint/CMD; keep it.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
