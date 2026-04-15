import type { Metadata } from "next"
import { El_Messiri, Proza_Libre } from "next/font/google"

import { ScrollToTop } from "@/components/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import "./globals.css"

const elMessiri = El_Messiri({
  variable: "--font-title",
  subsets: ["latin"],
})

const prozaLibre = Proza_Libre({
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Mystik — Daily Horoscope & Synastry",
  description:
    "Navigate the cosmos. Daily horoscopes, personalized readings, and synastry reports.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        elMessiri.variable,
        "font-sans",
        prozaLibre.variable
      )}
    >
      <body>
        <ThemeProvider>
          <ScrollToTop />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
