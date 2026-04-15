/**
 * @module app/robots
 *
 * Genera el archivo `robots.txt` dinámicamente. Permite el acceso
 * a todos los user agents y referencia el sitemap. La URL base se
 * obtiene de `NEXT_PUBLIC_SITE_URL` con fallback a la URL de Vercel.
 */
import type { MetadataRoute } from "next"

/** Configuración de robots.txt con sitemap referenciado. */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mystik.vercel.app"
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  }
}
