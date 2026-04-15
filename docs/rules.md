# Directrices de Código — Mystik

## Principios Fundamentales

1. **Server-first:** La lógica de negocio vive en el servidor. El cliente solo se encarga de la UI y la validación optimista.
2. **Doble validación:** Todo dato que cruza el límite cliente→servidor se valida dos veces: una con RHF (UX) y otra con Zod en el servidor (seguridad).
3. **Nunca confiar en el cliente:** Las Server Actions deben funcionar correctamente incluso si se invocan directamente sin pasar por un formulario.

## Server Actions

### Estructura obligatoria

Toda Server Action que interactúe con la API externa debe seguir esta estructura:

```typescript
"use server"

export async function miAction(input: TipoEntrada): Promise<TipoResultado> {
  // 1. Validar entrada con safeParse
  const validation = schema.safeParse(input)
  if (!validation.success) {
    return { error: "Mensaje descriptivo" }
  }

  // 2. Intentar la operación en bloque try/catch
  try {
    const raw = await astroFetch<unknown>("/ruta", { ... })

    // 3. Validar respuesta de la API
    const parsed = responseSchema.safeParse(raw)
    if (!parsed.success) {
      console.error("[miAction] Schema validation failed:", parsed.error.issues)
      return { error: "The API schema has changed." }
    }

    return { data: parsed.data }
  } catch (error) {
    // 4. Loggear internamente, retornar mensaje genérico al usuario
    console.error("[miAction] Fetch error:", error)
    return { error: "Mensaje amigable para el usuario." }
  }
}
```

### Reglas estrictas

| Regla | Descripción |
|---|---|
| **`try/catch` obligatorio** | Toda invocación a `astroFetch()` debe estar envuelta en `try/catch`. Nunca dejar que una excepción se propague sin capturar. |
| **`safeParse`, no `parse`** | Usar siempre `safeParse()` para evitar excepciones no controladas en validación. |
| **Union discriminada** | El tipo de retorno debe ser una unión discriminada `{ data } | { error }`, nunca `throw`. |
| **Logs con prefijo** | Usar `console.error("[nombreFunción] Contexto:", error)` para trazabilidad en producción. |
| **Mensajes genéricos** | Los errores que llegan al usuario deben ser amigables y no exponer detalles internos. |

## Esquemas de Validación Zod

### Centralización

Todos los esquemas Zod deben vivir en `lib/validations/`. No se permiten esquemas inline en componentes o Server Actions, excepto para validaciones locales de formulario que no se reutilizan.

```
lib/validations/
├── horoscope.schema.ts       # Respuesta de la API de horóscopos
├── synastry.schema.ts         # Payload + respuesta de sinastría
├── synastry-form.schema.ts    # Validación del formulario de sinastría (cliente)
└── geo.schema.ts              # Respuesta de geocodificación
```

### Convenciones de naming

| Patrón | Uso | Ejemplo |
|---|---|---|
| `*Schema` (camelCase) | Esquema Zod | `horoscopeDataSchema` |
| `*ApiResponseSchema` | Schema de respuesta de API | `horoscopeApiResponseSchema` |
| `*ApiPayloadSchema` | Schema de payload hacia la API | `synastryApiPayloadSchema` |
| `*FormSchema` | Schema de formulario (cliente) | `synastryFormSchema` |
| `Type` (PascalCase) | Tipo inferido con `z.infer` | `HoroscopeData` |

### Reglas de esquemas

- Exportar **siempre** tanto el esquema como el tipo inferido.
- Usar `.transform()` para normalizar datos de la API (ej. array/record polimórficos).
- Marcar campos opcionales de la API con `.optional()`, nunca asumir su presencia.

## Componentes UI

### shadcn/ui como estándar

Los componentes visuales primitivos provienen exclusivamente de **shadcn/ui** (`components/ui/`). No crear componentes primitivos custom si shadcn/ui ya provee uno.

| Componente | Fuente | Uso |
|---|---|---|
| `Button` | shadcn/ui | Todas las acciones primarias y secundarias |
| `Typography` | shadcn/ui | Encabezados y párrafos tipográficos |
| Inputs nativos + estilos custom | — | Campos de formulario con tema Mystik |

### Organización de componentes

```
components/
├── ui/              # Primitivos de shadcn/ui (no modificar directamente)
├── home/            # Secciones específicas del landing
├── horoscope/       # Componentes del horóscopo
├── synastry/        # Componentes de sinastría
├── header.tsx       # Header global
├── footer.tsx       # Footer global
├── section.tsx      # Wrapper de sección reutilizable
└── section-title.tsx # Título de sección reutilizable
```

### Reglas de componentes

| Regla | Descripción |
|---|---|
| **Directiva explícita** | Si un componente usa hooks, eventos o estado, debe tener `"use client"` en la primera línea. |
| **Props tipadas** | Definir interfaces explícitas para props, no usar `any`. |
| **Composición sobre herencia** | Preferir componentes compuestos y slots sobre props de configuración excesivas. |

## Hooks Personalizados

- Ubicación: `hooks/` en la raíz del proyecto.
- Prefijo obligatorio: `use` (convención de React).
- Deben incluir `"use client"` como directiva.
- Documentar con JSDoc describiendo `@param`, `@returns` y el propósito del hook.

## Convenciones Generales

### Estructura de archivos

| Tipo de archivo | Ubicación | Convención de nombre |
|---|---|---|
| Páginas (rutas) | `app/**/page.tsx` | Dictado por App Router |
| Layouts | `app/**/layout.tsx` | Dictado por App Router |
| Server Actions | `lib/astro-api/*.ts` | `"use server"` como primera línea |
| Esquemas Zod | `lib/validations/*.schema.ts` | Sufijo `.schema.ts` |
| Hooks | `hooks/use-*.ts` | Prefijo `use-` |
| Utilidades | `lib/*.ts` | Nombre descriptivo |
| Componentes | `components/**/*.tsx` | PascalCase para exports |

### TypeScript

- **Strict mode** habilitado.
- Usar `import type` para importaciones que solo se usan como tipos.
- Preferir `unknown` sobre `any`. Si la API devuelve datos sin tipar, validar con Zod inmediatamente.
- Usar unions discriminadas para modelar resultados de operaciones (`Success | Error`).

### Estilos

- **Tailwind CSS 4** como sistema de estilos principal.
- Usar `cn()` (de `lib/utils.ts`) para merging condicional de clases.
- Colores del tema: `star-dust-*` (neutros), `koromiko-*` (acentos/dorados).
- No usar estilos inline excepto para valores dinámicos calculados.

### Animaciones

- **Framer Motion** para animaciones declarativas.
- Variantes centralizadas en `lib/motion.ts` (`fadeUp`, `fadeIn`, `staggerContainer`, etc.).
- Usar `viewportOnce` para animaciones de scroll que se ejecutan una sola vez.

### Comentarios

- Idioma: **español**.
- JSDoc/TSDoc obligatorio en Server Actions, hooks y utilidades.
- Principio "Por qué, no el Cómo": no documentar lo obvio.
- Separadores visuales en archivos mixtos: `// --- Sección ---`.

### Git

- Mensajes de commit en inglés (convención del equipo).
- Formato: tipo convencional (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
