/**
 * @module validations/synastry-form.schema
 *
 * Esquema Zod para la validación del formulario de sinastría en el cliente.
 * Define la estructura que React Hook Form espera, que es diferente
 * al payload de la API (la transformación ocurre en `synastry-form-utils.ts`).
 */

import { z } from "zod"
import type { CityResult } from "@/lib/validations/geo.schema"

// --- Esquema del Formulario ---

/**
 * Esquema de validación para una persona en el formulario de sinastría.
 *
 * Incluye un `refine` a nivel de objeto que verifica que `location` no sea `null`.
 * Se implementa como refinamiento en vez de `z.object()` directo porque
 * la selección de ciudad es un campo controlado que empieza como `null`
 * y se llena asíncronamente al seleccionar del autocomplete.
 */
const personSchema = z
  .object({
    name: z.string().optional(),
    date: z.string().min(1, "Birth date is required"),
    time: z.string().refine((v) => v === "" || /^\d{2}:\d{2}$/.test(v), {
      message: "Expected format: HH:mm",
    }),
    location: z.custom<CityResult | null>(
      (v) =>
        v === null ||
        (typeof (v as CityResult).lat === "number" &&
          isFinite((v as CityResult).lat) &&
          typeof (v as CityResult).lng === "number" &&
          isFinite((v as CityResult).lng) &&
          typeof (v as CityResult).name === "string"),
      "Invalid city data"
    ),
  })
  .refine((data) => data.location !== null, {
    message: "Birth city must be selected from the list",
    path: ["location"],
  })

/**
 * Esquema raíz del formulario de sinastría.
 * Requiere datos de dos personas (Persona A y Persona B).
 */
export const synastryFormSchema = z.object({
  a: personSchema,
  b: personSchema,
})

/** Tipo inferido de los valores del formulario para usar con `useForm<SynastryFormValues>`. */
export type SynastryFormValues = z.infer<typeof synastryFormSchema>

// --- Valores por Defecto ---

/**
 * Genera un objeto vacío para inicializar los campos de una persona.
 * Se usa como `defaultValues` en React Hook Form.
 *
 * @returns Objeto con campos vacíos y `location` como `null`.
 */
export const emptySynastryPerson = () => ({
  name: "",
  date: "",
  time: "",
  location: null as CityResult | null,
})
