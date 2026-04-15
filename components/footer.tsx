/**
 * @module components/footer
 *
 * Footer global de la aplicación con logo, información institucional,
 * enlaces de navegación y créditos. Utiliza animaciones staggered
 * de Framer Motion para entrada progresiva al entrar al viewport.
 */
"use client"

import { Separator } from "@/components/ui/separator"
import { staggerContainer, staggerItem, viewportOnceFooter } from "@/lib/motion"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Image from "next/image"
import Link from "next/link"

const navLinksHref = [
  { key: "personalized", href: "personalized" },
  { key: "horoscope", href: "horoscope" },
  { key: "synastry", href: "synastry" },
] as const

/** Footer principal con información institucional, navegación y créditos. */
export function Footer() {
  const t = useTranslations("footer")
  const ts = useTranslations("services")
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
              {t("description")}
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="col-span-2">
            <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
              {t("school_title")}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              {t("school_location")}
            </p>
            <a
              href="mailto:juan.ceballos@pi.edu.co"
              className="inline-block rounded-sm border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              juan.ceballos@pi.edu.co
            </a>
          </motion.div>
          <motion.div variants={staggerItem}>
            <h3 className="mb-4 text-xs font-semibold tracking-[0.2em] text-foreground uppercase">
              {t("links_title")}
            </h3>
            <nav>
              <ul className="space-y-3">
                {navLinksHref.map((link) => (
                  <li key={link.key}>
                    <motion.button
                      type="button"
                      className="inline-block cursor-pointer border-0 bg-transparent p-0 text-sm text-muted-foreground transition-colors hover:text-primary"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      onClick={() => {
                        const sectionId = link.href
                        const el = document.getElementById(sectionId)
                        if (el) {
                          const top =
                            el.getBoundingClientRect().top +
                            window.scrollY -
                            100
                          window.scrollTo({ top, behavior: "smooth" })
                        }
                      }}
                    >
                      {ts(`${link.key}.title`)}
                    </motion.button>
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
            &copy; {new Date().getFullYear()} Mystik. All rights reserved.
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
