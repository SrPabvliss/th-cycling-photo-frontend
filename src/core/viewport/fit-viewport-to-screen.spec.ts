import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { fitViewportToScreen } from './fit-viewport-to-screen'

const TAG = 'width=device-width, initial-scale=1.0, viewport-fit=cover'

function screen(portrait: boolean) {
  const listeners = new Set<() => void>()
  const query = {
    matches: portrait,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }
  vi.stubGlobal(
    'matchMedia',
    vi.fn((media: string) => {
      expect(media).toBe('(orientation: portrait)')
      return query as unknown as MediaQueryList
    }),
  )
  return {
    turn(toPortrait: boolean) {
      query.matches = toPortrait
      listeners.forEach((listener) => listener())
    },
    listeners,
  }
}

function viewportTag(content = TAG) {
  const meta = document.createElement('meta')
  meta.name = 'viewport'
  meta.content = content
  document.head.append(meta)
  return meta
}

afterEach(() => {
  document.head.innerHTML = ''
  vi.unstubAllGlobals()
})

describe('fitViewportToScreen', () => {
  it('ships the tag of a portrait screen in index.html, with nothing else changed', () => {
    const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
    expect(html).toContain(`<meta name="viewport" content="${TAG}" />`)
  })

  it('keeps cover while the screen is in portrait', () => {
    screen(true)
    const meta = viewportTag()
    fitViewportToScreen()
    expect(meta.content).toBe(TAG)
  })

  it('drops cover in landscape, leaving the rest of the tag as it was', () => {
    screen(false)
    const meta = viewportTag()
    fitViewportToScreen()
    expect(meta.content).toBe('width=device-width, initial-scale=1.0')
  })

  it('follows the screen when it turns, without repeating cover', () => {
    const device = screen(true)
    const meta = viewportTag()
    fitViewportToScreen()
    device.turn(false)
    expect(meta.content).toBe('width=device-width, initial-scale=1.0')
    device.turn(true)
    device.turn(true)
    expect(meta.content).toBe(TAG)
  })

  it('stops following the screen when asked', () => {
    const device = screen(true)
    viewportTag()
    const stop = fitViewportToScreen()
    stop()
    expect(device.listeners.size).toBe(0)
  })

  it('does nothing on a page without a viewport tag', () => {
    screen(true)
    expect(() => fitViewportToScreen()()).not.toThrow()
  })
})
