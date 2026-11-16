/** What index.html says, plus the page reaching the screen edges. */
export const VIEWPORT_FIT_COVER = 'viewport-fit=cover'

/**
 * In portrait the page reaches the bottom edge of the screen: without viewport-fit=cover, Chrome
 * on iPhone leaves a gap under the bars anchored to the bottom when it hides its own bar. In
 * landscape it does not: with cover the page would also take the sides of the notch, and its width
 * would grow past the breakpoints (750px of page on an iPhone 14 would become 844px, the desktop
 * layout). So the viewport tag says cover only while the screen is in portrait.
 */
export function fitViewportToScreen(win: Window = window): () => void {
  const meta = win.document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
  if (!meta) return () => {}

  const base = meta.content
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith('viewport-fit'))
    .join(', ')
  const portrait = win.matchMedia('(orientation: portrait)')

  const apply = () => {
    const content = portrait.matches ? `${base}, ${VIEWPORT_FIT_COVER}` : base
    if (meta.content !== content) meta.content = content
  }

  apply()
  portrait.addEventListener('change', apply)
  return () => portrait.removeEventListener('change', apply)
}
