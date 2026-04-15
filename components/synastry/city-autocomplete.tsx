/**
 * @module components/synastry/city-autocomplete
 *
 * Campo de autocompletado para búsqueda de ciudades con dropdown,
 * navegación por teclado (↑/↓/Enter/Esc) y feedback visual de
 * estados (loading, error, sin resultados, ciudad seleccionada).
 * Usa el hook `useCitySearch` para la lógica de búsqueda con debounce.
 */
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Loader2, MapPin } from "lucide-react"
import { type KeyboardEvent, useEffect } from "react"

import type { CityResult } from "@/lib/validations/geo.schema"
import { useCitySearch } from "@/hooks/use-city-search"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface CityAutocompleteProps {
  label: string
  onSelect: (city: CityResult) => void
  onClear?: () => void
  initialCity?: CityResult
  onLoadingChange?: (loading: boolean) => void
}

export function CityAutocomplete({
  label,
  onSelect,
  onClear,
  initialCity,
  onLoadingChange,
}: CityAutocompleteProps) {
  const t = useTranslations("city_autocomplete")
  const {
    query,
    selectedCity,
    results,
    loading,
    isOpen,
    searchError,
    activeIndex,
    setActiveIndex,
    containerRef,
    selectCity,
    handleQueryChange,
    setIsOpen,
  } = useCitySearch({ initialCity })

  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

  const handleSelect = (city: CityResult) => {
    selectCity(city)
    onSelect(city)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return
    if (e.key === "ArrowDown") {
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      e.preventDefault()
    } else if (e.key === "ArrowUp") {
      setActiveIndex((i) => Math.max(i - 1, 0))
      e.preventDefault()
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(results[activeIndex])
      e.preventDefault()
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <label
        htmlFor={`city-input-${label}`}
        className="mb-1.5 ml-1 block text-[10px] font-bold tracking-[0.4em] text-muted-foreground uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={`city-input-${label}`}
          type="text"
          value={query}
          onChange={(e) => {
            handleQueryChange(e.target.value)
            if (selectedCity) {
              onClear?.()
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          autoComplete="off"
          aria-activedescendant={
            activeIndex >= 0 ? `city-option-${activeIndex}` : undefined
          }
          className={cn(
            "w-full rounded-none border border-star-dust-700 bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-koromiko-500/50 focus:outline-none",
            query && !selectedCity && "border-destructive/50"
          )}
        />
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-star-dust-500" />
          ) : (
            <MapPin className="h-4 w-4 text-star-dust-700" />
          )}
        </div>
      </div>

      {selectedCity && (
        <p className="mt-1.5 ml-1 flex items-center gap-1.5 text-[10px] text-koromiko-500">
          <MapPin className="h-3 w-3" />
          {selectedCity.name} · {selectedCity.timezone}
        </p>
      )}

      {query &&
        query.length >= 2 &&
        !selectedCity &&
        !loading &&
        !isOpen &&
        !searchError && (
          <p className="mt-1.5 ml-1 text-[10px] text-star-dust-500 italic">
            {t("no_results")}
          </p>
        )}

      {searchError && !loading && (
        <p className="mt-1.5 ml-1 text-[10px] text-destructive">
          {t("search_error")}
        </p>
      )}

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            role="listbox"
            aria-label={t("results_label")}
            aria-live="polite"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto border border-star-dust-700 bg-card shadow-xl"
          >
            {results.map((city, i) => (
              <button
                key={`${city.name}-${city.lat}-${i}`}
                id={`city-option-${i}`}
                type="button"
                role="option"
                aria-selected={
                  selectedCity?.name === city.name &&
                  selectedCity?.lat === city.lat
                }
                data-active={i === activeIndex}
                onClick={() => handleSelect(city)}
                className="w-full border-b border-star-dust-700/50 px-4 py-3 text-left transition-colors last:border-0 hover:bg-star-dust-800/50 data-[active=true]:bg-star-dust-800/50"
              >
                <div className="text-sm font-medium text-foreground">
                  {city.name}
                </div>
                <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  {city.country_code} · {city.timezone}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
