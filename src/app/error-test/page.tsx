'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { PageErrorBoundary } from '../../components/PageErrorBoundary'
import { ComponentErrorBoundary } from '../../components/ComponentErrorBoundary'

// Component that throws an error for testing
function ErrorThrowingComponent() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('This is a test error for error boundary testing')
  }

  return (
    <div className="p-4 border border-red-500 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Error Test Component</h3>
      <p className="text-gray-600 mb-4">Click the button below to trigger an error</p>
      <Button 
        onClick={() => setShouldError(true)}
        className="bg-red-500 hover:bg-red-600"
      >
        Trigger Error
      </Button>
    </div>
  )
}

// Component that throws async error
function AsyncErrorComponent() {
  const [shouldError, setShouldError] = useState(false)

  const handleAsyncError = async () => {
    setShouldError(true)
    // Simulate async error
    setTimeout(() => {
      throw new Error('This is an async test error')
    }, 100)
  }

  if (shouldError) {
    return <div className="p-4 text-red-500">Async error triggered</div>
  }

  return (
    <div className="p-4 border border-blue-500 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Async Error Test Component</h3>
      <p className="text-gray-600 mb-4">Click the button below to trigger an async error</p>
      <Button 
        onClick={handleAsyncError}
        className="bg-blue-500 hover:bg-blue-600"
      >
        Trigger Async Error
      </Button>
    </div>
  )
}

export default function ErrorTestPage() {
  return (
    <PageErrorBoundary pageName="Error Test Page">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Error Boundary Testing</h1>
        
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Component-Level Error Boundary</h2>
            <ComponentErrorBoundary componentName="ErrorThrowingComponent">
              <ErrorThrowingComponent />
            </ComponentErrorBoundary>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Async Error Test</h2>
            <ComponentErrorBoundary componentName="AsyncErrorComponent">
              <AsyncErrorComponent />
            </ComponentErrorBoundary>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">API Error Test</h2>
            <ComponentErrorBoundary componentName="APIErrorTest">
              <APIErrorTest />
            </ComponentErrorBoundary>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  )
}

// Component that tests API errors
function APIErrorTest() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const testAPIError = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Test various API error scenarios
      const responses = await Promise.allSettled([
        fetch('/api/nonexistent'),
        fetch('/api/error'),
        fetch('/api/timeout'),
      ])
      
      const errors = responses
        .filter((response): response is PromiseRejectedResult => response.status === 'rejected')
        .map(response => response.reason?.message || 'Unknown error')
      
      if (errors.length > 0) {
        setError(errors.join(', '))
      } else {
        setError('No errors detected')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border border-green-500 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">API Error Test</h3>
      <p className="text-gray-600 mb-4">Test API error handling</p>
      
      <Button 
        onClick={testAPIError}
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 mb-4"
      >
        {loading ? 'Testing...' : 'Test API Errors'}
      </Button>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  )
}
