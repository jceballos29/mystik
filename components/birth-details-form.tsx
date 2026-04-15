"use client"

import { useRouter } from "next/navigation"
import { useForm, useWatch, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarDays, Clock } from "lucide-react"
import type { CityResult } from "@/lib/validations/geo.schema"
import { CityAutocomplete } from "@/components/synastry/city-autocomplete"
import { encodeBase64Url } from "@/lib/utils"

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

type BirthFormValues = z.infer<typeof birthSchema>

export function BirthDetailsForm() {
  const router = useRouter()

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

  const timeUnknown = useWatch({ control, name: "timeUnknown" })

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
            Birth Date
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
              Birth Time
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
              {timeUnknown ? "Time unknown ✓" : "I don't know"}
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
          Note: Accuracy for houses and ascendant will be limited. We&apos;ll
          use 12:00 PM as a default.
        </p>
      )}

      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <CityAutocomplete
            label="Birth City"
            onSelect={(city) => field.onChange(city)}
            onClear={() => field.onChange(null)}
            initialCity={field.value ?? undefined}
          />
        )}
      />

      {errors.city && (
        <p className="-mt-6 ml-1 text-[10px] text-destructive" role="alert">
          {errors.city.message}
        </p>
      )}

      <div className="space-y-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-14 w-full border border-star-dust-600 bg-koromiko-500/10 text-[10px] font-bold tracking-[0.4em] text-primary uppercase transition-all hover:border-koromiko-500/50 hover:bg-koromiko-500/20 disabled:pointer-events-none disabled:opacity-30"
        >
          See today&apos;s guidance
        </button>
      </div>
    </form>
  )
}
