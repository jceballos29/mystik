/**
 * @module app/[locale]/loading
 *
 * Loading global para el locale. Spinner centrado durante la navegación.
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
