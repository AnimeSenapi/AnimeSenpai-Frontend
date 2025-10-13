# Environment Variables Guide

## 📝 Overview

This document lists all environment variables required for AnimeSenpai to function properly in development and production.

---

## 🎨 Frontend Environment Variables

### Location
- **Development**: `AnimeSenpai-Frontend/.env.local`
- **Production**: Vercel Dashboard → Project Settings → Environment Variables

### Required Variables

```bash
# API Configuration (Required)
NEXT_PUBLIC_API_URL=http://localhost:3003
# Production: https://api.animesenpai.app or your Vercel backend URL

# Site Configuration (Required)
NEXT_PUBLIC_SITE_URL=http://localhost:3006
# Production: https://animesenpai.app

```

### Optional Variables

```bash
# Google Search Console Verification
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code
# Get from: https://search.google.com/search-console

# Analytics (if using custom analytics)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=false
NEXT_PUBLIC_ENABLE_COMMENTS=false

# Sentry Error Tracking (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

```

### Example `.env.local` (Development)

```bash
# AnimeSenpai Frontend - Development Environment

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_SITE_URL=http://localhost:3006

# Google Verification (leave empty for dev)
NEXT_PUBLIC_GOOGLE_VERIFICATION=

```

### Example `.env.production` (Production)

```bash
# AnimeSenpai Frontend - Production Environment

# API Configuration  
NEXT_PUBLIC_API_URL=https://api.animesenpai.app
NEXT_PUBLIC_SITE_URL=https://animesenpai.app

# Google Verification
NEXT_PUBLIC_GOOGLE_VERIFICATION=abc123xyz456

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXXXXX

```

---

## 🔧 Backend Environment Variables

### Location
- **Development**: `AnimeSenpai-Backend/.env`
- **Production**: Vercel Dashboard → Project Settings → Environment Variables

### Required Variables

```bash
# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/animesenpai
# Production: Use your production database URL (Neon, Supabase, PlanetScale, etc.)

# JWT Authentication (Required)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-token-secret-also-at-least-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Service - Resend (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@animesenpai.app
# Get API key from: https://resend.com/api-keys

# CORS (Required)
CORS_ORIGINS=http://localhost:3006
# Production: https://animesenpai.app,https://www.animesenpai.app

# Environment (Required)
NODE_ENV=development
# Production: production

```

### Optional Variables

```bash
# Rate Limiting
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=100

# Email Verification
ENABLE_EMAIL_VERIFICATION=true
EMAIL_VERIFICATION_EXPIRES_IN=24h

# Redis Cache (if using)
REDIS_URL=redis://localhost:6379
ENABLE_REDIS_CACHE=false

# Sentry Error Tracking
SENTRY_DSN=your-backend-sentry-dsn

# Admin Configuration
ADMIN_EMAIL=admin@animesenpai.app
ADMIN_PASSWORD=temporary-admin-password-change-immediately

# Feature Flags
ENABLE_RECOMMENDATIONS=true
ENABLE_SOCIAL_FEATURES=false

```

### Example `.env` (Development)

```bash
# AnimeSenpai Backend - Development Environment

# Database
DATABASE_URL=file:./prisma/dev.db
# Using SQLite for local development

# JWT Authentication
JWT_SECRET=dev-secret-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=dev-refresh-secret-also-change-in-prod-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Service (Resend)
RESEND_API_KEY=re_dev_key_get_from_resend_dashboard
FROM_EMAIL=dev@animesenpai.app

# CORS
CORS_ORIGINS=http://localhost:3006,http://localhost:3000

# Environment
NODE_ENV=development

# Rate Limiting
ENABLE_RATE_LIMITING=false
MAX_REQUESTS_PER_MINUTE=1000

# Email Verification
ENABLE_EMAIL_VERIFICATION=true

```

### Example `.env.production` (Production)

