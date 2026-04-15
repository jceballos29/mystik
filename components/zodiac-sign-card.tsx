import Image from "next/image"
import { Typography } from "./ui/typography"
import { Card, CardContent } from "./ui/card"
import type { ZodiacSign } from "@/lib/types"

interface ZodiacSignCardProps {
  sign: ZodiacSign
}

export function ZodiacSignCard({ sign }: ZodiacSignCardProps) {
  const { start, end } = sign.date
  const dateLabel = `${start.month} ${start.day} - ${end.month} ${end.day}`

  return (
    <Card className="flex w-full cursor-pointer flex-col items-center justify-between border-2 border-star-dust-700 p-6 py-16 transition-all duration-400 ease-in-out hover:-translate-y-1 hover:scale-102 hover:border-koromiko-300">
      <CardContent className="gap-0">
        <figure className="mb-2 aspect-square w-full overflow-hidden">
          <Image
            src={sign.image}
            alt={sign.name}
            width={100}
            height={100}
            className="h-full w-full object-contain"
          />
        </figure>
        <Typography.H3 className="text-center">{sign.name}</Typography.H3>
        <Typography.P className="text-center leading-relaxed font-medium text-muted-foreground">
          {dateLabel}
        </Typography.P>
      </CardContent>
    </Card>
  )
}
