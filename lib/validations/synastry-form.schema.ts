import { z } from "zod"
import type { CityResult } from "@/lib/validations/geo.schema"

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

export const synastryFormSchema = z.object({
  a: personSchema,
  b: personSchema,
})

export type SynastryFormValues = z.infer<typeof synastryFormSchema>

export const emptySynastryPerson = () => ({
  name: "",
  date: "",
  time: "",
  location: null as CityResult | null,
})
