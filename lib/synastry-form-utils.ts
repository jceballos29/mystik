/**
 * @module synastry-form-utils
 *
 * Funciones de transformación entre el modelo del formulario de sinastría
 * (orientado a la UI) y el payload de la API (orientado al backend).
 * Actúan como capa de adaptación entre las dos representaciones de datos.
 */

import { encodeBase64Url } from "@/lib/utils"
import type { SynastryApiPayload } from "@/lib/validations/synastry.schema"
import type { SynastryFormValues } from "@/lib/validations/synastry-form.schema"

// --- Transformación de Datos ---

/**
 * Transforma los valores del formulario de sinastría al formato requerido por la API.
 *
 * Responsabilidades de la transformación:
 * - Convierte `date` (YYYY-MM-DD) + `time` (HH:mm) → `datetime` (YYYY-MM-DDTHH:mm:ss)
 * - Si no se proporcionó hora, usa `12:00` como fallback
 * - Extrae el `timezone` de la ubicación seleccionada para `tz_str`
 * - Mapea `name` como `undefined` si está vacío (la API lo trata como opcional)
 *
 * @param values - Valores validados del formulario (dos personas con nombre, fecha, hora y ubicación).
 * @returns Payload estructurado listo para enviar a la API de sinastría.
 * @throws {Error} Si alguna de las ubicaciones es `null` (no debería ocurrir tras la validación Zod).
 */
export function buildSynastryPayload(
  values: SynastryFormValues
): SynastryApiPayload {
  const { a, b } = values
  if (!a.location || !b.location) {
    throw new Error("[buildSynastryPayload] locations must be non-null")
  }
  const locA = a.location
  const locB = b.location
  return {
    person_a: {
      name: a.name || undefined,
      datetime: `${a.date}T${a.time || "12:00"}:00`,
      tz_str: locA.timezone || "UTC",
      location: { city: locA.name, lat: locA.lat, lng: locA.lng },
    },
    person_b: {
      name: b.name || undefined,
      datetime: `${b.date}T${b.time || "12:00"}:00`,
      tz_str: locB.timezone || "UTC",
      location: { city: locB.name, lat: locB.lat, lng: locB.lng },
    },
  }
}

/**
 * Codifica el payload de sinastría en Base64URL para transmitirlo via query string.
 * Se usa para navegar a `/synastry?q={encoded}` después del submit del formulario.
 *
 * @param payload - Payload de la API ya construido.
 * @returns String codificado en Base64URL, seguro para URLs.
 */
export function encodeSynastryPayload(payload: SynastryApiPayload): string {
  return encodeBase64Url(payload)
}
