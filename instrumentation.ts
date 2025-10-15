// instrumentation.ts - Sentry initialization hook
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }

  // Client-side initialization happens in sentry.client.config.ts
  // which is auto-loaded by Next.js
}

