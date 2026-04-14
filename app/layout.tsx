import type { Metadata, Viewport } from "next"
import { DM_Sans, Inter, Source_Serif_4 } from "next/font/google"
import { AuthProvider } from "@/components/auth-context"
import { SiteHeader } from "@/components/site-header"
import { CAMPAIGN_SLOGAN } from "@/lib/campaign"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

/** Clean geometric sans, Helvetica-like for titles and main nav */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["500", "600", "700"],
  display: "swap",
})

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Vote Daniel Johnson, House Council President",
  description: `${CAMPAIGN_SLOGAN}, House Council President, Strake Jesuit College Preparatory.`,
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
        className={`${inter.variable} ${dmSans.variable} ${sourceSerif.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
