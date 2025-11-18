import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { env } from './src/lib/env'

// Paths that should be marked noindex
const noindexPaths = [
	/^\/auth(\/.*)?$/i,
	/^\/user\/settings$/i,
	/^\/admin(\/.*)?$/i,
	/^\/api(\/.*)?$/i,
	/^\/dashboard(\/.*)?$/i,
	/^\/error(\/.*)?$/i,
]

function generateNonce(): string {
	// Web Crypto is available in Edge runtime
	const array = new Uint8Array(16)
	crypto.getRandomValues(array)
	return Buffer.from(array).toString('base64')
}

export function middleware(request: NextRequest) {
	const nonce = generateNonce()
	const response = NextResponse.next()

	// Allowlist for images
	const imgSrc = [
		"'self'",
		"https:",
		"cdn.myanimelist.net",
		"i.ytimg.com",
		"images.unsplash.com",
		"via.placeholder.com",
		"animesenpai.app",
		"www.animesenpai.app",
	].join(' ')

	// Connect destinations (FE, BE, Sentry, analytics)
	const connectSrc = [
		"'self'",
		env.NEXT_PUBLIC_API_URL,
		"https://*.sentry.io",
		"https://*.ingest.sentry.io",
		"https://vitals.vercel-insights.com",
	].join(' ')

	const csp = [
		`default-src 'self'`,
		`base-uri 'self'`,
		`object-src 'none'`,
		// Nonced inline scripts only; strict-dynamic to trust nonced scripts
		`script-src 'self' 'nonce-${nonce}' https: 'strict-dynamic'`,
		// Avoid inline styles; allow nonce if absolutely necessary
		`style-src 'self'`,
		// Images limited to allowlist
		`img-src ${imgSrc} data: blob:`,
		// Fonts and media
		`font-src 'self' https: data:`,
		`media-src 'self' https:`,
		// Connections
		`connect-src ${connectSrc}`,
		// Frame/embedding protections
		`frame-ancestors 'none'`,
		// Upgrade insecure
		`upgrade-insecure-requests`,
	].join('; ')

	// Security headers
	response.headers.set('Content-Security-Policy', csp)
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
	response.headers.set('Cross-Origin-Resource-Policy', 'same-site')
	// Use DENY where possible for FE too
	response.headers.set('X-Frame-Options', 'SAMEORIGIN')
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')

	// Expose nonce to the app; Next will surface via request headers
	response.headers.set('x-csp-nonce', nonce)

	// X-Robots-Tag for sensitive routes
	const pathname = request.nextUrl.pathname
	if (noindexPaths.some((rx) => rx.test(pathname))) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow')
	}

	// Optional: CSP report stub
	// response.headers.set('Content-Security-Policy-Report-Only', csp)

	return response
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for:
		 * - _next (Next.js internals)
		 * - static files
		 * - images
		 */
		'/((?!_next/|static/|.*\\.(?:jpg|jpeg|png|gif|svg|ico|webp|avif|woff|woff2|ttf|otf)).*)',
	],
}

