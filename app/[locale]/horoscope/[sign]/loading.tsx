/**
 * @module app/[locale]/horoscope/[sign]/loading
 *
 * Skeleton de carga para la página de horóscopo por signo (localizado).
 */
import { Header } from "@/components/header"
import { Section } from "@/components/section"

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-star-dust-800/60 ${className ?? ""}`} />
  )
}

export default function SignLoading() {
  return (
    <main className="min-h-svh">
      <Header />

      <Section className="bg-background py-24 text-center">
        <div className="z-10 mx-auto max-w-3xl space-y-6">
          <SkeletonBlock className="mx-auto h-5 w-24 rounded" />
          <SkeletonBlock className="mx-auto h-16 w-48 rounded" />
          <SkeletonBlock className="mx-auto h-4 w-32 rounded" />
        </div>
      </Section>

      <Section className="bg-background pb-24">
        <div className="z-10 mx-auto max-w-3xl space-y-12">
          <div className="space-y-3">
            <SkeletonBlock className="h-5 w-full rounded" />
            <SkeletonBlock className="h-5 w-full rounded" />
            <SkeletonBlock className="h-5 w-4/5 rounded" />
            <SkeletonBlock className="h-5 w-full rounded" />
            <SkeletonBlock className="h-5 w-3/4 rounded" />
          </div>

          <div className="space-y-5 border border-star-dust-800 p-8">
            <SkeletonBlock className="h-3 w-28 rounded" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <SkeletonBlock className="h-3 w-14 rounded" />
                <SkeletonBlock className="h-2 flex-1 rounded" />
                <SkeletonBlock className="h-4 w-8 rounded" />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonBlock className="h-3 w-16 rounded" />
                <SkeletonBlock className="h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </main>
  )
}
