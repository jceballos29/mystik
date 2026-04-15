/**
 * @module app/layout
 *
 * Layout raíz de la aplicación. Configura las fuentes tipográficas
 * (El Messiri para títulos, Proza Libre para cuerpo), el provider
 * de tema (dark-mode forzado), el componente de scroll-to-top,
 * el header global y el footer. Envuelve todo el árbol de componentes.
 */
import type { Metadata } from "next"
import { El_Messiri, Proza_Libre } from "next/font/google"

import { ScrollToTop } from "@/components/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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
      style={{
        scrollBehavior: "smooth",
      }}
    >
      <body>
        <ThemeProvider>
          <ScrollToTop />
          <Header />
          <main className="min-h-screen bg-background text-foreground">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
