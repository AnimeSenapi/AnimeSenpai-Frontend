// instrumentation.ts - Sentry initialization hook
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }

  // Client-side initialization is loaded from instrumentation-client.ts
  // This is automatically loaded by Next.js for client-side code
}

