/**
 * @module components/zodiac-sign-card
 *
 * Tarjeta visual de un signo zodiacal usada en la grilla del landing.
 * Muestra la imagen del signo, su nombre y el rango de fechas.
 * Incluye una animación de escala + rotación al hacer hover.
 */
"use client"

import Image from "next/image"
import { useTranslations } from "next-intl"
import { Typography } from "./ui/typography"
import { Card, CardContent } from "./ui/card"
import type { ZodiacSign } from "@/lib/types"
import { motion } from "framer-motion"

/** Props del componente ZodiacSignCard. */
interface ZodiacSignCardProps {
  /** Datos completos del signo zodiacal. */
  sign: ZodiacSign
  /** Si la tarjeta está actualmente en hover (controlado por el padre). */
  hovered: boolean
}

/**
 * Tarjeta de signo zodiacal con animación de hover controlada externamente.
 *
 * El estado `hovered` se gestiona desde el componente padre (`Horoscope`)
 * para sincronizar la animación con el hover del contenedor `motion.div`,
 * permitiendo que la animación de la imagen sea más fluida.
 */
export function ZodiacSignCard({ sign, hovered }: ZodiacSignCardProps) {
  const t = useTranslations("zodiac_signs")
  const { start, end } = sign.date
  const dateLabel = `${t(start.month)} ${start.day} - ${t(end.month)} ${end.day}`

  return (
    <Card className="flex w-full cursor-pointer flex-col items-center justify-between border-2 border-star-dust-700 p-6 py-16 transition-all duration-400 ease-in-out hover:-translate-y-1 hover:scale-102 hover:border-koromiko-300">
      <CardContent className="gap-0">
        <motion.figure
          className="mb-2 aspect-square w-full overflow-hidden"
          animate={
            hovered ? { scale: 1.3, rotate: [0, -10, 10, 0] } : { scale: 1 }
          }
          transition={{ duration: 0.4 }}
        >
          <Image
            src={sign.image}
            alt={t(sign.id)}
            width={100}
            height={100}
            className="h-full w-full object-contain"
          />
        </motion.figure>

        <Typography.H3 className="text-center">{t(sign.id)}</Typography.H3>
        <Typography.P className="text-center leading-relaxed font-medium text-muted-foreground">
          {dateLabel}
        </Typography.P>
      </CardContent>
    </Card>
  )
}
