import type { Metadata, Viewport } from "next"
import { Caveat, Inter, Source_Serif_4 } from "next/font/google"
import { AuthProvider } from "@/components/auth-context"
import { CAMPAIGN_SLOGAN } from "@/lib/campaign"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vote Daniel Johnson — House Council President",
  description: `${CAMPAIGN_SLOGAN} — House Council President, Strake Jesuit College Preparatory.`,
  metadataBase: new URL("https://pickdaniel.com"),
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1B5E20",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${sourceSerif.variable} ${caveat.variable} font-sans antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
