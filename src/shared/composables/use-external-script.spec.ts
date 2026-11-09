import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadExternalScript, loadExternalStylesheet } from './use-external-script'

afterEach(() => {
  document.head.innerHTML = ''
  vi.restoreAllMocks()
})

function resolveLastTag(selector: string) {
  const el = document.head.querySelector(selector) as HTMLElement
  el.dispatchEvent(new Event('load'))
}

describe('loadExternalScript', () => {
  it('appends a script tag with the given source', async () => {
    const promise = loadExternalScript('https://cdn.example.com/a.js')
    resolveLastTag('script[src="https://cdn.example.com/a.js"]')

    await expect(promise).resolves.toBeUndefined()
    expect(document.head.querySelectorAll('script')).toHaveLength(1)
  })

  it('honours the module type', async () => {
    const promise = loadExternalScript('https://cdn.example.com/b.js', { type: 'module' })
    resolveLastTag('script[src="https://cdn.example.com/b.js"]')
    await promise

    expect(document.head.querySelector('script')?.getAttribute('type')).toBe('module')
  })

  it('does not append the same script twice', async () => {
    const first = loadExternalScript('https://cdn.example.com/c.js')
    resolveLastTag('script[src="https://cdn.example.com/c.js"]')
    await first

    await loadExternalScript('https://cdn.example.com/c.js')

    expect(document.head.querySelectorAll('script')).toHaveLength(1)
  })

  it('rejects when the script fails to load', async () => {
    const promise = loadExternalScript('https://cdn.example.com/bad.js')
    const el = document.head.querySelector('script[src="https://cdn.example.com/bad.js"]')!
    el.dispatchEvent(new Event('error'))

    await expect(promise).rejects.toThrow(/bad\.js/)
  })

  it('allows a retry after a failure', async () => {
    const failing = loadExternalScript('https://cdn.example.com/retry.js')
    document.head
      .querySelector('script[src="https://cdn.example.com/retry.js"]')!
      .dispatchEvent(new Event('error'))
    await expect(failing).rejects.toThrow()

    const retry = loadExternalScript('https://cdn.example.com/retry.js')
    resolveLastTag('script[src="https://cdn.example.com/retry.js"]:last-of-type')

    await expect(retry).resolves.toBeUndefined()
  })
})

describe('loadExternalStylesheet', () => {
  it('appends a stylesheet link', async () => {
    const promise = loadExternalStylesheet('https://cdn.example.com/a.css')
    resolveLastTag('link[href="https://cdn.example.com/a.css"]')
    await promise

    expect(document.head.querySelector('link')?.getAttribute('rel')).toBe('stylesheet')
  })
})
