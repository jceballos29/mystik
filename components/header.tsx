"use client"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"

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
        className="mx-auto flex max-w-5xl items-center justify-between py-4"
      >
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={100} height={100} />
        </Link>
      </nav>
    </motion.header>
  )
}
