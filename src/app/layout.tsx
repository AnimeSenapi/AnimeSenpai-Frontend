import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '../components/navbar/navbar'
import { AuthProvider } from './lib/auth-context'
import { ThemeProvider } from '../components/ThemeProvider'
import { CookieConsent } from '../components/CookieConsent'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AnimeSenpai',
  description: 'Discover and watch your favorite anime',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <CookieConsent />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
