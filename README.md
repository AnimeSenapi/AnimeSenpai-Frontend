### AnimeSenpai Frontend

Next.js app powered by Bun and TypeScript. Connects to the backend tRPC API.

---

### Quick start

```bash
# From repo root
cd AnimeSenpai-Frontend
bun install
cp env.example .env.local

# Point to backend (default dev port is 3005)
echo "NEXT_PUBLIC_API_URL=http://localhost:3005/api/trpc" >> .env.local

# Start the dev server
bun dev
# → http://localhost:3000
```

Run backend alongside:

```bash
cd ../AnimeSenpai-Backend && bun dev  # → http://localhost:3005
```

---

### Requirements

- Bun 1.0+
- Backend running on port 3005

---

### Environment

Set the following in `.env.local`:

- NEXT_PUBLIC_API_URL (e.g., `http://localhost:3005/api/trpc`)
- NEXT_PUBLIC_SENTRY_DSN (optional; error tracking)
- NEXT_PUBLIC_GOOGLE_VERIFICATION (optional; SEO)

Keep secrets out of git. Use Vercel/hosted env vars in production.

---

### Development

- Dev: `bun dev` → port 3000
- Build: `bun run build`
- Start: `bun run start`
- Type check: `bunx tsc --noEmit`
- Lint: `bun run lint`

Prefer Bun over npm/pnpm/yarn.

---

### Sentry (client/server/edge)

Initialize via existing configs:

- `instrumentation-client.ts` (client)
- `sentry.server.config.ts` (server)
- `sentry.edge.config.ts` (edge)

Use in components and handlers:

```ts
import * as Sentry from '@sentry/nextjs'

try {
  // code
} catch (error) {
  Sentry.captureException(error)
}
```

For logs: enable `_experiments.enableLogs` in init if needed.

---

### Project structure

- `src/app/` Next.js App Router pages and layouts
- `src/components/` UI components (shadcn/ui, app UI)
- `src/lib/` utilities, API client, caching
- `src/hooks/` React hooks
- `public/` static assets and PWA files

---

### PWA and performance

- PWA files in `public/` (`manifest.json`, `sw.js`)
- Images optimized via Next.js Image component
- Code-splitting and memoization already configured

---

### Docker

- `Dockerfile` included
- Run with your platform’s compose or deploy target

---

### Important notes

- Use Bun for all scripts and dev.
- Frontend port: 3000; Backend port: 3005.
- Ensure `NEXT_PUBLIC_API_URL` matches your backend.

---

### Useful links

- Backend: `../AnimeSenpai-Backend`
- Sentry configs in `instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
