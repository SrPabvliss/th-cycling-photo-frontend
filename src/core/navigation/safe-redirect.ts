/**
 * The `redirect` of a sign in, sign up or confirmation, only when it is a route of this app: it
 * starts with one "/" and not with "//" or "/\" (which browsers read as another site). Anything
 * else is ignored, so a link built by someone else cannot send the buyer out of Titan TV.
 */
export function safeRedirect(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string' || !value.startsWith('/')) return null
  if (value.startsWith('//') || value.startsWith('/\\')) return null
  return value
}
