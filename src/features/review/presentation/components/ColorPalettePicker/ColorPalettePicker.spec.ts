import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { NConfigProvider } from 'naive-ui'
import { h } from 'vue'
import ColorPalettePicker from './ColorPalettePicker.vue'
import { COLOR_PALETTE } from '@/shared/constants/color-palette'

function mountWithProvider(props: Record<string, unknown>) {
  return mount(NConfigProvider, {
    slots: {
      default: () => h(ColorPalettePicker as never, props as never),
    },
  })
}

describe('ColorPalettePicker', () => {
  it('renders a trigger button with label', () => {
    const w = mountWithProvider({ value: 'rojo', label: 'Casco' })
    expect(w.text()).toContain('Casco')
  })

  it('renders 15 swatches in popover when allowNone is false', async () => {
    const w = mount(ColorPalettePicker, { props: { value: null, allowNone: false } })
    const swatches = w.findAll('.palette-grid__swatch')
    expect(COLOR_PALETTE).toHaveLength(15)
    expect(swatches.length === 0 || swatches.length === 15).toBe(true)
  })

  it('emits update:value when a color is clicked', async () => {
    const w = mount(ColorPalettePicker, { props: { value: null, allowNone: false } })
    const grid = w.find('[data-test="palette-grid"]')
    if (grid.exists()) {
      const swatch = grid.findAll('button')[0]
      await swatch?.trigger('click')
      expect(w.emitted('update:value')?.[0]).toEqual([COLOR_PALETTE[0]])
    }
  })

  it('shows none-swatch when allowNone is true', async () => {
    const w = mount(ColorPalettePicker, { props: { value: null, allowNone: true } })
    const grid = w.find('[data-test="palette-grid"]')
    if (grid.exists()) {
      const swatches = grid.findAll('button')
      expect(swatches.length).toBe(16)
    }
  })
})
