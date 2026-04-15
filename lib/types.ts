/**
 * @module types
 *
 * Tipos compartidos para el dominio de signos zodiacales.
 * Define la estructura de datos que representa un signo
 * zodiacal dentro de la aplicación.
 */

/** Límite de un rango de fechas zodiacal (mes abreviado + día numérico). */
export interface ZodiacDateBound {
  month: string
  day: number
}

/** Rango de fechas que define cuándo rige un signo zodiacal. */
export interface ZodiacDate {
  start: ZodiacDateBound
  end: ZodiacDateBound
}

/**
 * Representación completa de un signo zodiacal dentro de la aplicación.
 * Incluye su identificador único (slug para URLs), nombre legible,
 * imagen asociada y el rango de fechas en que está activo.
 */
export interface ZodiacSign {
  id: string
  name: string
  image: string
  date: ZodiacDate
}
