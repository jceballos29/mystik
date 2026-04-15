# Mystik — Horóscopo Diario & Sinastría

Aplicación de astrología moderna construida con **Next.js 16 (App Router)** que ofrece horóscopos diarios por signo zodiacal, lecturas personalizadas basadas en carta natal con tránsitos planetarios, y reportes de compatibilidad (sinastría) entre dos personas.

## Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.x |
| UI | React | 19.x |
| Validación | Zod + React Hook Form | 4.x / 7.x |
| Componentes | shadcn/ui + Radix UI | 4.x |
| Animaciones | Framer Motion | 12.x |
| Estilos | Tailwind CSS | 4.x |
| Tipografía | El Messiri (títulos) + Proza Libre (cuerpo) | — |
| Runtime | Node.js + pnpm | — |

## Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/jceballos29/mystik.git && cd mystik

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con las credenciales de FreeAstroAPI

# 4. Iniciar en modo desarrollo (Turbopack)
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Variables de Entorno

Referencia: [`.env.example`](.env.example)

| Variable | Descripción | Requerida |
|---|---|---|
| `FREEASTROAPI_BASE_URL` | URL base de la API de astrología | Sí |
| `FREEASTROAPI_API_KEY` | Clave de autenticación (`x-api-key`) | Sí |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio (SEO, sitemap) | Sí |

## Mapa de Rutas

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | SSR | Landing page: hero, servicios, about, formularios de horóscopo personalizado y sinastría |
| `/horoscope/[sign]` | SSG (`generateStaticParams`) | Horóscopo diario por signo zodiacal con puntajes de energía, contexto cósmico y recomendaciones |
| `/horoscope/personalize` | Client-side | Lectura personalizada basada en fecha, hora y lugar de nacimiento con tránsitos natales |
| `/synastry` | SSR con `searchParams` | Reporte de compatibilidad astrológica entre dos personas con aspectos detallados |

## Estructura del Proyecto

```
mystik/
├── app/                        # App Router de Next.js
│   ├── layout.tsx              # Layout raíz (fuentes, providers, header/footer)
│   ├── page.tsx                # Landing page
│   ├── horoscope/
│   │   ├── [sign]/page.tsx     # Horóscopo diario por signo (SSG)
│   │   └── personalize/page.tsx # Lectura personalizada (cliente)
│   └── synastry/page.tsx       # Reporte de sinastría
├── components/                 # Componentes React
│   ├── ui/                     # Componentes primitivos (shadcn/ui)
│   ├── home/                   # Secciones del landing
│   ├── horoscope/              # Componentes del horóscopo
│   └── synastry/               # Componentes de sinastría
├── lib/                        # Lógica de negocio
│   ├── astro-api/              # Proxy seguro a FreeAstroAPI (server-only)
│   │   ├── client.ts           # Cliente HTTP con autenticación
│   │   ├── horoscope.ts        # Server Actions de horóscopo
│   │   ├── synastry.ts         # Server Actions de sinastría
│   │   └── geo.ts              # Server Actions de geocodificación
│   └── validations/            # Esquemas Zod centralizados
│       ├── horoscope.schema.ts
│       ├── synastry.schema.ts
│       ├── synastry-form.schema.ts
│       └── geo.schema.ts
├── hooks/                      # Hooks personalizados
│   └── use-city-search.ts      # Búsqueda de ciudades con debounce
└── docs/                       # Documentación técnica
    ├── ARCHITECTURE.md
    ├── API_INTEGRATION.md
    ├── spec.md
    └── rules.md
```

## Scripts Disponibles

```bash
pnpm dev        # Servidor de desarrollo con Turbopack
pnpm build      # Build de producción
pnpm start      # Servir build de producción
pnpm lint       # Linting con ESLint
pnpm format     # Formateo con Prettier
pnpm typecheck  # Verificación de tipos con TypeScript
```

## Documentación Técnica

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Arquitectura y flujo de datos
- [`docs/API_INTEGRATION.md`](docs/API_INTEGRATION.md) — Contrato con la API externa
- [`docs/spec.md`](docs/spec.md) — Especificación y reglas de negocio
- [`docs/rules.md`](docs/rules.md) — Directrices de código
