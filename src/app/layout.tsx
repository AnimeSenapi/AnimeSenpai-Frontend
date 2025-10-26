import { Providers } from './providers'
import { Navbar } from '../components/navbar/navbar'
import './globals.css'

export const metadata = {
  title: 'AnimeSenpai',
  description: 'Discover and track your favorite anime',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
