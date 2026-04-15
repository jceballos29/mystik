# Arquitectura — Mystik

## Visión General

Mystik sigue una arquitectura **unidireccional** basada en el App Router de Next.js 16, donde los datos fluyen desde formularios del cliente hasta una API externa pasando por dos capas de validación independientes. El servidor actúa como un proxy seguro que nunca expone credenciales al navegador.

## Diagrama de Flujo de Datos

```mermaid
flowchart TD
    subgraph Cliente ["🖥️ Cliente (Navegador)"]
        A["Formulario React"]
        B["React Hook Form + ZodResolver"]
        C["Validación Zod (Cliente)"]
    end

    subgraph Servidor ["⚙️ Servidor (Next.js)"]
        D["Server Action"]
        E["Validación Zod (Servidor)"]
        F["astroFetch — Proxy HTTP"]
        G["Validación Zod (Respuesta)"]
    end

    subgraph Externo ["🌐 API Externa"]
        H["FreeAstroAPI"]
    end

    A -->|"submit"| B
    B -->|"zodResolver"| C
    C -->|"valores válidos"| D
    D -->|"safeParse"| E
    E -->|"payload validado"| F
    F -->|"x-api-key + JSON"| H
    H -->|"respuesta JSON"| G
    G -->|"datos tipados"| D
    D -->|"resultado tipado"| A

    style Cliente fill:#1a1a2e,color:#e0e0e0,stroke:#4a4a6a
    style Servidor fill:#16213e,color:#e0e0e0,stroke:#4a4a6a
    style Externo fill:#0f3460,color:#e0e0e0,stroke:#4a4a6a
```

## Validación en Dos Capas

La arquitectura implementa un modelo de **doble validación** que garantiza integridad de datos independientemente de cómo se invoque la función:

### Capa 1 — Cliente (React Hook Form + Zod)

Los formularios utilizan `useForm` con `zodResolver` para validar datos **antes** de enviarlos al servidor. Esta capa proporciona retroalimentación inmediata al usuario.

```
useForm<SynastryFormValues>({
  resolver: zodResolver(synastryFormSchema)
})
```

**Responsabilidades:**
- Validación de formato (fechas, horas, strings no vacíos)
- Verificación de campos requeridos (ej. ubicación seleccionada)
- Feedback visual instantáneo en los campos del formulario

### Capa 2 — Servidor (Server Actions + Zod)

Las Server Actions (`"use server"`) re-validan **todo el payload** con `safeParse` antes de hacer la petición HTTP. Esta capa es la **barrera de seguridad real**, ya que la validación del cliente puede ser evadida.

```
const validation = synastryApiPayloadSchema.safeParse(payload)
if (!validation.success) {
  return { error: "Invalid payload" }
}
```

**Responsabilidades:**
- Re-validación completa del payload (nunca confiar en el cliente)
- Validación de rangos de negocio (ej. año de nacimiento ≥ 1900)
- Validación de la respuesta de la API contra esquemas Zod
- Transformación de errores a un formato consumible por el cliente

### Capa 3 — Validación de Respuesta

Los datos devueltos por la API externa también son validados contra esquemas Zod antes de ser utilizados. Esto protege contra cambios no anunciados en el contrato de la API.

```
const parsed = horoscopeApiResponseSchema.safeParse(raw)
if (!parsed.success) {
  return { error: "The API schema has changed." }
}
```

## Patrón de Proxy Seguro (`lib/astro-api/`)

```mermaid
flowchart LR
    subgraph Boundary ["Límite de Seguridad (server-only)"]
        CL["client.ts<br/>astroFetch()"]
        H["horoscope.ts<br/>Server Actions"]
        S["synastry.ts<br/>Server Actions"]
        G["geo.ts<br/>Server Actions"]
    end

    CL -.->|"x-api-key"| API["FreeAstroAPI"]
    H --> CL
    S --> CL
    G --> CL

    style Boundary fill:#1a1a2e,color:#e0e0e0,stroke:#e94560
```

El módulo `client.ts` importa `"server-only"` para garantizar a nivel de bundler que **nunca** se incluya en el JavaScript del cliente. Esto asegura que:

