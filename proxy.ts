import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

export const proxy = createMiddleware(routing)

export const config = {
  matcher: [
    // Match root and all locale-prefixed paths
    "/",
    "/(en|es)/:path*",
    // Skip internal Next.js paths and static files
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
}
