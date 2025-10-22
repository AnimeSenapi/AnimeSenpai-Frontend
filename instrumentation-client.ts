// instrumentation-client.ts - Client-side Sentry initialization
import * as Sentry from "@sentry/nextjs";

// Export router transition hook for navigation tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://e2e5e2b86c43e243dc494c8b8c866aaa@o4510183717732352.ingest.de.sentry.io/4510183722123344",

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Performance thresholds (in milliseconds)
  // These prevent Sentry from flagging normal API responses as "poor performance"
  _experiments: {
    enableLogs: true,
    // Only flag performance issues above these thresholds
    performanceInstrumentationOptions: {
      enableLongTask: true,
      enableInteractions: true,
      enableNavigationTiming: true,
      enablePaintTiming: true,
      enableResourceTiming: true,
      enableWebVitalsAttribution: true,
      // Set higher thresholds for development
      ...(process.env.NODE_ENV === "development" && {
        slowTransactionThreshold: 2000, // 2 seconds
        idleTimeout: 3000, // 3 seconds
      }),
    },
  },
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Integrations
  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    
    // Session Replay
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Before sending errors, clean up sensitive data
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      // Suppress performance warnings in development
      if (hint.originalException instanceof Error && 
          hint.originalException.message.includes("Poor API_RESPONSE performance")) {
        return null;
      }
      
      // Only log actual errors, not performance warnings
      if (event.exception && event.exception.values && event.exception.values.length > 0) {
        console.error("Sentry Error (dev):", hint.originalException || hint.syntheticException);
      }
      return null;
    }

    // Filter out known issues or sensitive data
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Skip certain errors
        if (error.message.includes("Network request failed")) {
          return null;
        }
      }
    }

    return event;
  },

  // Don't send breadcrumbs in development
  beforeBreadcrumb(breadcrumb, _hint) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return breadcrumb;
  },
});

