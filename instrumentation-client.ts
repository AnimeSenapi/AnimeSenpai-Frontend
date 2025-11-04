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

    // Filter out performance warnings (these are messages, not exceptions)
    if (event.message) {
      const message = event.message.formatted || event.message.message || "";
      if (
        message.includes("Poor API_RESPONSE performance") ||
        message.includes("Poor performance") ||
        message.includes("API response time")
      ) {
        // Log locally for debugging but don't send to Sentry
        console.debug("Performance warning (filtered from Sentry):", message);
        return null;
      }
    }

    // Filter out known issues or sensitive data
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        const errorMessage = error.message || "";
        const errorStack = error.stack || "";
        
        // Skip chunk loading errors (transient network issues)
        if (
          errorMessage.includes("Load failed") ||
          errorMessage.includes("Loading chunk") ||
          errorMessage.includes("Failed to fetch dynamically imported module") ||
          errorMessage.includes("ChunkLoadError") ||
          errorMessage.includes("Loading CSS chunk") ||
          errorStack.includes("chunk") ||
          errorStack.includes("_next/static/chunks")
        ) {
          // Log locally for debugging but don't send to Sentry
          console.warn("Chunk loading error (filtered from Sentry):", errorMessage);
          return null;
        }
        
        // Skip network-related errors that are often transient
        if (
          errorMessage.includes("Network request failed") ||
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("network") ||
          errorMessage.includes("timeout") ||
          errorMessage.includes("ECONNRESET") ||
          errorMessage.includes("ENOTFOUND")
        ) {
          return null;
        }
      }
      
      // Also check the event message/values for chunk loading errors
      if (event.exception.values) {
        for (const exceptionValue of event.exception.values) {
          const value = exceptionValue.value || "";
          const type = exceptionValue.type || "";
          
          if (
            value.includes("Load failed") ||
            value.includes("Loading chunk") ||
            value.includes("ChunkLoadError") ||
            type === "ChunkLoadError"
          ) {
            console.warn("Chunk loading error detected in exception values (filtered from Sentry):", value);
            return null;
          }
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

