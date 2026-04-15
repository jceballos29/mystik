import { z } from "zod"

const upstreamCitySchema = z
  .object({
    name: z.string(),
    country: z.string().optional(),
    country_code: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
    timezone: z.string(),
    population: z.number().optional(),
  })
  .transform((city) => ({
    name: city.name,
    country_code: city.country_code ?? city.country ?? "",
    lat: city.lat,
    lng: city.lng,
    timezone: city.timezone,
    population: city.population,
  }))

export const geoSearchResponseSchema = z
  .object({
    results: z.array(upstreamCitySchema),
    count: z.number().int().nonnegative().optional(),
  })
  .transform((value) => ({
    results: value.results,
    count: value.count ?? value.results.length,
  }))

export type CityResult = z.infer<
  typeof geoSearchResponseSchema
>["results"][number]
export type GeoSearchResponse = z.infer<typeof geoSearchResponseSchema>
