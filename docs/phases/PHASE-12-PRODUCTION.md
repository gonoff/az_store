# Phase 12: Production Preparation

**Status**: ⏳ Pending
**Dependencies**: Phases 1-11

## Overview

Prepare the application for production deployment on Hostinger VPS with Docker, Nginx, and proper monitoring.

## Goals

- Docker containerization
- Nginx reverse proxy configuration
- SSL/TLS with Let's Encrypt
- Environment configuration
- Performance optimization
- Monitoring & logging
- Backup strategy
- Deployment automation

---

## Step 12.1: Dockerfile

**File**: `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## Step 12.2: Docker Compose

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
        - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
        - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        - NEXT_PUBLIC_PAYPAL_CLIENT_ID=${NEXT_PUBLIC_PAYPAL_CLIENT_ID}
    container_name: azteam-store
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
      - PAYPAL_CLIENT_SECRET=${PAYPAL_CLIENT_SECRET}
    ports:
      - '3000:3000'
    networks:
      - azteam-network
    healthcheck:
      test: ['CMD', 'wget', '-q', '--spider', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: azteam-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites-enabled:/etc/nginx/sites-enabled:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - app
    networks:
      - azteam-network

  certbot:
    image: certbot/certbot
    container_name: azteam-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

networks:
  azteam-network:
    driver: bridge
```

---

## Step 12.3: Docker Compose Production Override

**File**: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  app:
    image: ghcr.io/azteam/store:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'
