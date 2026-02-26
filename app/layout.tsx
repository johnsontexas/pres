import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-context'
import './globals.css'

const _sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans-var" });
const _serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-serif-var", weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL('https://pickdaniel.com'),
  title: 'Vote Daniel Johnson — House Council President',
  description: 'Campaign website for House Council President at Strake Jesuit College Preparatory.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1B5E20',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_sans.variable} ${_serif.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
