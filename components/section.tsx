import { cn } from "@/lib/utils"

export interface SectionProps extends React.ComponentProps<"section"> {
  children: React.ReactNode
}

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
