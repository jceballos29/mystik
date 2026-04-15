/**
 * @module lib/translate/client
 *
 * Cliente para la API REST de Google Cloud Translation v2.
 * Divide arrays grandes en chunks de hasta 128 strings para respetar
 * los límites de la API y ejecuta los chunks en paralelo.
 *
 * La clave se lee exclusivamente desde variables de entorno (servidor).
 * Si la clave no está configurada, devuelve los textos originales sin lanzar error,
 * de modo que la app funcione (en inglés) aunque la traducción no esté activa.
 */
import "server-only"

const TRANSLATE_URL =
  "https://translation.googleapis.com/language/translate/v2"

/** Máximo de strings por petición según la documentación de la API. */
const CHUNK_SIZE = 128

/**
 * Traduce un array de strings del inglés al idioma destino usando Google Translate.
 *
 * - Los strings vacíos se devuelven sin modificar (evitan llamadas innecesarias).
 * - Los chunks se procesan en paralelo para minimizar latencia.
 * - Si la clave de API no está configurada, devuelve los textos originales.
 *
 * @param texts  - Array de strings en inglés a traducir.
 * @param target - Código de idioma destino (ej. "es", "fr", "pt").
 * @returns Array de strings traducidos en el mismo orden que la entrada.
 * @throws Si la API devuelve un estado de error HTTP.
 */
export async function googleTranslate(
  texts: string[],
  target: string
): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY

  if (!key) {
    console.warn(
      "[googleTranslate] GOOGLE_TRANSLATE_API_KEY is not set — returning original texts"
    )
    return texts
  }

  if (texts.length === 0) return []

  // Separar strings vacíos: la API los rechaza o produce resultados vacíos.
  const nonEmptyIndexes: number[] = []
  const nonEmptyTexts: string[] = []

  texts.forEach((text, i) => {
    if (text.trim()) {
      nonEmptyIndexes.push(i)
      nonEmptyTexts.push(text)
    }
  })

  if (nonEmptyTexts.length === 0) return texts

  // Dividir en chunks de CHUNK_SIZE.
  const chunks: string[][] = []
  for (let i = 0; i < nonEmptyTexts.length; i += CHUNK_SIZE) {
    chunks.push(nonEmptyTexts.slice(i, i + CHUNK_SIZE))
  }

  const translatedChunks = await Promise.all(
    chunks.map(async (chunk) => {
      const res = await fetch(`${TRANSLATE_URL}?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: chunk,
          target,
          format: "text",
          source: "en",
        }),
      })

      if (!res.ok) {
        const body = await res.text().catch(() => "(no body)")
        throw new Error(
          `Google Translate API error ${res.status}: ${body}`
        )
      }

      const json = (await res.json()) as {
        data: { translations: Array<{ translatedText: string }> }
      }

      return json.data.translations.map((t) => t.translatedText)
    })
  )

  const translatedNonEmpty = translatedChunks.flat()

  // Reconstruir el array original, dejando los strings vacíos en su posición.
  const result = [...texts]
  nonEmptyIndexes.forEach((originalIdx, translatedIdx) => {
    result[originalIdx] = translatedNonEmpty[translatedIdx]
  })

  return result
}
