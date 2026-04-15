export interface ZodiacDateBound {
  month: string
  day: number
}

export interface ZodiacDate {
  start: ZodiacDateBound
  end: ZodiacDateBound
}

export interface ZodiacSign {
  id: string
  name: string
  image: string
  date: ZodiacDate
}
