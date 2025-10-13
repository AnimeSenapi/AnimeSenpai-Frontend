# Error Handling Guide

This guide explains how to use the improved error handling system in AnimeSenpai.

## Overview

The error handling system provides:
- ✅ **Centralized error management** with `errorHandler`
- ✅ **User-friendly error messages** automatically translated
- ✅ **Reusable UI components** for consistent error display
- ✅ **React hooks** for easy error handling in components
- ✅ **Error boundaries** to catch React rendering errors
- ✅ **Error logging** ready for external services (Sentry, LogRocket, etc.)

---

## Quick Start

### 1. Basic Error Handling with `useError` Hook

```tsx
import { useError } from '@/hooks/use-error'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'

function MyComponent() {
  const { error, setError, clearError } = useError()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      clearError() // Clear previous errors
      const result = await fetchData()
      setData(result)
    } catch (err) {
      setError(err, { component: 'MyComponent', action: 'loadData' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={loadData} />
  
  return <div>{/* Your content */}</div>
}
```

### 2. Async Operations with `useAsyncError`

```tsx
import { useAsyncError } from '@/hooks/use-error'
import { ErrorState } from '@/components/ui/error-state'
import { LoadingState } from '@/components/ui/loading-state'

function MyComponent() {
  const { execute, loading, error, data } = useAsyncError(fetchAnimeData)

  useEffect(() => {
    execute(animeId) // Automatically handles errors
  }, [animeId])

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} onRetry={() => execute(animeId)} />
  if (!data) return null
  
  return <div>{/* Render data */}</div>
}
```

---

## Components

### ErrorState Component

Display errors in a user-friendly way:

```tsx
import { ErrorState } from '@/components/ui/error-state'

// Inline error (default)
<ErrorState 
  error={error}
  onRetry={handleRetry}
  showHome={true}
/>

// Compact error (for tight spaces)
<ErrorState 
  error={error}
  variant="compact"
  onRetry={handleRetry}
/>

// Full page error
<ErrorState 
  error={error}
  variant="full"
  onRetry={handleRetry}
  showHome={true}
/>
```

### LoadingState Component

Display loading states:

```tsx
import { LoadingState } from '@/components/ui/loading-state'

// Inline loading (default)
<LoadingState text="Loading anime..." />

// Full page loading
<LoadingState variant="full" text="Loading..." />

// Overlay loading (over content)
<div className="relative">
  <YourContent />
  {loading && <LoadingState variant="overlay" />}
</div>

// Small spinner (for buttons)
<Spinner className="h-4 w-4" />
```

### EmptyState Component

For when there's no data (not an error):

```tsx
import { EmptyState } from '@/components/ui/error-state'

<EmptyState
  icon={<Search className="h-10 w-10" />}
  title="No anime found"
  message="Try adjusting your search criteria"
  actionLabel="Clear Filters"
  onAction={clearFilters}
/>
```

---

## Error Types

The system includes predefined error types:

```typescript
ErrorType.NETWORK_ERROR      // Connection issues
ErrorType.TIMEOUT_ERROR       // Request timeout
ErrorType.AUTH_ERROR          // Authentication failed
ErrorType.TOKEN_EXPIRED       // Session expired
ErrorType.UNAUTHORIZED        // No permission
ErrorType.API_ERROR           // API request failed
ErrorType.NOT_FOUND           // Resource not found
ErrorType.VALIDATION_ERROR    // Invalid input
ErrorType.SERVER_ERROR        // Server issues
ErrorType.RENDER_ERROR        // React rendering error
ErrorType.STATE_ERROR         // State management error
ErrorType.DATA_ERROR          // Data processing error
ErrorType.PARSE_ERROR         // JSON/data parsing error
ErrorType.UNKNOWN_ERROR       // Unexpected error
```

---

## Advanced Usage

### Manual Error Creation

```tsx
import { createError, ErrorType } from '@/lib/error-handler'

const error = createError(
  ErrorType.VALIDATION_ERROR,
  'Invalid email format',
  originalError,
  { field: 'email', value: userInput }
)
```

### Error Logging

Errors are automatically logged to:
- ✅ Console (development only)
- ✅ In-memory log (last 50 errors)
- 🔜 External service (Sentry, LogRocket) - TODO

```tsx
import { errorHandler } from '@/lib/error-handler'

// Get recent errors for debugging
const recentErrors = errorHandler.getRecentErrors(10)

// Check if error should be retried
if (errorHandler.shouldRetry(error)) {
  // Retry logic
}

// Check if error requires authentication
if (errorHandler.requiresAuth(error)) {
  router.push('/auth/signin')
}
```

---

## Error Boundaries

Error boundaries catch rendering errors:

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Wrap components that might error
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<MyCustomErrorUI />}>
  <MyComponent />
</ErrorBoundary>
```

The root `Providers` component already wraps the entire app with an ErrorBoundary.

---

## Best Practices

### ✅ DO:

1. **Always use try-catch for async operations**
```tsx
try {
  await fetchData()
} catch (err) {
  setError(err, { context: 'useful info' })
}
```

2. **Provide context when logging errors**
```tsx
setError(err, { 
  component: 'AnimeCard',
  action: 'loadDetails',
  animeId: anime.id 
})
```

3. **Clear errors before retry**
```tsx
const handleRetry = () => {
  clearError()
  loadData()
}
```

4. **Use appropriate variants**
```tsx
// Tight space? Use compact
<ErrorState variant="compact" error={error} />

// Full page error? Use full
<ErrorState variant="full" error={error} />
```

5. **Show loading states**
```tsx
if (loading) return <LoadingState />
if (error) return <ErrorState error={error} />
```

### ❌ DON'T:

1. **Don't swallow errors silently**
```tsx
// BAD
try {
  await fetchData()
} catch (err) {
  // Silent failure
}

// GOOD
try {
  await fetchData()
} catch (err) {
  setError(err)
}
```

2. **Don't show technical errors to users**
```tsx
// BAD
<div>Error: {error.stack}</div>

// GOOD
<ErrorState error={error} />
```

3. **Don't forget to handle loading states**
```tsx
// BAD
{data && <Component data={data} />}

// GOOD
{loading && <LoadingState />}
{error && <ErrorState error={error} />}
{data && <Component data={data} />}
```

---

## Integration with External Services

### Sentry (TODO)

Uncomment in `ErrorBoundary.tsx`:

```typescript
// Install: bun add @sentry/nextjs
// Add to .env.local: NEXT_PUBLIC_SENTRY_DSN=your_dsn

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})

// Then in ErrorBoundary:
Sentry.captureException(error, { 
  contexts: { 
    react: { componentStack: errorInfo.componentStack } 
  } 
})
```

---

## Examples

See these components for real-world examples:
- `/app/dashboard/page.tsx` - Error handling in data loading
- `/app/anime/[slug]/page.tsx` - Multiple error states
- `/components/search/SearchBar.tsx` - Error recovery

---

## Testing

Test error handling:

```tsx
// Trigger network error
throw new TypeError('fetch failed')

// Trigger auth error
throw new Error('token expired')

// Trigger validation error
throw new Error('Invalid email format')
```

---

## Support

For questions or issues with error handling:
- Check console for detailed error logs (development)
- Review `errorHandler.getRecentErrors()` for error history
- Contact the development team

