# AnimeSenpai Deployment Checklist

## 📋 Pre-Deployment Checklist

### 1. Security & Vulnerabilities ✅
- [x] All npm/bun security vulnerabilities resolved (0 vulnerabilities)
- [x] Environment variables documented
- [x] API keys secured in environment variables
- [x] CORS properly configured
- [x] Rate limiting enabled on all public endpoints
- [x] Helmet.js security headers enabled

### 2. Assets & Media 🎨
- [ ] **OG Image** - Create `/public/og-image.png` (1200x630px)
  - Should feature AnimeSenpai branding
  - Optimized for social media sharing
  
- [ ] **Favicon** - Create `/public/favicon.ico` (32x32px, 16x16px)
  - Should be recognizable at small sizes
  
- [ ] **App Icons** - Create PWA icons in `/public/icons/`:
  - [ ] `icon-72x72.png`
  - [ ] `icon-96x96.png`
  - [ ] `icon-128x128.png`
  - [ ] `icon-144x144.png`
  - [ ] `icon-152x152.png`
  - [ ] `icon-192x192.png`
  - [ ] `icon-384x384.png`
  - [ ] `icon-512x512.png`
  - [ ] `apple-touch-icon.png` (180x180px)

- [ ] **Screenshots** - Create app screenshots in `/public/screenshots/`:
  - [ ] `desktop.png` (1280x720px)
  - [ ] `mobile.png` (750x1334px)

### 3. SEO & Analytics 🔍
- [x] Sitemap.xml configured (`/sitemap.ts`)
- [x] Robots.txt configured (`/robots.ts`)
- [x] Meta tags properly set
- [x] OpenGraph images configured
- [x] Twitter Card meta tags set
- [x] PWA manifest created (`/manifest.json`)
- [ ] Google Search Console verification code added to env
  - Add `NEXT_PUBLIC_GOOGLE_VERIFICATION` to `.env`
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [x] Vercel Analytics enabled
- [x] Vercel Speed Insights enabled

### 4. Database & Data 💾

#### Production Database Setup
- [ ] Create production Prisma database (Neon/PlanetScale/Supabase)
- [ ] Update `DATABASE_URL` in Vercel environment variables
- [ ] Run migrations: `bunx prisma migrate deploy`
- [ ] Verify database connection

#### Data Import
- [ ] Import anime data to production database
  - Prepare anime data source (MAL/AniList API or JSON export)
  - Run import script with production DATABASE_URL
  - Verify anime count and data integrity
  
- [ ] Generate ML embeddings for recommendations
  - Run embedding generation script
  - Verify embedding data in database
  - Test recommendation queries

#### Clean Up
- [ ] Delete test user accounts (5 accounts to remove)
- [ ] Remove seed/development data
- [ ] Verify only production data remains

### 5. Environment Variables 🔐

#### Frontend (.env.local / Vercel)
```bash
# Required
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NEXT_PUBLIC_SITE_URL=https://animesenpai.app

# Optional (for analytics/features)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-verification-code
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

#### Backend (.env / Vercel)
```bash
# Required - Database
DATABASE_URL=your-production-database-url

# Required - Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-token-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Required - Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@animesenpai.app

# Required - CORS
CORS_ORIGINS=https://animesenpai.app,https://www.animesenpai.app

# Required - Environment
NODE_ENV=production

