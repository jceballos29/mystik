import { encodeBase64Url } from "@/lib/utils"
import type { SynastryApiPayload } from "@/lib/validations/synastry.schema"
import type { SynastryFormValues } from "@/lib/validations/synastry-form.schema"

export function buildSynastryPayload(values: SynastryFormValues): SynastryApiPayload {
  const { a, b } = values
  // The zodResolver guarantees location is non-null when this function is called,
  // but TypeScript cannot infer that from .refine(). Explicit guard instead of !.
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

export function encodeSynastryPayload(payload: SynastryApiPayload): string {
  return encodeBase64Url(payload)
}
