// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
    // Redact PII in request data
    if (event.request) {
      if (event.request.headers) {
        const h = event.request.headers as Record<string, string>
        if (h.authorization) h.authorization = "[REDACTED]"
        if (h.cookie) h.cookie = "[REDACTED]"
      }
      if (event.request.data && typeof event.request.data === "string") {
        event.request.data = event.request.data.replace(/(token|password|email)=([^&\s]+)/gi, "$1=[REDACTED]")
      }
      if (event.request.cookies) {
        event.request.cookies = {}
      }
    }
    if (event.extra) {
      const extra = event.extra as Record<string, any>
      for (const key of Object.keys(extra)) {
        if (/(token|password|cookie|authorization|email)/i.test(key)) {
          extra[key] = "[REDACTED]"
        }
      }
    }

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
      const message = typeof event.message === 'string' 
        ? event.message 
        : (event.message as any).formatted || (event.message as any).message || "";
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

    return event;
  },

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});
