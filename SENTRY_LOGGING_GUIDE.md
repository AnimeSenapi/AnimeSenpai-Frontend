# Sentry Logging Guide

Sentry logging is now fully configured in AnimeSenpai! This guide shows you how to use it.

## 🎯 Quick Start

```typescript
import { logger, captureException, withSpan } from '@/lib/logger'

// Log at different severity levels
logger.info('User logged in', { userId: user.id })
logger.warn('API rate limit approaching', { remaining: 10 })
logger.error('Payment failed', { orderId: '123', amount: 99.99 })
```

## 📚 Logging Levels

### 1. **trace** - Most verbose debugging
```typescript
logger.trace('Starting database connection', { database: 'users' })
```

### 2. **debug** - Detailed debugging information
Use `logger.fmt` template literal for dynamic values:
```typescript
logger.debug(logger.fmt`Cache miss for user: ${userId}`)
```

### 3. **info** - General informational messages
```typescript
logger.info('Updated profile', { profileId: 345 })
```

### 4. **warn** - Warning messages
```typescript
logger.warn('Rate limit reached for endpoint', {
  endpoint: '/api/results/',
  isEnterprise: false,
})
```

### 5. **error** - Error events
```typescript
logger.error('Failed to process payment', {
  orderId: 'order_123',
  amount: 99.99,
})
```

### 6. **fatal** - Critical errors
```typescript
logger.fatal('Database connection pool exhausted', {
  database: 'users',
  activeConnections: 100,
})
```

## 🐛 Exception Handling

### Basic Exception Capture
```typescript
try {
  await riskyOperation()
} catch (error) {
  captureException(error, {
    context: { userId: user.id, operation: 'update_profile' },
    tags: { feature: 'profile' },
    level: 'error'
  })
  throw error
}
```

### Custom Messages
```typescript
captureMessage('User completed onboarding', { 
  level: 'info',
  tags: { flow: 'onboarding' },
  context: { userId: user.id, step: 9 }
})
```

## 📊 Performance Tracking

### Track API Calls
```typescript
async function fetchUserData(userId: string) {
  return withSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async (span) => {
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      
      // Add custom attributes
      span.setAttribute('user_id', userId)
      span.setAttribute('response_size', JSON.stringify(data).length)
      
      return data
    }
  )
}
```

### Track UI Interactions
```typescript
function TestComponent() {
  const handleClick = () => {
    withSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      async (span) => {
        span.setAttribute("button_id", "test-button")
        span.setAttribute("timestamp", Date.now())
        
        await doSomething()
      }
    )
  }

  return <button onClick={handleClick}>Test</button>
}
```

## 🔧 Configuration Files

Logging is enabled in these files:
- **Client**: `sentry.client.config.ts` - Browser logging
- **Server**: `sentry.server.config.ts` - Server-side logging  
- **Edge**: `sentry.edge.config.ts` - Edge runtime logging

All configs include:
```typescript
_experiments: {
  enableLogs: true,
},

integrations: [
  Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
],
```

## 📖 Real-World Examples

### In API Client (src/app/lib/api.ts)
```typescript
try {
  const response = await fetch(url)
  const data = await response.json()
  return data
} catch (error) {
  logger.error('API request failed', { 
    url, 
    error: error instanceof Error ? error.message : String(error)
  })
  captureException(error, { 
    context: { url, method: 'GET' },
    tags: { operation: 'api_call' }
  })
  throw error
}
```

### In Auth Flow
```typescript
async function signin(email: string, password: string) {
  try {
    const result = await apiSignin({ email, password })
    logger.info('User signed in successfully', { userId: result.user.id })
    return result
  } catch (error) {
    logger.error('Sign in failed', { email })
    captureException(error, {
      context: { email, flow: 'signin' },
      tags: { auth: 'signin_failure' }
    })
    throw error
  }
}
```

### In Components
```typescript
'use client'

import { logger } from '@/lib/logger'
import { useEffect } from 'react'

export default function MyComponent() {
  useEffect(() => {
    logger.info('Component mounted', { component: 'MyComponent' })
    
    return () => {
      logger.debug('Component unmounted', { component: 'MyComponent' })
    }
  }, [])
  
  const handleAction = async () => {
    try {
      await someAsyncAction()
      logger.info('Action completed successfully')
    } catch (error) {
      logger.error('Action failed', { error })
    }
  }
  
  return <button onClick={handleAction}>Do Something</button>
}
```

## 🎨 Best Practices

1. **Use structured data**: Pass objects with context, don't concatenate strings
   ```typescript
   // ✅ Good
   logger.info('User updated profile', { userId, fields: ['name', 'bio'] })
   
   // ❌ Bad
   logger.info(`User ${userId} updated profile`)
   ```

2. **Use appropriate levels**: Don't log everything as error
   - `trace/debug` = Development/debugging only
   - `info` = Important business events
   - `warn` = Potential issues
   - `error` = Actual errors
   - `fatal` = Critical system failures

3. **Add context**: Include relevant data for debugging
   ```typescript
   logger.error('Payment processing failed', {
     orderId,
     amount,
     paymentMethod,
     errorCode,
     userId
   })
   ```

4. **Don't log sensitive data**: Never log passwords, tokens, or PII
   ```typescript
   // ❌ Bad
   logger.info('User logged in', { email, password })
   
   // ✅ Good  
   logger.info('User logged in', { userId: user.id })
   ```

## 🔍 Viewing Logs in Sentry

1. Go to your Sentry dashboard: https://sentry.io
2. Select your project: **animesenpai**
3. Navigate to **Issues** or **Performance** tabs
4. Logs will appear with console messages and custom log entries
5. Use filters to search by level, tags, or context

## 📱 Console Integration

With `consoleLoggingIntegration` enabled, these console calls are automatically sent to Sentry:
```typescript
console.log('This will appear in Sentry')
console.warn('This warning goes to Sentry')
console.error('This error is tracked in Sentry')
```

However, prefer using the structured logger for better organization:
```typescript
logger.info('Message', { context: 'data' })  // ✅ Better
```

## 🚀 Next Steps

- Replace remaining `console.error()` calls with `logger.error()`
- Add performance spans to slow operations
- Use structured logging for better debugging
- Monitor Sentry dashboard for issues and patterns

