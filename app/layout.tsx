/**
 * @module app/layout
 *
 * Layout raíz mínimo. Define la estructura <html>/<body> con fuentes
 * y variables CSS. Los providers, Header, Footer y NextIntlClientProvider
 * se configuran en app/[locale]/layout.tsx para soporte i18n.
 */
import { El_Messiri, Proza_Libre } from "next/font/google"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
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
      <body>{children}</body>
    </html>
  )
}
