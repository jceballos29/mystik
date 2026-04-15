import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

/**
 * Helpers de navegación con awareness de locale.
 * Usar estos en lugar de next/navigation para routing correcto.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
