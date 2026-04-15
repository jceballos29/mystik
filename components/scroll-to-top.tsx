"use client"

// usePathname returns the current path and updates on every navigation.
// It is the correct way to "listen" to route changes in App Router from
// a Client Component, without directly accessing the browser history.
import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Resets the scroll to the top of the page on every route change.
 *
 * Why it's necessary:
 * Next.js App Router performs SPA navigation — the browser does not reload
 * the page, it only replaces the layout's `children`. The browser has no way
 * of knowing that the "page changed" and does not reset the scroll on its own.
 * Next.js tries to call window.scrollTo(0, 0) internally, but it can
 * fail if next-themes rehydrates the <html> in that same render cycle.
 *
 * How it works:
 * usePathname changes on every navigation → the useEffect fires →
 * window.scrollTo(0, 0) forces the scroll to the top, without animation,
 * regardless of what Next.js does internally.
 *
 * This component renders nothing (returns null) — it only has side effects.
 * It is placed in the RootLayout to cover all routes in the app.
 */
export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // { top: 0, behavior: "instant" } avoids animated (smooth) scrolling.
    // If "smooth" were used, the user would see the scroll moving visually
    // every time they navigate, which is annoying.
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])

  return null
}
