import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { usePageMeta } from './use-page-meta'

const description = () =>
  document.head.querySelector('meta[name="description"]')?.getAttribute('content') ?? null

function mountWith(title: string, text: string) {
  return mount(
    defineComponent({
      setup() {
        usePageMeta({ title, description: text })
        return () => h('div')
      },
    }),
  )
}

describe('usePageMeta', () => {
  afterEach(() => {
    document.title = ''
    document.head.querySelector('meta[name="description"]')?.remove()
  })

  it('names the tab and describes the page while it is open', () => {
    document.title = 'Titan TV'
    mountWith('Anuncia tu marca · Titan TV', 'Para marcas.')

    expect(document.title).toBe('Anuncia tu marca · Titan TV')
    expect(description()).toBe('Para marcas.')
  })

  it('gives back the title and the description it found when the page closes', () => {
    document.title = 'Titan TV'
    const meta = document.createElement('meta')
    meta.name = 'description'
    meta.content = 'Antes.'
    document.head.append(meta)

    mountWith('Otra', 'Otra descripción.').unmount()

    expect(document.title).toBe('Titan TV')
    expect(description()).toBe('Antes.')
  })

  it('leaves no description behind when there was none', () => {
    mountWith('Otra', 'Otra descripción.').unmount()

    expect(description()).toBeNull()
  })
})