- La `FREEASTROAPI_API_KEY` nunca se expone al navegador
- La `FREEASTROAPI_BASE_URL` permanece privada
- Todas las peticiones a la API externa pasan por el servidor de Next.js

## Estrategia de Caché

| Módulo | Estrategia | TTL | Mecanismo |
|---|---|---|---|
| `getDailyHoroscope()` | ISR con tags | 1 hora | `next: { revalidate: 3600, tags: [...] }` |
| `fetchPersonalizedHoroscope()` | Caché de función | Horas | `"use cache"` + `cacheLife("hours")` |
| `fetchSynastryFromAPI()` | Caché de función | Horas | `"use cache"` + `cacheLife("hours")` |
| `searchCities()` | Sin caché | — | `cache: "no-store"` |

La búsqueda de ciudades no se cachea intencionalmente porque los resultados deben reflejar el input exacto del usuario en tiempo real.

## Flujo de Datos por Vista

### `/horoscope/[sign]` — Horóscopo Diario (SSG)

```mermaid
sequenceDiagram
    participant Build as Build Time
    participant SA as getDailyHoroscope()
    participant API as FreeAstroAPI

    Build->>Build: generateStaticParams() → 12 signos
    Build->>SA: getDailyHoroscope("aries")
    SA->>SA: Validar sign con isValidSign()
    SA->>API: GET /api/v2/horoscope/daily/sign?sign=aries&date=today
    API-->>SA: JSON (respuesta)
    SA->>SA: safeParse con horoscopeApiResponseSchema
    SA-->>Build: { data, meta } | { error }
```

### `/horoscope/personalize` — Lectura Personalizada (Cliente)

```mermaid
sequenceDiagram
    participant UI as BirthDetailsForm
    participant RHF as React Hook Form
    participant Nav as Router.push()
    participant Page as PersonalizePage
    participant SA as getPersonalizedHoroscope()
    participant API as FreeAstroAPI

    UI->>RHF: onSubmit(values)
    RHF->>RHF: zodResolver(birthSchema)
    RHF->>Nav: /horoscope/personalize?q=base64url
    Nav->>Page: useSearchParams() → decode
    Page->>SA: getPersonalizedHoroscope(birth)
    SA->>SA: Validar rangos (año, mes, día, hora)
    SA->>API: POST /api/v2/horoscope/daily/personal
    API-->>SA: JSON
    SA->>SA: safeParse respuesta
    SA-->>Page: { data, meta } | { error }
```

### `/synastry` — Reporte de Sinastría

```mermaid
sequenceDiagram
    participant Form as SynastryFormSection
    participant RHF as React Hook Form
    participant Nav as Router.push()
    participant Page as SynastryPage (SSR)
    participant SA as calculateSynastry()
    participant API as FreeAstroAPI

    Form->>RHF: onSubmit(values)
    RHF->>RHF: zodResolver(synastryFormSchema)
    RHF->>Form: buildSynastryPayload() + encodeBase64Url()
    Form->>Nav: /synastry?q=base64url
    Nav->>Page: searchParams.q → decodeBase64Url()
    Page->>Page: safeParse con synastryApiPayloadSchema
    Page->>SA: calculateSynastry(payload)
    SA->>SA: safeParse payload (re-validación)
    SA->>API: POST /api/v1/western/synastrycards
    API-->>SA: JSON
    SA->>SA: safeParse respuesta
    SA-->>Page: { data } | { error }
```

## Separación Server / Client

| Directiva | Archivos | Propósito |
|---|---|---|
| `"server-only"` (import) | `lib/astro-api/client.ts` | Impedir inclusión en el bundle del cliente |
| `"use server"` | `lib/astro-api/horoscope.ts`, `synastry.ts`, `geo.ts` | Marcar funciones como Server Actions invocables desde el cliente |
| `"use cache"` | Funciones internas (`fetchPersonalizedHoroscope`, `fetchSynastryFromAPI`) | Habilitar caché a nivel de función |
| `"use client"` | Formularios, hooks, componentes interactivos | Habilitar interactividad en el navegador |
