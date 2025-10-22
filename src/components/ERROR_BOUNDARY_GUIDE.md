# Error Boundary Quick Guide

## When to Use Error Boundaries

### ✅ Use Error Boundaries For:
- **Pages**: Wrap entire page components
- **Sections**: Wrap major sections (nav, sidebar, content)
- **Complex Components**: Wrap components with heavy logic
- **Third-Party Components**: Wrap external libraries
- **Data-Fetching Components**: Wrap components that fetch data
- **Async Components**: Wrap components with async operations

### ❌ Don't Use Error Boundaries For:
- **Simple Components**: Don't over-wrap simple components
- **Event Handlers**: Use try-catch in event handlers instead
- **Async Code**: Use try-catch in async functions
- **Server Components**: Error boundaries only work in client components

---

## Quick Reference

### Page-Level (Full Page)
```tsx
import { PageErrorBoundary } from '@/components/PageErrorBoundary'

export default function MyPage() {
  return (
    <PageErrorBoundary pageName="My Page">
      <div>Page content</div>
    </PageErrorBoundary>
  )
}
```

### Section-Level (Major Sections)
```tsx
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary'

export function Navbar() {
  return (
    <SectionErrorBoundary sectionName="Navbar">
      <nav>Navigation content</nav>
    </SectionErrorBoundary>
  )
}
```

### Component-Level (Individual Components)
```tsx
import { ComponentErrorBoundary } from '@/components/ComponentErrorBoundary'

export function AnimeCard({ anime }: Props) {
  return (
    <ComponentErrorBoundary componentName="AnimeCard">
      <div>Card content</div>
    </ComponentErrorBoundary>
  )
}
```

---

## Common Patterns

### Pattern 1: Page with Multiple Sections
```tsx
function DashboardPage() {
  return (
    <PageErrorBoundary pageName="Dashboard">
      <div>
        <SectionErrorBoundary sectionName="Header">
          <Header />
        </SectionErrorBoundary>
        
        <SectionErrorBoundary sectionName="Recommendations">
          <Recommendations />
        </SectionErrorBoundary>
        
        <SectionErrorBoundary sectionName="Trending">
          <Trending />
        </SectionErrorBoundary>
      </div>
    </PageErrorBoundary>
  )
}
```

### Pattern 2: List with Error-Prone Items
```tsx
function AnimeList({ animes }: Props) {
  return (
    <div>
      {animes.map(anime => (
        <ComponentErrorBoundary
          key={anime.id}
          componentName={`AnimeCard-${anime.id}`}
        >
          <AnimeCard anime={anime} />
        </ComponentErrorBoundary>
      ))}
    </div>
  )
}
```

### Pattern 3: Custom Fallback
```tsx
<ErrorBoundary
  fallback={
    <div className="p-4 text-center">
      <p>This component failed to load</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  }
>
  <ComplexComponent />
</ErrorBoundary>
```

### Pattern 4: Auto-Reset on State Change
```tsx
function UserProfile({ userId }: Props) {
  return (
    <ErrorBoundary
      resetKeys={[userId]}
      resetOnPropsChange={true}
    >
      <ProfileContent userId={userId} />
    </ErrorBoundary>
  )
}
```

### Pattern 5: Using HOC
```tsx
import { withErrorBoundary } from '@/components/ErrorBoundary'

function MyComponent() {
  return <div>Content</div>
}

export default withErrorBoundary(MyComponent, {
  level: 'component',
  componentName: 'MyComponent'
})
```

### Pattern 6: Using Hook for Async Errors
```tsx
import { useErrorHandler } from '@/components/ErrorBoundary'

function MyComponent() {
  const handleError = useErrorHandler()
  
  const handleClick = async () => {
    try {
      await fetchData()
    } catch (error) {
      handleError(error)
    }
  }
  
  return <button onClick={handleClick}>Load Data</button>
}
```

---

## Testing Error Boundaries

### Simulate Error
```tsx
function ErrorTest() {
  const [shouldError, setShouldError] = useState(false)
  
  if (shouldError) {
    throw new Error('Test error!')
  }
  
  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  )
}

<ErrorBoundary>
  <ErrorTest />
</ErrorBoundary>
```

### Test Recovery
```tsx
function RecoveryTest() {
  const [count, setCount] = useState(0)
  
  if (count > 5) {
    throw new Error('Too many clicks!')
  }
  
  return (
    <ErrorBoundary resetKeys={[count]}>
      <button onClick={() => setCount(count + 1)}>
        Click {count}
      </button>
    </ErrorBoundary>
  )
}
```

---

## Best Practices

### 1. **Strategic Placement**
- Don't wrap every component
- Wrap at natural boundaries
- Wrap complex or risky components

### 2. **Error Messages**
- Be user-friendly
- Provide context
- Include error IDs
- Don't expose sensitive data

### 3. **Error Recovery**
- Provide clear actions
- Use resetKeys for auto-recovery
- Test recovery flows

### 4. **Error Logging**
- Log to Sentry
- Include context
- Use error IDs
- Monitor error rates

### 5. **Testing**
- Test error boundaries
- Simulate various errors
- Test recovery
- Test in dev and prod

---

## Troubleshooting

### Error Boundary Not Catching Error
- **Problem**: Event handler errors
- **Solution**: Use try-catch in event handlers

### Error Boundary Not Resetting
- **Problem**: resetKeys not changing
- **Solution**: Ensure resetKeys values actually change

### Too Many Error Boundaries
- **Problem**: Over-wrapping components
- **Solution**: Remove unnecessary error boundaries

### Error Boundary Catching Expected Errors
- **Problem**: Normal errors being caught
- **Solution**: Use try-catch for expected errors

---

## Resources

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry Error Tracking](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundary Best Practices](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react)

