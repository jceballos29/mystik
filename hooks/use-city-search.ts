"use client"

import { useState, useEffect, useRef, useCallback } from "react"

import { searchCities } from "@/lib/astro-api/geo"
import type { CityResult } from "@/lib/validations/geo.schema"

const CITY_SEARCH_DEBOUNCE_MS = 400

interface UseCitySearchOptions {
  initialCity?: CityResult
}

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
  const requestIdRef = useRef(0)

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query && (!selectedCity || query !== selectedCity.name)) {
        handleSearch(query)
      }
    }, CITY_SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query, selectedCity, handleSearch])

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

  const selectCity = useCallback((city: CityResult) => {
    setSelectedCity(city)
    setQuery(city.name)
    setIsOpen(false)
    setResults([])
    setSearchError(false)
    setActiveIndex(-1)
  }, [])

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