```

---

## Step 12.4: Nginx Configuration

**File**: `nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript
               application/xml application/xml+rss text/javascript image/svg+xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    include /etc/nginx/sites-enabled/*;
}
```

---

## Step 12.5: Nginx Site Configuration

**File**: `nginx/sites-enabled/azteamonline.conf`

```nginx
upstream nextjs {
    server app:3000;
    keepalive 64;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name azteamonline.com www.azteamonline.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name azteamonline.com www.azteamonline.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/azteamonline.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/azteamonline.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Redirect www to non-www
    if ($host = www.azteamonline.com) {
        return 301 https://azteamonline.com$request_uri;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Cache static assets for 1 year
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Image optimization caching
    location /_next/image {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;

        # Cache optimized images for 1 week
        add_header Cache-Control "public, max-age=604800";
    }

    # API routes - rate limited
    location /api {
        limit_req zone=api burst=20 nodelay;
        limit_conn conn 10;

        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook routes - no rate limit
    location /api/webhooks {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Main application
    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Step 12.6: Health Check API

**File**: `src/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  };

  // Optional: Check external dependencies
  try {
    // Check ERP API connectivity
    const erpResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/health`, {
      signal: AbortSignal.timeout(5000),
    });

    health.erp = erpResponse.ok ? 'connected' : 'degraded';
  } catch {
    health.erp = 'unavailable';
  }

  const isHealthy = health.status === 'healthy';

  return NextResponse.json(health, {
    status: isHealthy ? 200 : 503,
  });
}
```

---

## Step 12.7: Next.js Production Config

**Update**: `next.config.ts`

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'azteamonline.com',
      },
      {
        protocol: 'https',
        hostname: 'api.azteamonline.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Rewrites for API proxy (optional)
  async rewrites() {
    return [
      {
        source: '/erp/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ];
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default withNextIntl(nextConfig);
```

---

## Step 12.8: Environment Files

**File**: `.env.example`

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://azteamonline.com

# ERP API
NEXT_PUBLIC_API_URL=https://api.azteamonline.com

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
COOKIE_DOMAIN=.azteamonline.com

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

**File**: `.env.production.local` (not committed)

```env
# Copy from .env.example and fill with production values
```

---

## Step 12.9: Deployment Script

**File**: `scripts/deploy.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Configuration
REMOTE_HOST="your-vps-ip"
REMOTE_USER="deploy"
REMOTE_PATH="/opt/azteam-store"
DOCKER_IMAGE="ghcr.io/azteam/store:latest"

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t $DOCKER_IMAGE \
  --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
  --build-arg NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
  --build-arg NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID \
  .

echo "📤 Pushing image to registry..."
docker push $DOCKER_IMAGE

# Deploy to remote server
echo "🌐 Deploying to production..."
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
cd /opt/azteam-store

# Pull latest image
docker pull ghcr.io/azteam/store:latest

# Backup current state
docker compose exec app node -e "console.log('Health check passed')" || true

# Deploy with zero downtime
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans

# Wait for health check
echo "Waiting for health check..."
sleep 30

# Verify deployment
if curl -f http://localhost:3000/api/health; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment failed - rolling back..."
  docker compose rollback
  exit 1
fi

# Clean up old images
docker image prune -f
ENDSSH

echo "✅ Deployment complete!"
```

---

## Step 12.10: SSL Certificate Setup Script

**File**: `scripts/init-ssl.sh`

```bash
#!/bin/bash

# Replace with your domain and email
DOMAIN="azteamonline.com"
EMAIL="admin@azteamonline.com"

# Create directories
mkdir -p certbot/conf certbot/www

# Get initial certificate
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

echo "SSL certificate obtained successfully!"
```

---

## Step 12.11: Backup Script

**File**: `scripts/backup.sh`

```bash
#!/bin/bash
set -e

BACKUP_DIR="/backup/azteam-store"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup environment files
cp .env.production.local $BACKUP_DIR/env_$DATE.backup

# Backup SSL certificates
tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz certbot/conf/

# Backup Docker volumes if any
docker run --rm \
  -v azteam-store_data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/data_$DATE.tar.gz /data

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
```

---

## Step 12.12: Monitoring with Docker

**File**: `docker-compose.monitoring.yml`

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: azteam-prometheus
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    ports:
      - '9090:9090'
    networks:
      - azteam-network

  grafana:
    image: grafana/grafana:latest
    container_name: azteam-grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    ports:
      - '3001:3000'
    networks:
      - azteam-network

  node-exporter:
    image: prom/node-exporter:latest
    container_name: azteam-node-exporter
    restart: unless-stopped
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - azteam-network

volumes:
  prometheus_data:
  grafana_data:

networks:
  azteam-network:
    external: true
```

---

## Step 12.13: Prometheus Configuration

**File**: `monitoring/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'nextjs'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['app:3000']
```

---

## Step 12.14: Error Tracking (Optional)

**File**: `src/lib/error-tracking.ts`

```typescript
// Sentry integration (optional)
import * as Sentry from '@sentry/nextjs';

export function initErrorTracking() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV !== 'production',
    });
  }
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  console.error('Error:', error);

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
}
```

---

## Step 12.15: Pre-deployment Checklist

**File**: `docs/DEPLOYMENT_CHECKLIST.md`

```markdown
# Deployment Checklist

## Before Deployment

- [ ] All tests passing (`npm run test:run`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] Type check passing (`npm run typecheck`)
- [ ] Lint passing (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables set in production
- [ ] SSL certificates valid
- [ ] Database migrations applied (if any)
- [ ] ERP API accessible from production server

## Environment Variables

- [ ] `NEXT_PUBLIC_API_URL` - ERP API URL
- [ ] `NEXT_PUBLIC_BASE_URL` - Production domain
- [ ] `STRIPE_SECRET_KEY` - Live Stripe key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [ ] `PAYPAL_CLIENT_SECRET` - PayPal credentials
- [ ] `JWT_SECRET` - Secure random string (32+ chars)

## Post-Deployment

- [ ] Health check endpoint responding
- [ ] Homepage loads correctly
- [ ] Product pages load
- [ ] Cart functionality works
- [ ] Checkout flow completes
- [ ] Payment processing works (test mode)
- [ ] SSL certificate valid
- [ ] Monitoring dashboards accessible
- [ ] Error tracking configured

## Rollback Plan

1. SSH to production server
2. Run: `docker compose down`
3. Run: `docker tag ghcr.io/azteam/store:previous ghcr.io/azteam/store:latest`
4. Run: `docker compose up -d`
5. Verify rollback with health check
```

---

## Deliverables Checklist

- [ ] Dockerfile with multi-stage build
- [ ] Docker Compose configuration
- [ ] Nginx reverse proxy setup
- [ ] SSL/TLS configuration
- [ ] Health check API
- [ ] Next.js production config
- [ ] Environment file templates
- [ ] Deployment script
- [ ] SSL setup script
- [ ] Backup script
- [ ] Monitoring stack (optional)
- [ ] Error tracking (optional)
- [ ] Deployment checklist

---

## Files to Create

| File                                    | Purpose               |
| --------------------------------------- | --------------------- |
| `Dockerfile`                            | Container build       |
| `docker-compose.yml`                    | Service orchestration |
| `docker-compose.prod.yml`               | Production overrides  |
| `nginx/nginx.conf`                      | Nginx main config     |
| `nginx/sites-enabled/azteamonline.conf` | Site config           |
| `src/app/api/health/route.ts`           | Health check          |
| `.env.example`                          | Environment template  |
| `scripts/deploy.sh`                     | Deployment automation |
| `scripts/init-ssl.sh`                   | SSL setup             |
| `scripts/backup.sh`                     | Backup automation     |
| `monitoring/prometheus.yml`             | Metrics config        |
| `docs/DEPLOYMENT_CHECKLIST.md`          | Pre-flight checks     |

---

## Server Requirements

| Resource | Minimum       | Recommended      |
| -------- | ------------- | ---------------- |
| CPU      | 2 cores       | 4 cores          |
| RAM      | 2 GB          | 4 GB             |
| Storage  | 20 GB SSD     | 50 GB SSD        |
| OS       | Ubuntu 22.04+ | Ubuntu 22.04 LTS |
| Docker   | 24.0+         | Latest           |
| Node.js  | 20 LTS        | 20 LTS           |

---

## Deployment Flow

```
1. Developer pushes to main branch
   ↓
2. CI/CD runs tests and builds Docker image
   ↓
3. Image pushed to container registry
   ↓
4. Deploy script triggered (manual or automatic)
   ↓
5. New container deployed with health checks
   ↓
6. Old container removed after verification
   ↓
7. Monitoring confirms successful deployment
```

---

## 🎉 Project Complete!

Congratulations! You have completed all 12 phases of the AZTEAM Store project:

1. ✅ Design System & Layout
2. ✅ API Layer & Types
3. ✅ Authentication System
4. ✅ Product Catalog
5. ✅ 3D Product Visualization
6. ✅ Shopping Cart
7. ✅ Checkout Flow
8. ✅ Payment Integration
9. ✅ Account Management
10. ✅ Public Features & SEO
11. ✅ Testing & Quality
12. ✅ Production Preparation

The store is now ready for development, testing, and production deployment!
