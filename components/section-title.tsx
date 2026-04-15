/**
 * @module components/section-title
 *
 * Título de sección reutilizable con icono, subtítulo y descripción.
 * Soporta alineación configurable (center, left, right) mediante
 * class-variance-authority (CVA).
 */
import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"
import Image from "next/image"
import { Typography } from "./ui/typography"

/** Props del componente SectionTitle. */
interface SectionTitleProps {
  /** Ruta de la imagen decorativa. Fallback: `/icon.png`. */
  image?: string
  /** Texto del subtítulo (H2). */
  subtitle: string
  /** Descripción opcional debajo del subtítulo. */
  description?: string
  className?: string
  /** Alineación del bloque: center (default), left o right. */
  position?: "center" | "left" | "right"
}

/** Variantes de alineación para el contenedor del título. */
const sectionTitleVariants = cva("mb-20 flex flex-col", {
  variants: {
    position: {
      center: "items-center justify-center text-center",
      left: "items-start justify-start text-left",
      right: "items-end justify-end text-right",
    },
  },
  defaultVariants: {
    position: "center",
  },
})

/**
 * Título de sección con icono decorativo, heading H2 y descripción opcional.
 * Usa CVA para manejar las variantes de alineación de forma declarativa.
 */
export function SectionTitle({
  image,
  subtitle,
  description,
  className,
  position,
}: SectionTitleProps & VariantProps<typeof sectionTitleVariants>) {
  return (
    <div className={cn(sectionTitleVariants({ position, className }))}>
      <Image
        src={image || "/icon.png"}
        alt=""
        aria-hidden="true"
        width={500}
        height={500}
        className="h-12 w-20"
      />
      <Typography.H2 className="mt-4 mb-2">{subtitle}</Typography.H2>
      {description && (
        <Typography.P className="mt-2.5 text-center leading-relaxed font-medium text-muted-foreground">
          {description}
        </Typography.P>
      )}
    </div>
  )
}