```bash
# AnimeSenpai Backend - Production Environment

# Database
DATABASE_URL=postgresql://user:pass@aws-0-us-east-1.pooler.supabase.com:5432/postgres
# Or your production database URL

# JWT Authentication (MUST BE SECURE!)
JWT_SECRET=production-secret-generated-with-openssl-rand-hex-32
JWT_REFRESH_SECRET=another-secure-secret-generated-same-way-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Service
RESEND_API_KEY=re_live_xxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@animesenpai.app

# CORS
CORS_ORIGINS=https://animesenpai.app,https://www.animesenpai.app

# Environment
NODE_ENV=production

# Rate Limiting
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=100

# Email Verification
ENABLE_EMAIL_VERIFICATION=true
EMAIL_VERIFICATION_EXPIRES_IN=24h

# Sentry
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

```

---

## 🔐 How to Generate Secure Secrets

### JWT Secrets (Required for Production)

```bash
# Generate secure JWT secret (32+ characters)
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Password Hashing (for admin accounts)

```bash
# Using bcrypt in Node.js/Bun REPL
bun
> const bcrypt = require('bcryptjs')
> bcrypt.hashSync('your-password', 10)
# Copy the hash and store securely
```

---

## 🚀 Setup Instructions

### Development Setup

1. **Frontend**:
   ```bash
   cd AnimeSenpai-Frontend
   cp env.example .env.local
   # Edit .env.local with your values
   bun install
   bun run dev
   ```

2. **Backend**:
   ```bash
   cd AnimeSenpai-Backend
   cp env.example .env
   # Edit .env with your values
   bun install
   bunx prisma generate
   bunx prisma db push  # or migrate dev
   bun run dev
   ```

### Production Setup (Vercel)

1. **Frontend Deployment**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables from "Frontend Environment Variables" section
   - Mark sensitive variables as "Encrypted"
   - Deploy

2. **Backend Deployment**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all required variables from "Backend Environment Variables" section
   - Especially ensure `DATABASE_URL` points to production database
   - Deploy

---

## ⚠️ Security Best Practices

### DO ✅
- Use strong, randomly generated secrets (32+ characters)
- Use different secrets for development and production
- Store secrets in `.env` files (never commit!)
- Use Vercel's encrypted environment variables
- Rotate secrets periodically
- Use different database credentials for dev/prod
- Restrict CORS to specific domains in production

### DON'T ❌
- Commit `.env` files to Git (add to `.gitignore`)
- Use weak or predictable secrets
- Hardcode secrets in source code
- Share secrets in public channels
- Reuse the same secret across services
- Use development secrets in production

---

## 📋 Verification Checklist

### Before Deploying to Production

Frontend:
- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `NEXT_PUBLIC_SITE_URL` is correct domain
- [ ] Google verification code added (if using Search Console)
- [ ] All `NEXT_PUBLIC_*` variables set correctly

Backend:
- [ ] `DATABASE_URL` points to production database
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong and unique
- [ ] `RESEND_API_KEY` is production key (starts with `re_`)
- [ ] `FROM_EMAIL` is verified domain
- [ ] `CORS_ORIGINS` only includes production domain(s)
- [ ] `NODE_ENV=production`
- [ ] `ENABLE_RATE_LIMITING=true`

---

## 🆘 Troubleshooting

### "API connection failed"
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check CORS origins match

### "JWT token invalid"
- Ensure `JWT_SECRET` matches between auth creation and verification
- Verify token hasn't expired
- Check `JWT_EXPIRES_IN` format is correct (e.g., "15m", "7d")

### "Email not sending"
- Verify `RESEND_API_KEY` is correct
- Check `FROM_EMAIL` is verified in Resend dashboard
- Ensure domain is verified for custom email
- Check Resend API logs for errors

### "Database connection error"
- Verify `DATABASE_URL` format is correct
- Check database is accessible from your IP
- Ensure database credentials are correct
- For Vercel: ensure DATABASE_URL is set in environment variables

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Connection Strings](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Resend API Documentation](https://resend.com/docs)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

**Last Updated**: October 13, 2024
**Need Help?**: Contact the dev team or check documentation

