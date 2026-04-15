/**
 * @module horoscope-utils
 *
 * Funciones auxiliares para presentar datos del horóscopo en la UI.
 * Centralizan la lógica de formateo y clasificación de puntajes
 * para mantener los componentes de presentación limpios.
 */

import type {
  HoroscopeLucky,
  HoroscopeScoreFactor,
} from "@/lib/validations/horoscope.schema"

// --- Formateo ---

/**
 * Formatea la ventana de tiempo de la suerte para visualización.
 *
 * La API retorna `time_window` en dos posibles formatos: un string plano
 * (versiones antiguas) o un objeto con `display`, `start`, `end` y `tz`.
 * Esta función normaliza ambos casos a un string legible.
 *
 * @param tw - Ventana de tiempo (string o objeto con propiedad `display`).
 * @returns Representación textual de la ventana de tiempo.
 */
export function formatLuckyTimeWindow(
  tw: HoroscopeLucky["time_window"]
): string {
  if (typeof tw === "string") return tw
  return tw.display
}

// --- Clasificación de Puntajes ---

/**
 * Convierte un puntaje numérico (0–100) en una etiqueta cualitativa.
 *
 * Las bandas se diseñaron para dar una distribución asimétrica:
 * los extremos (Challenging/Strong tailwind) son más estrechos,
 * mientras que "Mixed" ocupa el rango central más amplio.
 *
 * @param score - Puntaje de energía (0–100).
 * @returns Etiqueta cualitativa: "Challenging" | "Low support" | "Mixed" | "Supportive" | "Strong tailwind".
 */
export function getScoreLabel(score: number): string {
  if (score < 25) return "Challenging"
  if (score < 45) return "Low support"
  if (score < 60) return "Mixed"
  if (score < 75) return "Supportive"
  return "Strong tailwind"
}

// --- Extracción de Factores ---

/**
 * Extrae la razón explicativa de un factor de puntaje para una dimensión específica.
 *
 * Los factores de puntaje de la API pueden contener el campo `reason` como
 * un string directo o un objeto `{ main, secondary }`. Esta función
 * normaliza ambos casos y retorna la razón principal.
 *
 * @param factors - Lista de factores de puntaje del horóscopo.
 * @param dim - Dimensión a buscar (ej. "love", "career", "money", "health").
 * @returns Texto explicativo del factor, o `null` si no existe para esa dimensión.
 */
export function getFactorReason(
  factors: HoroscopeScoreFactor[],
  dim: string
): string | null {
  const factor = factors.find((f) => f.dimension === dim)
  if (!factor) return null
  if (typeof factor.reason === "string") return factor.reason
  return factor.reason.main
}
