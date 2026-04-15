/**
 * @module app/loading
 *
 * Loading global del App Router. Se muestra durante la navegación
 * entre rutas mientras se carga el nuevo segmento. Renderiza un
 * spinner centrado con el header visible.
 */
import { Header } from "@/components/header"
import { Section } from "@/components/section"

export default function Loading() {
  return (
    <main className="min-h-svh">
      <Header />

      <Section className="bg-background">
        <div className="z-10 mx-auto max-w-3xl py-32 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-star-dust-700 border-t-koromiko-500" />
        </div>
      </Section>
    </main>
  )
}
