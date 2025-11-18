# AnimeSenpai Frontend

Modern Next.js frontend powered by Bun, TypeScript, React 19, and Tailwind CSS. Connects to the backend tRPC API.

## Table of Contents

- [Quick Start](#quick-start)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Project Structure](#project-structure)
- [Features](#features)
- [Testing](#testing)
- [Performance & Optimization](#performance--optimization)
- [PWA Support](#pwa-support)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Sentry Integration](#sentry-integration)
- [Security](#security)
- [Documentation](#documentation)

---

## Quick Start

### First-Time Setup

```bash
# From repo root
cd AnimeSenpai-Frontend

# Install dependencies
bun install

# Copy environment template
cp env.example .env.local

# Configure backend URL (default dev port is 3005)
echo "NEXT_PUBLIC_API_URL=http://localhost:3005/api/trpc" >> .env.local

# Start the dev server
bun dev
# → http://localhost:3000
```

### Running Backend Alongside

The frontend requires the backend API to be running:

```bash
# In a separate terminal
cd ../AnimeSenpai-Backend
bun dev  # → http://localhost:3005
```

---

## Requirements

- **Bun 1.0+** (required - Node.js 18+ also supported)
- **Backend API** running on port 3005 (or configured port)
- **Modern browser** with ES2020+ support

---

## Environment Variables

Create `.env.local` from `env.example` and configure the following:

### Required

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3005/api/trpc

# Sentry Error Tracking (already configured)
NEXT_PUBLIC_SENTRY_DSN=https://e2e5e2b86c43e243dc494c8b8c866aaa@o4510183717732352.ingest.de.sentry.io/4510183722123344
SENTRY_DSN=https://e2e5e2b86c43e243dc494c8b8c866aaa@o4510183717732352.ingest.de.sentry.io/4510183722123344
```

### Optional

```env
# Google Search Console Verification (for SEO)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-verification-code

# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Feature Flags
NEXT_PUBLIC_ENABLE_SOCIAL_FEATURES=true
NEXT_PUBLIC_MAINTENANCE_MODE=false

# Sentry Auth Token (for source maps upload)
SENTRY_AUTH_TOKEN=your_auth_token_here
```

**Important:** Keep secrets out of git. Use Vercel/hosted environment variables in production.

---

## Development

### Development Server

```bash
# Start dev server
bun dev
# → http://localhost:3000
```

The dev server includes:
- Hot module replacement (HMR)
- Fast refresh
- TypeScript type checking
- ESLint warnings

### Build & Production

```bash
# Build for production
bun run build

# Start production server
bun run start

# Type check only
bun run type-check
```

### Code Quality

```bash
# Linting
bun run lint

# Format code
bun run fmt

# Check formatting
bun run fmt:check

# Type checking
bun run type-check
```

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true bun run build

# Check performance budgets
bun run budget:check
```

---

## Project Structure

```
AnimeSenpai-Frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (routes)/          # Route pages
│   │   │   ├── anime/         # Anime detail pages
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── dashboard/    # User dashboard
│   │   │   ├── discover/     # Discover anime
│   │   │   ├── mylist/        # User's anime list
│   │   │   ├── search/        # Search functionality
│   │   │   ├── user/          # User profiles
│   │   │   └── ...
│   │   ├── api/               # API routes
│   │   │   └── trpc/         # tRPC handler
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── anime/            # Anime-related components
│   │   ├── navbar/           # Navigation components
│   │   ├── search/           # Search components
│   │   ├── social/           # Social features
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-analytics.ts
│   │   ├── use-touch-gestures.ts
│   │   └── ...
│   ├── lib/                   # Utilities and helpers
│   │   ├── api.ts            # tRPC client setup
│   │   ├── auth-context.tsx  # Authentication context
│   │   └── ...
│   ├── styles/                # Global styles
│   │   ├── globals.css
│   │   ├── accessibility.css
│   │   └── ...
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker
│   ├── icons/                 # App icons
│   └── ...
├── e2e/                       # End-to-end tests (Playwright)
├── cypress/                   # E2E tests (Cypress)
├── scripts/                   # Build and utility scripts
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

---

## Features

### Core Features

- **Anime Discovery** - Browse, search, and discover anime
- **Personal Lists** - Track watching, completed, plan-to-watch, and dropped anime
- **Recommendations** - AI-powered personalized recommendations
- **Social Features** - Follow users, compare lists, view profiles
- **Achievements** - Gamification system with achievements and leaderboards
- **Calendar** - View seasonal anime releases
- **Reviews** - Write and read anime reviews
- **Activity Feed** - See what friends are watching
- **Notifications** - Real-time notifications
- **Messaging** - Direct messaging between users

### Technical Features

- **Type-Safe API** - Full TypeScript with tRPC
- **Server-Side Rendering** - Next.js App Router with SSR/SSG
- **Progressive Web App** - Installable PWA with offline support
- **Responsive Design** - Mobile-first responsive design
- **Dark Mode** - System-aware dark mode support
- **Accessibility** - WCAG 2.1 AA compliant
- **Performance** - Optimized images, code splitting, lazy loading
- **Error Handling** - Comprehensive error boundaries and handling
- **Analytics** - Vercel Analytics and Speed Insights

---

## Testing

### Unit Tests

```bash
# Run tests
bun test

# Watch mode
bun run test:watch

# With coverage
bun run test:coverage

# Check coverage thresholds
bun run coverage:check
```

### End-to-End Tests

**Playwright:**
```bash
# Run E2E tests
bun run test:e2e

# UI mode
bun run test:e2e:ui

# Debug mode
bun run test:e2e:debug
```

**Cypress:**
```bash
# Open Cypress UI
bun run cy:open

# Run Cypress tests
bun run cy:run
```

### Accessibility Testing

Cypress includes accessibility testing with `cypress-axe`:

```bash
bun run cy:open
# Run a11y-smoke.cy.ts tests
```

---

## Performance & Optimization

### Built-in Optimizations

- **Image Optimization** - Next.js Image component with AVIF/WebP support
- **Code Splitting** - Automatic route-based code splitting
- **Tree Shaking** - Unused code elimination
- **Bundle Optimization** - Optimized package imports
- **CSS Optimization** - Critical CSS extraction
- **Compression** - Gzip compression enabled
- **Caching** - Aggressive caching for static assets

### Performance Monitoring

- **Vercel Analytics** - Real-time performance metrics
- **Web Vitals** - Core Web Vitals tracking
- **Sentry Performance** - Transaction monitoring
- **Performance Dashboard** - Available at `/performance`

### Bundle Analysis

```bash
# Analyze bundle size
ANALYZE=true bun run build
# View report at .next/analyze/client.html
```

### Performance Budgets

Check performance budgets:

```bash
bun run budget:check
```

---

## PWA Support

The frontend is a fully-featured Progressive Web App:

### Features

- **Installable** - Can be installed on mobile and desktop
- **Offline Support** - Service worker for offline functionality
- **App Shortcuts** - Quick access to My List, Discover, Search, Calendar
- **Share Target** - Share content to the app
- **App Icons** - Multiple icon sizes for all devices
- **Splash Screens** - Custom splash screens for iOS

### Manifest

Configured in `public/manifest.json`:
- App name and description
- Theme colors
- Display mode (standalone)
- Icons and shortcuts
- Share target configuration

### Service Worker

Service worker located at `public/sw.js` handles:
- Offline caching
- Background sync
- Push notifications (future)

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Keyboard Navigation** - Full keyboard support
- **Screen Readers** - ARIA labels and semantic HTML
- **Focus Management** - Visible focus indicators
- **Color Contrast** - WCAG AA compliant contrast ratios
- **Skip Links** - Skip to main content
- **Error Messages** - Accessible error announcements

### Accessibility Features

- **Focus Trap** - Modal focus management
- **Route A11y** - Accessibility hooks for route changes
- **Haptic Feedback** - Mobile haptic feedback support
- **Touch Gestures** - Accessible gesture support

### Testing

```bash
# Run accessibility tests with Cypress
bun run cy:open
# Run a11y-smoke.cy.ts
```

---

## Deployment

### Vercel (Recommended)

The frontend is optimized for Vercel deployment:

1. **Connect Repository** - Link your GitHub repository
2. **Configure Environment Variables** - Add all required env vars
3. **Deploy** - Automatic deployments on push

**Environment Variables to Set:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry DSN
- `SENTRY_DSN` - Sentry DSN (server)
- `SENTRY_AUTH_TOKEN` - For source maps (optional)
- `NEXT_PUBLIC_GOOGLE_VERIFICATION` - SEO verification

### Docker

**Build:**
```bash
docker build -t animesenpai-frontend .
```

**Run:**
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="..." \
  -e NEXT_PUBLIC_SENTRY_DSN="..." \
  animesenpai-frontend
```

**Docker Compose:**
```bash
# From repo root
docker compose up --build
```

The Dockerfile uses multi-stage builds and runs as a non-root user for security.

### Build Output

Production builds use `standalone` output mode for optimal performance:
- Minimal dependencies
- Optimized for serverless/container deployment
- Fast cold starts

---

## Sentry Integration

### Configuration

Sentry is configured in three places:

1. **Client-side:** `instrumentation-client.ts`
2. **Server-side:** `sentry.server.config.ts`
3. **Edge runtime:** `sentry.edge.config.ts`

### Features

- **Error Tracking** - Automatic error capture
- **Performance Monitoring** - Transaction tracking
- **Session Replay** - User session recordings
- **Source Maps** - Upload source maps for better debugging
- **Console Logging** - Log console errors/warnings
- **Breadcrumbs** - Automatic breadcrumb collection

### Usage

```typescript
import * as Sentry from '@sentry/nextjs'

// Capture exceptions
try {
  // code
} catch (error) {
  Sentry.captureException(error)
}

// Create spans for performance tracking
Sentry.startSpan(
  {
    op: 'ui.click',
    name: 'Button Click',
  },
  (span) => {
    // Your code here
    span.setAttribute('buttonId', 'submit')
  }
)

// Logging (if enabled)
const { logger } = Sentry
logger.info('User action', { userId: '123' })
```

### Filtering

The client-side config filters out:
- Chunk loading errors (transient network issues)
- Performance warnings in development
- Network-related transient errors

---

## Security

### Security Headers

All responses include comprehensive security headers via `middleware.ts`:

- **Content-Security-Policy** - Strict CSP with nonce support
- **X-Frame-Options** - SAMEORIGIN
- **X-Content-Type-Options** - nosniff
- **Strict-Transport-Security** - HSTS with preload
- **Referrer-Policy** - strict-origin-when-cross-origin
- **Cross-Origin-Opener-Policy** - same-origin
- **Cross-Origin-Resource-Policy** - same-site

### Content Security Policy

CSP configured with:
- Nonce-based script execution
- Strict image source allowlist
- Limited connect sources (API, Sentry, Analytics)
- No inline styles (except nonced)
- Frame ancestors: none

### SEO Protection

Sensitive routes marked with `X-Robots-Tag: noindex, nofollow`:
- `/auth/*` - Authentication pages
- `/user/settings` - User settings
- `/admin/*` - Admin pages
- `/api/*` - API routes
- `/dashboard/*` - Dashboard pages
- `/error/*` - Error pages

### Image Security

- SVG disabled for security (`dangerouslyAllowSVG: false`)
- Remote image patterns restricted to allowlist
- Image optimization with modern formats (AVIF/WebP)

---

## Documentation

### Component Documentation

- **[ACCESSIBILITY_GUIDE.md](src/components/ACCESSIBILITY_GUIDE.md)** - Accessibility guidelines
- **[ERROR_BOUNDARY_GUIDE.md](src/components/ERROR_BOUNDARY_GUIDE.md)** - Error boundary usage

### Configuration Files

- **next.config.js** - Next.js configuration with optimizations
- **tailwind.config.js** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration
- **playwright.config.ts** - Playwright E2E test configuration
- **cypress.config.ts** - Cypress E2E test configuration

### Related Projects

- **Backend:** `../AnimeSenpai-Backend`
- **Root README:** `../README.md`

---

## Important Notes

- ⚠️ **Use Bun for all commands** (not npm/pnpm/yarn)
- ⚠️ **Frontend port: 3000**; Backend port: 3005
- ⚠️ **Ensure `NEXT_PUBLIC_API_URL` matches your backend**
- ⚠️ **Never commit `.env.local`** - use environment variables in deployment
- ⚠️ **ESLint is enforced** during builds - fix linting errors before deploying

---

## Troubleshooting

### Common Issues

**Backend Connection Errors:**
- Verify backend is running on port 3005
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured correctly in backend

**Build Errors:**
- Run `bun install` to ensure dependencies are installed
- Clear `.next` folder: `rm -rf .next`
- Check TypeScript errors: `bun run type-check`

**Sentry Errors:**
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly
- Check Sentry project configuration
- Review Sentry dashboard for error details

**Performance Issues:**
- Run bundle analysis: `ANALYZE=true bun run build`
- Check performance dashboard: `/performance`
- Review Web Vitals in Vercel Analytics

---

## Support

For issues or questions:

1. Check this README
2. Review component documentation
3. Check terminal logs and browser console
4. Review Sentry dashboard for errors
5. Check Vercel Analytics for performance issues

---

## License

See `LICENSE` file for license information.
