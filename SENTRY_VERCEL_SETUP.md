# Sentry + Vercel Integration Setup Guide

## Issue: Errors not appearing in Sentry from Vercel deployment

This guide will help you verify and fix your Sentry integration with Vercel.

## ✅ Step 1: Verify Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Verify these variables are set:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://e2e5e2b86c43e243dc494c8b8c866aaa@o4510183717732352.ingest.de.sentry.io/4510183722123344
SENTRY_ORG=animesenpai
SENTRY_PROJECT=animesenpai
```

4. Make sure they're enabled for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

## ✅ Step 2: Check Sentry Auth Token (Optional but Recommended)

For source map uploads to work in CI/CD:

1. Go to Sentry → **Settings** → **Auth Tokens**
2. Create a new auth token with scope: `project:releases`
3. Add to Vercel:
```bash
SENTRY_AUTH_TOKEN=your_token_here
```

## ✅ Step 3: Verify Build is Uploading Source Maps

Check your Vercel build logs. You should see:

```
[@sentry/nextjs - Node.js] Info: Successfully uploaded source maps to Sentry
[@sentry/nextjs - Edge] Info: Successfully uploaded source maps to Sentry
[@sentry/nextjs - Client] Info: Successfully uploaded source maps to Sentry
```

If you DON'T see this, source maps aren't being uploaded, making errors harder to debug.

## ✅ Step 4: Test Error Capture

### Option A: Use the Test Page (Recommended)

1. Deploy your site
2. Visit `https://your-site.vercel.app/test-sentry`
3. Click each test button
4. Check Sentry dashboard for the errors

### Option B: Trigger a Real Error

Add this to any page temporarily:

```typescript
'use client'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function TestPage() {
  useEffect(() => {
    // This will send an error to Sentry
    Sentry.captureException(new Error('Test error from Vercel'))
  }, [])
  
  return <div>Test page - check Sentry</div>
}
```

## ✅ Step 5: Check Sentry Dashboard

1. Go to https://sentry.io
2. Select organization: **animesenpai**
3. Select project: **animesenpai**
4. Navigate to **Issues** tab
5. You should see your test errors appear within 1-2 minutes

## ✅ Step 6: Verify Environment Detection

Your current config filters out development errors:

```typescript
beforeSend(event, hint) {
  // Don't send errors in development
  if (process.env.NODE_ENV === "development") {
    console.error("Sentry Error (dev):", hint.originalException);
    return null;  // ← This prevents errors from being sent
  }
  return event;
}
```

**Make sure Vercel is setting `NODE_ENV=production`**

Check in Vercel:
- Settings → Environment Variables
- `NODE_ENV` should be automatically set to `production` for production deployments

## 🔧 Common Issues & Fixes

### Issue 1: DSN Not Set
**Symptom:** No errors appear in Sentry at all

**Fix:** Set `NEXT_PUBLIC_SENTRY_DSN` in Vercel environment variables

### Issue 2: Wrong Environment
**Symptom:** Errors work locally but not on Vercel

**Fix:** Verify `NODE_ENV=production` on Vercel deployments

### Issue 3: Source Maps Not Uploading
**Symptom:** Errors appear but stack traces are minified/unreadable

**Fix:** 
- Set `SENTRY_AUTH_TOKEN` in Vercel
- Verify build logs show "Successfully uploaded source maps"

### Issue 4: Errors Being Filtered Out
**Symptom:** Some errors appear, others don't

**Fix:** Check your `beforeSend` filter isn't too aggressive:
```typescript
beforeSend(event, hint) {
  // Make sure this isn't filtering out your errors
  if (event.exception) {
    const error = hint.originalException;
    if (error instanceof Error) {
      // Only filter specific known issues
      if (error.message.includes("Network request failed")) {
        return null;
      }
    }
  }
  return event;  // ← Important: return event for errors you want to track
}
```

### Issue 5: Integration Not Linked
**Symptom:** Vercel and Sentry aren't connected

**Fix:**
1. In Vercel, go to your project
2. Click **Settings** → **Integrations**
3. Find **Sentry** and click **Add Integration**
4. Follow the setup wizard
5. Redeploy your project

## 🧪 Quick Test Checklist

After deploying:

- [ ] Visit `/test-sentry` on your Vercel deployment
- [ ] Click "Test Exception Capture" button
- [ ] Wait 1-2 minutes
- [ ] Check Sentry dashboard for the error
- [ ] Verify stack trace is readable (source maps working)
- [ ] Check that environment shows as "production"

## 🎯 Expected Sentry Dashboard View

You should see:
- **Issues tab**: All captured exceptions
- **Performance tab**: Page load times, API calls
- **Releases tab**: Your git commits with source maps
- **Breadcrumbs**: User actions leading to errors

## 📝 Additional Configuration

### Enable Better Error Boundaries

Create a `global-error.tsx` file in your app directory:

```typescript
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

This will catch React rendering errors and send them to Sentry.

## 🔍 Debugging Steps

1. **Check Sentry Project Settings:**
   - Verify your DSN is correct
   - Check that the project is active
   - Verify rate limits aren't exceeded

2. **Check Browser Console:**
   - Look for Sentry initialization messages
   - Check for any Sentry-related errors

3. **Test Locally with Production Build:**
   ```bash
   NODE_ENV=production bun run build
   NODE_ENV=production bun run start
   ```
   Then test errors - they should go to Sentry

4. **Check Vercel Build Logs:**
   - Look for Sentry source map upload success messages
   - Verify no Sentry-related errors during build

## 📞 Need More Help?

If errors still don't appear:
1. Check Sentry status page: https://status.sentry.io
2. Verify your Sentry plan has quota remaining
3. Check Sentry project settings for any filtering rules
4. Enable Sentry debug mode temporarily:
   ```typescript
   Sentry.init({
     // ... other config
     debug: true,  // ← Enable this temporarily
   })
   ```

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Test errors appear in Sentry Issues tab
- ✅ Stack traces are readable (not minified)
- ✅ Source maps show original file names
- ✅ Environment shows as "production"
- ✅ User context is attached to errors
- ✅ Breadcrumbs show user actions before error

