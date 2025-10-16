'use client'

import { Button } from '@/components/ui/button'
import { captureException, captureMessage, logger } from '@/lib/logger'
import * as Sentry from '@sentry/nextjs'

/**
 * Test page for Sentry error tracking
 * Visit /test-sentry to verify Sentry is working
 * Remove this page before production deployment
 */
export default function TestSentryPage() {
  const testError = () => {
    try {
      throw new Error('Test error from Sentry test page')
    } catch (error) {
      captureException(error, {
        context: { 
          page: 'test-sentry',
          testType: 'manual'
        },
        tags: {
          test: 'true'
        }
      })
      alert('Error sent to Sentry! Check your Sentry dashboard.')
    }
  }

  const testLog = () => {
    logger.info('Test log from Sentry test page', { 
      timestamp: Date.now(),
      test: true 
    })
    alert('Log sent to Sentry! Check your Sentry dashboard.')
  }

  const testMessage = () => {
    captureMessage('Test message from Sentry test page', {
      level: 'warning',
      context: { test: true },
      tags: { feature: 'sentry-test' }
    })
    alert('Message sent to Sentry! Check your Sentry dashboard.')
  }

  const testThrowError = () => {
    // This will be caught by Error Boundary and sent to Sentry
    throw new Error('Uncaught error test - should appear in Sentry')
  }

  const testConsoleError = () => {
    console.error('Console error test - should appear in Sentry with consoleLoggingIntegration')
    alert('Console error logged! Check your Sentry dashboard.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="glass rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🧪 Sentry Test Page
          </h1>
          <p className="text-gray-400 mb-8">
            Test Sentry error tracking and logging. Check your{' '}
            <a 
              href="https://sentry.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-400 hover:underline"
            >
              Sentry dashboard
            </a>
            {' '}after clicking these buttons.
          </p>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-2">1. Test Caught Exception</h2>
              <p className="text-gray-400 text-sm mb-3">
                Throws and catches an error, then sends it to Sentry with context
              </p>
              <Button onClick={testError} className="w-full">
                Test Exception Capture
              </Button>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-2">2. Test Structured Log</h2>
              <p className="text-gray-400 text-sm mb-3">
                Sends a structured log entry to Sentry
              </p>
              <Button onClick={testLog} className="w-full">
                Test Logger
              </Button>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-2">3. Test Message</h2>
              <p className="text-gray-400 text-sm mb-3">
                Sends a custom message to Sentry
              </p>
              <Button onClick={testMessage} className="w-full">
                Test Message Capture
              </Button>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <h2 className="text-white font-semibold mb-2">4. Test Console Error</h2>
              <p className="text-gray-400 text-sm mb-3">
                Logs to console.error (should be captured by consoleLoggingIntegration)
              </p>
              <Button onClick={testConsoleError} className="w-full">
                Test Console Error
              </Button>
            </div>

            <div className="bg-error-500/10 border border-error-500/20 rounded-xl p-4">
              <h2 className="text-error-400 font-semibold mb-2">5. Test Uncaught Error</h2>
              <p className="text-gray-400 text-sm mb-3">
                ⚠️ Throws an uncaught error (will crash the component)
              </p>
              <Button 
                onClick={testThrowError} 
                variant="outline"
                className="w-full border-error-500/50 text-error-400 hover:bg-error-500/10"
              >
                Test Uncaught Error (Use with Caution)
              </Button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <h3 className="text-primary-400 font-semibold mb-2">Environment Info</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p>Node ENV: <code className="text-primary-300">{process.env.NODE_ENV || 'development'}</code></p>
              <p>Sentry DSN: <code className="text-primary-300">{process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Set' : 'Using fallback'}</code></p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

