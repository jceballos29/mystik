/**
 * @module components/theme-provider
 *
 * Wrapper de `next-themes` que fuerza el tema oscuro en toda la aplicación.
 * Se usa `forcedTheme="dark"` porque Mystik es exclusivamente dark-mode
 * por diseño — no se ofrece un toggle de tema al usuario.
 */
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Provider de tema con tema oscuro forzado.
 * `disableTransitionOnChange` evita flashes de transición CSS
 * al montar el provider en el lado del cliente.
 */
function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      forcedTheme="dark"
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export { ThemeProvider }
