/**
 * @module components/scroll-to-top
 *
 * Componente invisible que fuerza el scroll al inicio de la página
 * en cada cambio de ruta. Necesario porque el App Router de Next.js
 * no resetea la posición del scroll automáticamente en navegaciones
 * programáticas (ej. `router.push`).
 */
"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Desplaza la ventana al inicio cada vez que cambia el pathname.
 * Usa `behavior: "instant"` para evitar animaciones de scroll
 * que interferirían con la carga de la nueva página.
 */
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  return null
}
