/**
 * @module app/page
 *
 * Redirección al locale por defecto. El proxy.ts maneja esta redirección
 * en runtime, pero este redirect asegura compatibilidad en build estático.
 */
import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/en")
}
