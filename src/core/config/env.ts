import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1, 'VITE_API_BASE_URL is required'),
  VITE_CDN_BASE_URL: z.string().min(1, 'VITE_CDN_BASE_URL is required'),
  // Public origin where operators paste delivery/preview links. We keep
  // this independent from window.location.origin so that links sent from
  // a localhost dev session still point to the real customer-facing host.
  VITE_APP_BASE_URL: z.string().min(1, 'VITE_APP_BASE_URL is required'),
})

const result = envSchema.safeParse(import.meta.env)

if (!result.success) {
  const formatted = result.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  throw new Error(`Missing or invalid environment variables:\n${formatted}`)
}

export const env = result.data
