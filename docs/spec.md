# Especificación y Reglas de Negocio — Mystik

## Signos Zodiacales

### Signos válidos

La aplicación soporta exactamente **12 signos zodiacales**. Cualquier slug fuera de esta lista produce un `notFound()` o un error de validación.

| Slug | Nombre | Rango de Fechas |
|---|---|---|
| `aries` | Aries | Mar 21 – Abr 19 |
| `taurus` | Taurus | Abr 20 – May 20 |
| `gemini` | Gemini | May 21 – Jun 20 |
| `cancer` | Cancer | Jun 21 – Jul 22 |
| `leo` | Leo | Jul 23 – Ago 22 |
| `virgo` | Virgo | Ago 23 – Sep 22 |
| `libra` | Libra | Sep 23 – Oct 22 |
| `scorpio` | Scorpio | Oct 23 – Nov 21 |
| `sagittarius` | Sagittarius | Nov 22 – Dic 21 |
| `capricorn` | Capricorn | Dic 22 – Ene 19 |
| `aquarius` | Aquarius | Ene 20 – Feb 18 |
| `pisces` | Pisces | Feb 19 – Mar 20 |

**Validación:** `isValidSign(slug)` en `lib/zodiac-signs.ts`. Se invoca tanto en el routing dinámico (`generateStaticParams`) como en las Server Actions.

## Datos de Nacimiento

### Restricciones de Validación

| Campo | Tipo | Rango válido | Obligatorio |
|---|---|---|---|
| `year` | number | 1900 – año actual | Sí |
| `month` | number | 1 – 12 | Sí |
| `day` | number | 1 – 31 | Sí |
| `hour` | number | 0 – 23 | No (default: 12) |
| `minute` | number | 0 – 59 | No (default: 0) |
| `latitude` | number | Finito | Sí |
| `longitude` | number | Finito | Sí |
| `city` | string | — | Opcional (display) |

**Regla de negocio:** Si el usuario no conoce su hora de nacimiento, el sistema utiliza **12:00 PM** como valor por defecto. Se muestra un aviso indicando que la precisión para casas y ascendente será limitada.

### Formato de Fecha para la API

- **Horóscopo diario:** `"today"` o `YYYY-MM-DD`
- **Datetime de sinastría:** `YYYY-MM-DDTHH:mm:ss` (sin timezone, el timezone se envía como `tz_str`)

## Búsqueda de Ciudades

| Parámetro | Valor | Razón |
|---|---|---|
| Longitud mínima de query | 2 caracteres | Evitar búsquedas demasiado amplias |
| Límite de resultados | 10 | Balance entre completitud y rendimiento |
| Debounce | 400 ms | Evitar peticiones excesivas durante el tipeo |
| Timeout | 30.000 ms | La geocodificación puede ser lenta en cold starts |

**Regla:** Cuando el query tiene menos de 2 caracteres, el hook retorna un array vacío sin hacer petición al servidor.

## Dominios de Sinastría

Los reportes de sinastría evalúan la compatibilidad en **6 dominios**:

| Dominio | Descripción |
|---|---|
| `romance` | Atracción física y emocional |
| `communication` | Fluidez en la comunicación y entendimiento |
| `stability` | Solidez de la relación a largo plazo |
| `intimacy` | Profundidad emocional y vulnerabilidad |
| `growth` | Potencial de crecimiento mutuo |
| `tension` | Nivel de fricción y conflicto potencial |

Los puntajes se representan como valores numéricos (0–100) con dirección opcional.

## Escalas de Puntaje del Horóscopo

### Etiquetas de energía (`getScoreLabel`)

| Rango de Puntaje | Etiqueta |
|---|---|
| 0 – 24 | Challenging |
| 25 – 44 | Low support |
| 45 – 59 | Mixed |
| 60 – 74 | Supportive |
| 75 – 100 | Strong tailwind |

### Dimensiones de puntaje

Cada horóscopo diario evalúa 5 dimensiones:

| Dimensión | Clave |
|---|---|
| General | `overall` (opcional) |
| Amor | `love` |
| Carrera | `career` |
| Dinero | `money` |
| Salud | `health` |

## Aspectos de Sinastría

### Propiedades de un aspecto

| Campo | Tipo | Descripción |
|---|---|---|
| `rank` | number | Orden de importancia |
| `strength` | string | Intensidad del aspecto |
| `polarity` | string | Naturaleza: positiva o desafiante |
| `polarity_score` | number | Valor numérico de la polaridad |
| `abs_polarity` | number | Valor absoluto de la polaridad |
| `domains` | string[] | Dominios afectados por el aspecto |
| `display_policy` | string | Política de visualización |
| `default_block` | string | Bloque por defecto: `"supportive"` o `"challenging"` |

### Bloques interpretativos

Cada aspecto incluye dos bloques narrativos:
- **`supportive`**: Interpretación positiva del aspecto
- **`challenging`**: Interpretación de los retos que presenta

## Codificación Base64URL

Los payloads de sinastría y datos de nacimiento personalizados se transmiten vía **query string** codificados en Base64URL:

1. El formulario construye el payload como objeto JavaScript
2. `encodeBase64Url()` serializa a JSON → UTF-8 → Base64 con caracteres URL-safe (`-` en vez de `+`, `_` en vez de `/`, sin padding `=`)
3. Se navega a la ruta destino con `?q={encoded}`
4. La página destino decodifica con `decodeBase64Url()` y valida con Zod

**Límite de seguridad:** Los payloads codificados se limitan a **2048 caracteres** máximo para prevenir abuso.

## Tránsitos Natales

Los tránsitos aparecen en las lecturas personalizadas y contienen:

| Campo | Descripción |
|---|---|
| `transit_planet` | Planeta en tránsito |
| `natal_planet` | Planeta natal afectado |
| `aspect` | Tipo de aspecto formado |
| `orb_deg` | Desviación del aspecto exacto en grados |
| `is_applying` | Si el aspecto se está acercando (true) o separando (false) |
| `score` | Significancia del tránsito (> 80 = "Significant") |
| `explanation` | Interpretación narrativa con texto principal, puntos de guía y tags |

Los tránsitos se ordenan por `orb_deg` ascendente (los más exactos primero).
