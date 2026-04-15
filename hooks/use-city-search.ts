/**
 * @module hooks/use-city-search
 *
 * Hook personalizado que encapsula la lógica de búsqueda de ciudades
 * con debounce, gestión de estado y manejo de dropdown. Se utiliza
 * en los componentes `CityAutocomplete` para los formularios de
 * sinastría y horóscopo personalizado.
 */
"use client"

import { useState, useEffect, useRef, useCallback } from "react"

import { searchCities } from "@/lib/astro-api/geo"
import type { CityResult } from "@/lib/validations/geo.schema"

// --- Configuración ---

/**
 * Tiempo de espera (ms) entre el último keystroke y la ejecución de la búsqueda.
 * Previene peticiones excesivas al servidor durante el tipeo rápido.
 */
const CITY_SEARCH_DEBOUNCE_MS = 400

// --- Tipos ---

/** Opciones de configuración para el hook `useCitySearch`. */
interface UseCitySearchOptions {
  /** Ciudad pre-seleccionada para inicializar el campo. */
  initialCity?: CityResult
}

// --- Hook ---

/**
 * Hook de búsqueda de ciudades con debounce y gestión de dropdown.
 *
 * Gestiona el ciclo completo de búsqueda:
 * 1. El usuario escribe → se aplica debounce de 400ms
 * 2. Se invoca la Server Action `searchCities()` con protección contra race conditions
 * 3. Se muestran los resultados en un dropdown con navegación por teclado
 * 4. Al seleccionar una ciudad, se cierra el dropdown y se notifica al componente padre
 *
 * La protección contra race conditions se implementa con un `requestIdRef`
 * que descarta respuestas de peticiones anteriores ya obsoletas.
 *
 * @param options - Opciones de configuración (ciudad inicial opcional).
 * @returns Objeto con estado de la búsqueda y funciones de control.
 */
export function useCitySearch({ initialCity }: UseCitySearchOptions = {}) {
  const [query, setQuery] = useState(initialCity?.name ?? "")
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(
    initialCity ?? null
  )
  const [results, setResults] = useState<CityResult[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  /**
   * Contador incremental para identificar la petición más reciente.
   * Si `id !== requestIdRef.current` al resolver, la respuesta se descarta
   * porque una petición más nueva ya fue enviada.
   */
  const requestIdRef = useRef(0)

  /** Ejecuta la búsqueda de ciudades con protección contra race conditions. */
  const handleSearch = useCallback(async (q: string) => {
    if (!q || q.length < 2) {
      setResults([])
      return
    }
    const id = ++requestIdRef.current
    setLoading(true)
    setSearchError(false)
    try {
      const result = await searchCities(q)
      if (id !== requestIdRef.current) return
      if (result.data) {
        setResults(result.data.results)
        setIsOpen(true)
        setActiveIndex(-1)
      } else {
        setResults([])
        setIsOpen(false)
        setSearchError(true)
      }
    } catch {
      if (id !== requestIdRef.current) return
      setSearchError(true)
    } finally {
      if (id === requestIdRef.current) setLoading(false)
    }
  }, [])

  /** Efecto de debounce: espera 400ms tras el último cambio antes de buscar. */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && (!selectedCity || query !== selectedCity.name)) {
        handleSearch(query)
      }
    }, CITY_SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, selectedCity, handleSearch])

  /** Cierra el dropdown al hacer click fuera del contenedor. */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /** Selecciona una ciudad, actualiza el query y cierra el dropdown. */
  const selectCity = useCallback((city: CityResult) => {
    setSelectedCity(city)
    setQuery(city.name)
    setIsOpen(false)
    setResults([])
    setSearchError(false)
    setActiveIndex(-1)
  }, [])

  /**
   * Maneja cambios en el input de texto.
   * Resetea la ciudad seleccionada si el usuario modifica el texto,
   * forzando una nueva búsqueda.
   */
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (selectedCity) {
        setSelectedCity(null)
      }
    },
    [selectedCity]
  )

  return {
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
  }
}
