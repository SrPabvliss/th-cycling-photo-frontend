const pending = new Map<string, Promise<void>>()

function track(key: string, promise: Promise<void>): Promise<void> {
  pending.set(key, promise)
  promise.catch(() => pending.delete(key))
  return promise
}

export function loadExternalScript(src: string, options?: { type?: string }): Promise<void> {
  const cached = pending.get(src)
  if (cached) return cached

  const promise = new Promise<void>((resolve, reject) => {
    const element = document.createElement('script')
    element.src = src
    element.async = true
    if (options?.type) element.type = options.type
    element.addEventListener('load', () => resolve())
    element.addEventListener('error', () => reject(new Error(`Failed to load script ${src}`)))
    document.head.appendChild(element)
  })

  return track(src, promise)
}

export function loadExternalStylesheet(href: string): Promise<void> {
  const cached = pending.get(href)
  if (cached) return cached

  const promise = new Promise<void>((resolve, reject) => {
    const element = document.createElement('link')
    element.rel = 'stylesheet'
    element.href = href
    element.addEventListener('load', () => resolve())
    element.addEventListener('error', () => reject(new Error(`Failed to load stylesheet ${href}`)))
    document.head.appendChild(element)
  })

  return track(href, promise)
}
