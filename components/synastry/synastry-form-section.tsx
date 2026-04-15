/**
 * @module components/synastry/synastry-form-section
 *
 * Formulario de sinastría que recopila los datos de nacimiento de dos personas.
 * Implementa un flujo de dos pasos (Persona A → Persona B) con validación
 * progresiva usando React Hook Form + ZodResolver.
 *
 * Al enviar, construye el payload de la API, lo codifica en Base64URL
 * y navega a `/synastry?q={encoded}` para generar el reporte.
 */
"use client"

import { useState, useTransition, useCallback } from "react"
import {
  useForm,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { CityAutocomplete } from "@/components/synastry/city-autocomplete"
import type { CityResult } from "@/lib/validations/geo.schema"
import {
  synastryFormSchema,
  emptySynastryPerson,
  type SynastryFormValues,
} from "@/lib/validations/synastry-form.schema"
import {
  buildSynastryPayload,
  encodeSynastryPayload,
} from "@/lib/synastry-form-utils"

// --- Componente Principal ---

/**
 * Formulario de sinastría con navegación por pasos.
 *
 * Flujo de interacción:
 * 1. El usuario completa los datos de la Persona A y presiona "Next Person"
 * 2. Se validan solo los campos de A con `trigger()` antes de avanzar
 * 3. El usuario completa los datos de la Persona B y presiona "Access report"
 * 4. Se valida el formulario completo con ZodResolver
 * 5. Se construye el payload, se codifica y se navega a /synastry
 *
 * Se usa `useTransition` para manejar la navegación con estado de carga
 * sin bloquear la UI principal.
 */
export function SynastryFormSection() {
  const router = useRouter()
  const t = useTranslations("synastry_form")
  const [step, setStep] = useState<1 | 2>(1)
  const [isPending, startTransition] = useTransition()
  const [isCitySearchingA, setIsCitySearchingA] = useState(false)
  const [isCitySearchingB, setIsCitySearchingB] = useState(false)
  const handleCityLoadingA = useCallback(
    (loading: boolean) => setIsCitySearchingA(loading),
    []
  )
  const handleCityLoadingB = useCallback(
    (loading: boolean) => setIsCitySearchingB(loading),
    []
  )

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<SynastryFormValues>({
    resolver: zodResolver(synastryFormSchema),
    defaultValues: { a: emptySynastryPerson(), b: emptySynastryPerson() },
  })

  /** Construye el payload, lo codifica y navega a la página de resultados. */
  const onSubmit = (values: SynastryFormValues) => {
    const payload = buildSynastryPayload(values)
    const encoded = encodeSynastryPayload(payload)
    startTransition(() => {
      router.push(`/synastry?q=${encoded}`)
    })
  }

  /** Si hay errores en Persona A estando en el paso 2, retrocede automáticamente. */
  const onInvalid = (fieldErrors: FieldErrors<SynastryFormValues>) => {
    if (fieldErrors.a && step === 2) setStep(1)
  }

  /** Valida solo los campos de Persona A antes de avanzar al paso 2. */
  const handleNext = async () => {
    const valid = await trigger(["a.date", "a.time", "a.location"])
    if (valid) setStep(2)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="w-full">
      <div className="relative mb-8 flex border-b border-star-dust-700">
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`flex-1 px-6 py-3 text-center text-sm tracking-widest uppercase transition-colors ${
            step === 1
              ? "text-koromiko-400"
              : "text-star-dust-500 hover:text-star-dust-300"
          }`}
        >
          {t("person_a")}
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={isCitySearchingA}
          className={`flex-1 px-6 py-3 text-center text-sm tracking-widest uppercase transition-colors disabled:pointer-events-none disabled:opacity-40 ${
            step === 2
              ? "text-koromiko-400"
              : "text-star-dust-500 hover:text-star-dust-300"
          }`}
        >
          {t("person_b")}
        </button>

        <motion.div
          className="absolute bottom-0 h-0.5 bg-koromiko-500"
          initial={false}
          animate={{
            left: step === 1 ? "0%" : "50%",
            width: "50%",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      <div className="min-h-75">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <PersonInput
              key="person-a"
              person="a"
              register={register}
              control={control}
              errors={errors}
              onCityLoadingChange={handleCityLoadingA}
            />
          ) : (
            <PersonInput
              key="person-b"
              person="b"
              register={register}
              control={control}
              errors={errors}
              onCityLoadingChange={handleCityLoadingB}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 space-y-3">
        {step === 1 && isCitySearchingA && (
          <p className="text-center text-[10px] text-star-dust-500 italic">
            {t("city_searching")}
          </p>
        )}
        {step === 2 && isCitySearchingB && (
          <p className="text-center text-[10px] text-star-dust-500 italic">
            {t("city_searching")}
          </p>
        )}
        <div className="flex items-center justify-between">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs tracking-wider text-star-dust-500 uppercase transition-colors hover:text-foreground"
            >
              {t("back")}
            </button>
          ) : (
            <div />
          )}

          {step === 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleNext}
              disabled={isCitySearchingA}
              className="w-full border-star-dust-700 hover:border-koromiko-500/50"
            >
              {t("next")}
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isPending || isCitySearchingB}
              className="border border-koromiko-500/30 bg-koromiko-500/10 text-koromiko-400 hover:bg-koromiko-500/20"
              variant="ghost"
            >
              {isPending ? t("calculating") : t("submit")}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

// --- Subcomponente de Entrada por Persona ---

/**
 * Campos de entrada para una persona (A o B) dentro del formulario de sinastría.
 * Renderiza nombre, fecha de nacimiento, hora y selector de ciudad.
 * Se anima con Framer Motion al cambiar de paso.
 *
 * @param person - Identificador del formulario: "a" o "b".
 * @param register - Función `register` de React Hook Form.
 * @param control - Objeto `Control` para campos controlados (Controller).
 * @param errors - Errores de validación del formulario completo.
 */
function PersonInput({
  person,
  register,
  control,
  errors,
  onCityLoadingChange,
}: {
  person: "a" | "b"
  register: ReturnType<typeof useForm<SynastryFormValues>>["register"]
  control: Control<SynastryFormValues>
  errors: ReturnType<typeof useForm<SynastryFormValues>>["formState"]["errors"]
  onCityLoadingChange?: (loading: boolean) => void
}) {
  const t = useTranslations("synastry_form")
  const personErrors = errors[person]
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-1.5">
        <label
          htmlFor={`${person}-name`}
          className="ml-1 block text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase"
        >
          {t("name_label")}
        </label>
        <input
          {...register(`${person}.name`)}
          id={`${person}-name`}
          type="text"
          className="w-full rounded-none border border-star-dust-700 bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-koromiko-500/50 focus:outline-none"
          placeholder={t("name_placeholder")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor={`${person}-date`}
            className="ml-1 block text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase"
          >
            {t("date_of_birth")}
          </label>
          <input
            {...register(`${person}.date`)}
            id={`${person}-date`}
            type="date"
            min="1900-01-01"
            max={new Date().toISOString().split("T")[0]}
            className="w-full rounded-none border border-star-dust-700 bg-card px-4 py-3 text-sm text-foreground scheme-dark transition-colors focus:border-koromiko-500/50 focus:outline-none"
          />
          {personErrors?.date && (
            <p
              className="mt-0.5 ml-1 text-[10px] text-destructive"
              role="alert"
            >
              {personErrors.date.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor={`${person}-time`}
            className="ml-1 block text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase"
          >
            {t("time_approx")}
          </label>
          <input
            {...register(`${person}.time`)}
            id={`${person}-time`}
            type="time"
            className="w-full rounded-none border border-star-dust-700 bg-card px-4 py-3 text-sm text-foreground scheme-dark transition-colors focus:border-koromiko-500/50 focus:outline-none"
          />
        </div>
      </div>

      <Controller
        name={`${person}.location`}
        control={control}
        render={({ field }) => (
          <div>
            <CityAutocomplete
              label={t("place_of_birth")}
              onSelect={(city: CityResult) => field.onChange(city)}
              onClear={() => field.onChange(null)}
              onLoadingChange={onCityLoadingChange}
            />
            {personErrors?.location && (
              <p
                className="mt-1.5 ml-1 text-[10px] text-destructive"
                role="alert"
              >
                {personErrors.location.message as string}
              </p>
            )}
          </div>
        )}
      />
    </motion.div>
  )
}
