import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Enables the "use cache" directive and cacheLife() for POST-request caching in Server Actions.
  // Required by lib/astro-api/horoscope.ts (getPersonalizedHoroscope) and synastry.ts (calculateSynastry).
  // Docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheLife
  cacheComponents: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'self';",
          },
        ],
      },
    ]
  },
}

export default nextConfig
