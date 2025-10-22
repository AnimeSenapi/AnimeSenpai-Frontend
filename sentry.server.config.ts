// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e2e5e2b86c43e243dc494c8b8c866aaa@o4510183717732352.ingest.de.sentry.io/4510183722123344",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  _experiments: {
    enableLogs: true,
  },

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Integrations
  integrations: [
    // Send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
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

    return event;
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
