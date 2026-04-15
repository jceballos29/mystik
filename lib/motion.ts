/**
 * @module motion
 *
 * Variantes de animación centralizadas para Framer Motion.
 * Se definen aquí para mantener consistencia visual en toda la aplicación
 * y evitar duplicación de configuraciones de animación en componentes.
 */

// --- Curvas de Easing ---

/** Curva de easing suave para animaciones de entrada/salida estándar. */
const easeOut: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

/** Curva de easing con efecto de rebote para animaciones de escala (spring-like). */
const easeSpring: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

// --- Variantes de Animación ---

/** Entrada desde abajo con desvanecimiento. Ideal para contenido principal y CTA. */
export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

/** Desvanecimiento simple sin desplazamiento. Para elementos que deben aparecer sutilmente. */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" as const },
  },
}

/** Entrada desde la izquierda. Para elementos que acompañan una lectura de izquierda a derecha. */
export const fadeLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

/** Entrada desde la derecha. Complemento visual de `fadeLeft` para layouts simétricos. */
export const fadeRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

/**
 * Contenedor que orquesta la entrada secuencial de sus hijos.
 * Combinar con `staggerItem` para que los elementos aparezcan uno tras otro
 * con un retraso de 120ms entre cada uno.
 */
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
}

/** Variante para hijos dentro de un `staggerContainer`. Entrada desde abajo con fade. */
export const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut },
  },
}

/** Entrada con efecto de escala (zoom-in). Usa la curva spring para un ligero rebote. */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: easeSpring },
  },
}

// --- Configuración de Viewport ---

/**
 * Configuración de viewport para `whileInView`.
 * `once: true` evita que la animación se re-ejecute al hacer scroll.
 * `margin: "-80px"` dispara la animación 80px antes de que el
 * elemento entre completamente al viewport, creando un efecto anticipado.
 */
export const viewportOnce = { once: true, margin: "-80px" }
