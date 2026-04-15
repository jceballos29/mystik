"use client"

import { useState, useTransition } from "react"
import {
  useForm,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

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

export function SynastryFormSection() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isPending, startTransition] = useTransition()

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

  const onSubmit = (values: SynastryFormValues) => {
    const payload = buildSynastryPayload(values)
    const encoded = encodeSynastryPayload(payload)
    startTransition(() => {
      router.push(`/synastry?q=${encoded}`)
    })
  }

  const onInvalid = (fieldErrors: FieldErrors<SynastryFormValues>) => {
    if (fieldErrors.a && step === 2) setStep(1)
  }

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
          Person A
        </button>
        <button
          type="button"
          onClick={() => setStep(2)}
          className={`flex-1 px-6 py-3 text-center text-sm tracking-widest uppercase transition-colors ${
            step === 2
              ? "text-koromiko-400"
              : "text-star-dust-500 hover:text-star-dust-300"
          }`}
        >
          Person B
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
            />
          ) : (
            <PersonInput
              key="person-b"
              person="b"
              register={register}
              control={control}
              errors={errors}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {step === 2 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-xs tracking-wider text-star-dust-500 uppercase transition-colors hover:text-foreground"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step === 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleNext}
            className="border-star-dust-700 hover:border-koromiko-500/50 w-full"
          >
            Next Person →
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isPending}
            className="border border-koromiko-500/30 bg-koromiko-500/10 text-koromiko-400 hover:bg-koromiko-500/20"
            variant="ghost"
          >
            {isPending ? "Calculating…" : "Access report"}
          </Button>
        )}
      </div>
    </form>
  )
}

function PersonInput({
  person,
  register,
  control,
  errors,
}: {
  person: "a" | "b"
  register: ReturnType<typeof useForm<SynastryFormValues>>["register"]
  control: Control<SynastryFormValues>
  errors: ReturnType<typeof useForm<SynastryFormValues>>["formState"]["errors"]
}) {
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
          Name (Optional)
        </label>
        <input
          {...register(`${person}.name`)}
          id={`${person}-name`}
          type="text"
          className="w-full rounded-none border border-star-dust-700 bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-koromiko-500/50 focus:outline-none"
          placeholder="Enter name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor={`${person}-date`}
            className="ml-1 block text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase"
          >
            Date of Birth
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
            Time (Approx)
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
              label="Place of Birth"
              onSelect={(city: CityResult) => field.onChange(city)}
              onClear={() => field.onChange(null)}
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
