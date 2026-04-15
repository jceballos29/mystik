/**
 * @module components/section
 *
 * Wrapper reutilizable para secciones de página con padding
 * y posicionamiento relativo consistentes. Extiende las props
 * nativas de `<section>` para máxima flexibilidad.
 */
import { cn } from "@/lib/utils"

/** Props de Section: extiende las props nativas de `<section>`. */
export interface SectionProps extends React.ComponentProps<"section"> {
  children: React.ReactNode
}

/**
 * Contenedor de sección con estilos base.
 * Aplica `isolate` para crear un nuevo stacking context
 * y evitar problemas de z-index con elementos posicionados internos.
 */
export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn("relative isolate px-6 pt-14 lg:px-8", className)}
      {...props}
    >
      {children}
    </section>
  )
}
