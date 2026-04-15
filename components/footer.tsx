/**
 * @module components/footer
 *
 * Footer global de la aplicación con logo, información institucional,
 * enlaces de navegación y créditos. Utiliza animaciones staggered
 * de Framer Motion para entrada progresiva al entrar al viewport.
 */
"use client"

import { Separator } from "@/components/ui/separator"
import {
  staggerContainer,
  staggerItem,
  viewportOnceFooter
} from "@/lib/motion"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

/** Enlaces de navegación del footer que apuntan a las secciones del landing. */
const navLinks = [
  { label: "Personalized Horoscope", href: "personalized" },
  { label: "Daily Horoscope", href: "horoscope" },
  { label: "Synastry", href: "synastry" },
]

/** Footer principal con información institucional, navegación y créditos. */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        <motion.div
          className="mb-8 grid grid-cols-1 gap-10 md:grid-cols-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnceFooter}
        >
          <motion.div variants={staggerItem} className="col-span-2">
            <Link href="/">
              <Image src="/logo.png" alt="logo" width={150} height={150} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Get a personal analysis of your current situation that will help
              you to find life-changing solutions in any sphere of your life.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="col-span-2">
            <h5 className="mb-4 text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
              Politécnico Internacional
            </h5>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Colombia — Bogotá D.C.
            </p>
            <a
              href="mailto:juan.ceballos@pi.edu.co"
              className="inline-block rounded-sm border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              juan.ceballos@pi.edu.co
            </a>
          </motion.div>
          <motion.div variants={staggerItem}>
            <h5 className="mb-4 text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
              Links
            </h5>
            <nav>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    <motion.span
                      className="inline-block text-sm text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => {
                        const sectionId = link.href;
                        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {link.label}
                    </motion.span>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </motion.div>

        <Separator className="mb-8 bg-border" />

        <motion.div
          className="flex flex-col items-center justify-between gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Mystik. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Astrological guidance for the modern seeker.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://freeastroapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 transition-colors hover:text-koromiko-400"
            >
              FreeAstroAPI.com
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
