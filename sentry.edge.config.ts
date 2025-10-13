// sentry.edge.config.ts - Edge runtime Sentry initialization
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://e2e5e2b86c43e243dc494c8b8c866aaa@o4510183717732352.ingest.de.sentry.io/4510183722123344",

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Enable logging
  _experiments: {
    enableLogs: true,
  },

  // Before sending errors
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      console.error("Sentry Error (dev - edge):", hint.originalException || hint.syntheticException);
      return null;
    }

    return event;
  },
});

