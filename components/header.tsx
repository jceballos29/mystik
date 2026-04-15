/**
 * @module components/header
 *
 * Header global fijo con efecto de transparencia que transiciona
 * a un fondo sólido con blur al hacer scroll. Usa Framer Motion
 * para detectar la posición del scroll y animar la entrada.
 */
"use client"

import Image from "next/image"
import Link from "next/link"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"

/**
 * Header principal de la aplicación.
 *
 * Comportamiento visual:
 * - **Transparente** cuando el scroll está en la parte superior (< 50px)
 * - **Sólido con backdrop-blur** cuando el usuario ha scrolleado (≥ 50px)
 * - Animación de entrada desde arriba al cargar la página
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false)

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50)
  })

  return (
    <motion.header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "bg-navy-dark/98 border-border/60 backdrop-blur-md"
          : "border-transparent bg-transparent"
      )}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4"
      >
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </Link>
        <LocaleSwitcher />
      </nav>
    </motion.header>
  )
}
