/**
 * @module components/birth-details-form
 *
 * Formulario para recopilar datos de nacimiento del usuario
 * y generar una lectura de horóscopo personalizada.
 *
 * Al enviar, codifica los datos en Base64URL y navega a
 * `/horoscope/personalize?q={encoded}`, donde se invoca
 * la Server Action `getPersonalizedHoroscope()`.
 */
"use client"

import { useRouter } from "next/navigation"
import { useState, useCallback } from "react"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarDays, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import type { CityResult } from "@/lib/validations/geo.schema"
import { CityAutocomplete } from "@/components/synastry/city-autocomplete"
import { encodeBase64Url } from "@/lib/utils"

// --- Esquema de Validación ---

/**
 * Esquema Zod local para el formulario de datos de nacimiento.
 *
 * Se define inline (no en `lib/validations/`) porque es específico
 * de este componente y no se reutiliza en otras partes de la aplicación.
 * Incluye un refinamiento que verifica que se haya seleccionado una
 * ciudad del autocomplete antes de permitir el envío.
 */
const birthSchema = z
  .object({
    date: z.string().min(1, "Birth date is required"),
    time: z.string(),
    city: z.custom<CityResult | null>(
      (v) =>
        v === null ||
        (typeof (v as CityResult).lat === "number" &&
          isFinite((v as CityResult).lat) &&
          typeof (v as CityResult).lng === "number" &&
          isFinite((v as CityResult).lng) &&
          typeof (v as CityResult).name === "string"),
      "Invalid city data"
    ),
    timeUnknown: z.boolean(),
  })
  .refine((data) => data.city !== null, {
    message: "Birth city is required",
    path: ["city"],
  })

/** Tipo inferido de los valores del formulario. */
type BirthFormValues = z.infer<typeof birthSchema>

// --- Componente ---

/**
 * Formulario de datos de nacimiento para horóscopo personalizado.
 *
 * Características:
 * - Toggle "I don't know" para la hora de nacimiento (usa 12:00 como fallback)
 * - Autocomplete de ciudad con geocodificación en tiempo real
 * - Validación con Zod vía zodResolver
 * - Codificación Base64URL del payload para transmisión por query string
 */
export function BirthDetailsForm() {
  const router = useRouter()
  const t = useTranslations("birth_form")
  const [isCitySearching, setIsCitySearching] = useState(false)
  const handleCityLoadingChange = useCallback(
    (loading: boolean) => setIsCitySearching(loading),
    []
  )

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<BirthFormValues>({
    resolver: zodResolver(birthSchema),
    defaultValues: {
      date: "",
      time: "12:00",
      city: null,
      timeUnknown: false,
    },
  })

  /** Observa el estado del toggle de hora desconocida para ajustar la UI. */
  const timeUnknown = useWatch({ control, name: "timeUnknown" })

  /**
   * Transforma los valores del formulario al formato de query string
   * y navega a la página de lectura personalizada.
   */
  const onSubmit = (values: BirthFormValues) => {
    if (!values.city) return

    const [year, month, day] = values.date.split("-")
    const [hour, min] = values.time.split(":")

    const birth = {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      min: Number(min),
      lat: values.city.lat,
      lon: values.city.lng,
      city: values.city.name,
    }
    const q = encodeBase64Url(birth)
    router.push(`/horoscope/personalize?q=${q}`)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-lg space-y-8"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="birth-date"
            className="flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase"
          >
            <CalendarDays className="h-3 w-3 opacity-50" />
            {t("birth_date")}
          </label>
          <input
            id="birth-date"
            type="date"
            {...register("date")}
            min="1900-01-01"
            max={new Date().toISOString().split("T")[0]}
            className="h-11 w-full border border-star-dust-600 bg-transparent px-4 text-sm text-star-dust-200 transition-colors focus:border-koromiko-500 focus:outline-none"
          />
          {errors.date && (
            <p
              className="mt-1.5 ml-1 text-[10px] text-destructive"
              role="alert"
            >
              {errors.date.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="birth-time"
              className="flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-star-dust-500 uppercase"
            >
              <Clock className="h-3 w-3 opacity-50" />
              {t("birth_time")}
            </label>
            <button
              type="button"
              onClick={() => {
                const newUnknown = !timeUnknown
                setValue("timeUnknown", newUnknown)
                if (newUnknown) setValue("time", "12:00")
              }}
              className={`text-[9px] tracking-tight transition-colors ${
                timeUnknown
                  ? "font-bold text-koromiko-400"
                  : "text-star-dust-600 hover:text-star-dust-400"
              }`}
            >
              {timeUnknown ? t("time_unknown_set") : t("time_unknown")}
            </button>
          </div>
          <div className={timeUnknown ? "pointer-events-none opacity-30" : ""}>
            <input
              id="birth-time"
              type="time"
              {...register("time")}
              className="h-11 w-full border border-star-dust-600 bg-transparent px-4 text-sm text-star-dust-200 transition-colors focus:border-koromiko-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {timeUnknown && (
        <p className="-mt-4 text-[10px] leading-relaxed text-star-dust-600 italic">
          {t("time_unknown_note")}
        </p>
      )}

      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <CityAutocomplete
            label={t("birth_city")}
            onSelect={(city) => field.onChange(city)}
            onClear={() => field.onChange(null)}
            initialCity={field.value ?? undefined}
            onLoadingChange={handleCityLoadingChange}
          />
        )}
      />

      {errors.city && (
        <p className="-mt-6 ml-1 text-[10px] text-destructive" role="alert">
          {errors.city.message}
        </p>
      )}

      <div className="space-y-3 pt-4">
        {isCitySearching && (
          <p className="ml-1 text-[10px] text-star-dust-500 italic">
            {t("city_searching")}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isCitySearching}
          className="h-14 w-full border border-star-dust-600 bg-koromiko-500/10 text-[10px] font-bold tracking-[0.4em] text-primary uppercase transition-all hover:border-koromiko-500/50 hover:bg-koromiko-500/20 disabled:pointer-events-none disabled:opacity-30"
        >
          {t("submit")}
        </button>
      </div>
    </form>
  )
}
