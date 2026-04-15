import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"
import Image from "next/image"
import { Typography } from "./ui/typography"

interface SectionTitleProps {
  image?: string
  subtitle: string
  description?: string
  className?: string
  position?: "center" | "left" | "right"
}

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
        alt="Icon"
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