# Optional - Features
ENABLE_EMAIL_VERIFICATION=true
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=100
```

### 6. Vercel Deployment ⚙️

#### Frontend Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Set framework preset to "Next.js"
- [ ] Set root directory to `AnimeSenpai-Frontend`
- [ ] Set build command: `bun run build`
- [ ] Set install command: `bun install`
- [ ] Set Node.js version: 20.x
- [ ] Add all environment variables from section 5
- [ ] Enable "Automatically expose System Environment Variables"
- [ ] Configure custom domain: `animesenpai.app`
- [ ] Enable HTTPS/SSL (automatic with Vercel)
- [ ] Deploy and verify

#### Backend Deployment  
- [ ] Connect GitHub repository to Vercel
- [ ] Set root directory to `AnimeSenpai-Backend`
- [ ] Set build command: `bun run build` (or use serverless function)
- [ ] Set install command: `bun install`
- [ ] Add all environment variables from section 5
- [ ] Configure API route: `/api/trpc/*`
- [ ] Deploy and verify
- [ ] Test health endpoint: `https://api.animesenpai.app/health`

### 7. DNS & Domain 🌐
- [ ] Purchase domain: `animesenpai.app`
- [ ] Configure DNS A/CNAME records:
  - [ ] `@` → Vercel (frontend)
  - [ ] `www` → Vercel (frontend)
  - [ ] `api` → Vercel (backend)
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Add domain to Vercel project
- [ ] Verify SSL certificate

### 8. Testing & QA 🧪
- [ ] Run through TESTING_GUIDE.md
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test on tablets (iPad)
- [ ] Verify all critical user flows work:
  - [ ] Sign up
  - [ ] Sign in  
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Add anime to list
  - [ ] Search anime
  - [ ] View anime details
  - [ ] Update profile
  - [ ] Admin panel (if admin user)
- [ ] Performance audit with Lighthouse (target 90+ scores)
- [ ] Accessibility audit (WCAG AA compliance)

### 9. Monitoring & Error Tracking 📊
- [ ] Set up Sentry (optional but recommended)
  - Add SENTRY_DSN to environment
  - Configure error boundaries
  - Test error reporting
- [ ] Monitor Vercel Analytics
- [ ] Set up uptime monitoring (UptimeRobot/Pingdom)
- [ ] Configure alerts for errors/downtime

### 10. Legal & Compliance 📜
- [x] Privacy Policy page created
- [x] Terms of Service page created
- [x] Cookie consent banner implemented
- [ ] Review and customize privacy policy for your service
- [ ] Review and customize terms of service
- [ ] GDPR compliance (if targeting EU users)
  - [ ] Add data export functionality
  - [ ] Add account deletion functionality
  - [ ] Cookie consent for analytics

### 11. Performance Optimization ⚡
- [x] Images optimized with Next.js Image component
- [x] Code splitting implemented
- [x] Lazy loading for components
- [ ] Enable CDN for static assets (Vercel automatic)
- [ ] Verify Core Web Vitals
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Enable compression (automatic with Vercel)

### 12. Social Media & Marketing 📱
- [ ] Create social media accounts:
  - [ ] Twitter/X: @AnimeSenpai
  - [ ] Instagram: @AnimeSenpai
  - [ ] Discord server (optional)
- [ ] Prepare launch announcement
- [ ] Create demo video/GIF
- [ ] Submit to directories:
  - [ ] Product Hunt
  - [ ] Hacker News Show HN
  - [ ] Reddit r/anime
  - [ ] IndieHackers

---

## 🚀 Deployment Steps

### Step 1: Pre-Flight Check
```bash
# Frontend
cd AnimeSenpai-Frontend
bun install
bun run build
bun run start  # Test production build locally

# Backend  
cd AnimeSenpai-Backend
bun install
bunx prisma generate
bun run build
bun run start  # Test production build locally
```

### Step 2: Deploy Backend
1. Push latest code to `main` branch
2. Vercel auto-deploys from `main`
3. Add environment variables in Vercel dashboard
4. Run database migrations
5. Verify deployment at health endpoint

### Step 3: Deploy Frontend
1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Push latest code to `main` branch
3. Vercel auto-deploys from `main`
4. Add environment variables in Vercel dashboard
5. Verify deployment

### Step 4: Post-Deployment
1. Test all critical user flows
2. Monitor error logs
3. Check analytics
4. Verify email sending works
5. Test payment flows (if applicable)

### Step 5: Go Live! 🎉
1. Announce on social media
2. Submit to directories
3. Monitor user feedback
4. Iterate and improve

---

## 📝 Post-Launch Tasks

### Week 1
- [ ] Monitor error logs daily
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately
- [ ] Monitor server performance

### Week 2-4  
- [ ] Analyze user behavior in analytics
- [ ] Gather feature requests
- [ ] Plan next iteration
- [ ] Optimize based on real usage patterns

### Ongoing
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Regular performance reviews
- [ ] User feedback incorporation

---

## 🔗 Important Links

- **Frontend**: https://animesenpai.app
- **Backend API**: https://api.animesenpai.app
- **Admin Panel**: https://animesenpai.app/admin
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/AnimeSenapi
- **Documentation**: /README.md

---

## 🆘 Emergency Contacts

- **Primary Developer**: [Your Email]
- **DevOps**: [DevOps Contact]  
- **Vercel Support**: support@vercel.com
- **Incident Response**: [On-call rotation]

---

**Last Updated**: October 13, 2024
**Status**: Ready for deployment pending asset creation and data import

