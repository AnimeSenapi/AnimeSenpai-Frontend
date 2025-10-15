// sentry.client.config.ts - Client-side Sentry initialization
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://e2e5e2b86c43e243dc494c8b8c866aaa@o4510183717732352.ingest.de.sentry.io/4510183722123344",

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV || "development",
  
  // Enable logging
  _experiments: {
    enableLogs: true,
  },

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
      console.error("Sentry Error (dev):", hint.originalException || hint.syntheticException);
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
  beforeBreadcrumb(breadcrumb, hint) {
    if (process.env.NODE_ENV === "development") {
      return null;
    }
    return breadcrumb;
  },
});

