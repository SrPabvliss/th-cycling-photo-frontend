import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'

import type { IPublicEventFilterOptions } from '@/shared/public-events'
import type { IMonthRange } from '../../../composables/use-event-list-filters'
import EventFilterBar from './EventFilterBar.vue'

const OPTIONS: IPublicEventFilterOptions = {
  eventTypes: [
    { id: 1, name: 'Downhill', count: 30 },
    { id: 2, name: 'Enduro', count: 12 },
    { id: 4, name: 'XCO', count: 0 },
  ],
  provinces: [
    { id: 3, name: 'Cañar', count: 2, hasEvents: true },
    { id: 6, name: 'Cotopaxi', count: 8, hasEvents: true },
    { id: 8, name: 'Esmeraldas', count: 0, hasEvents: false },
    { id: 9, name: 'Santo Domingo de los Tsáchilas', count: 1, hasEvents: true },
    { id: 17, name: 'Pichincha', count: 9, hasEvents: true },
  ],
  months: [
    { month: '2025-11', count: 2 },
    { month: '2026-06', count: 4 },
    { month: '2026-07', count: 0 },
    { month: '2026-08', count: 5 },
  ],
}

const mounted: VueWrapper[] = []

function mountBar(
  initial: { types?: number[]; provinces?: number[]; months?: IMonthRange | null } = {},
) {
  const types = ref(initial.types ?? [])
  const provinces = ref(initial.provinces ?? [])
  const months = ref<IMonthRange | null>(initial.months ?? null)
  const options = ref<IPublicEventFilterOptions | undefined>(OPTIONS)
  const total = ref<number | null>(42)
  const Host = defineComponent({
    setup() {
      return () =>
        h(EventFilterBar, {
          options: options.value,
          total: total.value,
          eventTypeIds: types.value,
          'onUpdate:eventTypeIds': (value: number[]) => (types.value = value),
          provinceIds: provinces.value,
          'onUpdate:provinceIds': (value: number[]) => (provinces.value = value),
          months: months.value,
          'onUpdate:months': (value: IMonthRange | null) => (months.value = value),
        })
    },
  })
  const wrapper = mount(Host, { attachTo: document.body })
  mounted.push(wrapper)
  return { wrapper, types, provinces, months, options, total }
}

type Bar = ReturnType<typeof mountBar>
const KEYS: Record<string, string> = {
  Disciplina: 'types',
  Provincia: 'provinces',
  Fecha: 'months',
}
const opener = (bar: Bar, name: string) => bar.wrapper.get(`[data-filter="${KEYS[name]}"]`)
const menu = () => document.querySelector<HTMLElement>('.filter-menu [role="dialog"]')
const rows = () =>
  Array.from(document.querySelectorAll<HTMLElement>('.filter-menu [role="checkbox"]')).filter(
    (each) => !each.classList.contains('filter-months__all'),
  )
const row = (name: string) => rows().find((each) => each.textContent?.includes(name))!
const inMenu = (text: string) =>
  Array.from(menu()?.querySelectorAll<HTMLElement>('button') ?? []).find(
    (button) => button.textContent?.replace(/\s+/g, ' ').trim() === text,
  )!
const labels = (bar: Bar) => bar.wrapper.findAll('.event-filter__open').map((each) => each.text())

async function openMenu(bar: Bar, name: string) {
  await opener(bar, name).trigger('click')
  await flushPromises()
}

async function typeInMenu(text: string) {
  const input = menu()!.querySelector('input')!
  input.value = text
  input.dispatchEvent(new Event('input'))
  await flushPromises()
}

describe('EventFilterBar', () => {
  afterEach(() => {
    mounted.splice(0).forEach((wrapper) => wrapper.unmount())
    document.documentElement.style.overflow = ''
  })

  it('has three equal buttons, in order, each opening a menu', () => {
    const bar = mountBar()

    expect(labels(bar)).toEqual(['Disciplina', 'Provincia', 'Fecha'])
    bar.wrapper.findAll('.event-filter__open').forEach((button) => {
      expect(button.attributes('aria-haspopup')).toBe('dialog')
      expect(button.attributes('aria-expanded')).toBe('false')
    })
    expect(menu()).toBeNull()
  })

  it('lists the disciplines with their counts and a search on top', async () => {
    const bar = mountBar()
    await openMenu(bar, 'Disciplina')

    expect(menu()!.getAttribute('aria-label')).toBe('Disciplina')
    expect(menu()!.querySelector('input')!.placeholder).toBe('Busca una disciplina')
    expect(rows().map((each) => each.textContent?.trim())).toEqual([
      'Downhill30',
      'Enduro12',
      'XCO0',
    ])
    expect(opener(bar, 'Disciplina').attributes('aria-expanded')).toBe('true')
  })

  it('applies a choice at once and keeps the very same menu: no new mount, no lost focus', async () => {
    const bar = mountBar()
    await openMenu(bar, 'Disciplina')
    const before = menu()
    const list = before!.querySelector('.filter-options__list')

    row('Enduro').focus()
    row('Enduro').click()
    await flushPromises()
    expect(bar.types.value).toEqual([2])
    expect(row('Enduro').getAttribute('aria-checked')).toBe('true')

    // New counts arrive for the new choice.
    bar.options.value = {
      ...OPTIONS,
      eventTypes: OPTIONS.eventTypes.map((each) => ({ ...each, count: each.count + 1 })),
    }
    await flushPromises()

    expect(menu()).toBe(before)
    expect(menu()!.querySelector('.filter-options__list')).toBe(list)
    expect(document.activeElement).toBe(row('Enduro'))
    expect(row('Enduro').textContent).toContain('13')
  })

  it('takes several choices and lets them go', async () => {
    const bar = mountBar()
    await openMenu(bar, 'Disciplina')

    row('Downhill').click()
    await flushPromises()
    row('Enduro').click()
    await flushPromises()
    expect(bar.types.value).toEqual([1, 2])

    row('Downhill').click()
    await flushPromises()
    expect(bar.types.value).toEqual([2])
  })

  it('keeps a choice that brings nothing, dimmed and not choosable, but lets it go if chosen', async () => {
    const bar = mountBar({ types: [4] })
    await openMenu(bar, 'Disciplina')

    expect(row('XCO').classList).toContain('filter-option--idle')
    row('XCO').click()
    await flushPromises()
    expect(bar.types.value).toEqual([])

    row('XCO').click()
    await flushPromises()
    expect(bar.types.value).toEqual([])
    expect(row('XCO').getAttribute('aria-disabled')).toBe('true')
  })

  it('offers only the provinces with races, in the order they came', async () => {
    const bar = mountBar()
    await openMenu(bar, 'Provincia')

    expect(rows().map((each) => each.querySelector('.filter-option__name')!.textContent)).toEqual([
      'Cañar',
      'Cotopaxi',
      'Santo Domingo de los Tsáchilas',
      'Pichincha',
    ])
  })

  it.each([
    ['canar', ['Cañar']],
    ['SANTO', ['Santo Domingo de los Tsáchilas']],
  ])('searches the menu without accents nor capitals (%s)', async (text, expected) => {
    const bar = mountBar()
    await openMenu(bar, 'Provincia')

    await typeInMenu(text)

    expect(rows().map((each) => each.querySelector('.filter-option__name')!.textContent)).toEqual(
      expected,
    )
  })

  it.each([
    ['Provincia', 'esmer', 'Todavía no hay carreras en Esmeraldas.'],
    ['Provincia', 'narnia', 'No encontramos esa provincia.'],
    ['Disciplina', 'bmx', 'No encontramos esa disciplina.'],
  ])('in %s, a search for "%s" says "%s"', async (name, text, expected) => {
    const bar = mountBar()
    await openMenu(bar, name)

    await typeInMenu(text)

    expect(menu()!.querySelector('.filter-options__miss')!.textContent).toBe(expected)
  })

  it('says what is chosen, with a cross that clears only that filter', async () => {
    const bar = mountBar({ provinces: [6, 3, 17], types: [1] })
    await flushPromises()

    expect(labels(bar)).toEqual(['Downhill', 'Cotopaxi +2', 'Fecha'])
    const pills = bar.wrapper.findAll('.event-filter')
    expect(pills[1]!.classes()).toContain('event-filter--on')
    expect(pills[2]!.classes()).not.toContain('event-filter--on')

    await bar.wrapper.get('[aria-label="Quitar provincia"]').trigger('click')

    expect(bar.provinces.value).toEqual([])
    expect(bar.types.value).toEqual([1])
  })

  it('has "Limpiar" at the end only while something is chosen, and it clears the three', async () => {
    const bar = mountBar()
    expect(bar.wrapper.find('.event-filters__clear-all').exists()).toBe(false)

    bar.types.value = [1]
    bar.months.value = { from: '2026-08', to: '2026-08' }
    await flushPromises()
    expect(bar.wrapper.get('.event-filters__clear-all').text()).toBe('Limpiar')
    await bar.wrapper.get('.event-filters__clear-all').trigger('click')

    expect(bar.types.value).toEqual([])
    expect(bar.months.value).toBeNull()
  })

  it('keeps its own name, with how many are chosen, until the names arrive', async () => {
    const bar = mountBar({ provinces: [6, 3] })
    bar.options.value = undefined
    await flushPromises()

    expect(labels(bar)[1]).toBe('Provincia2')
    expect(bar.wrapper.findAll('.event-filter')[1]!.classes()).toContain('event-filter--on')
  })

  it('"Borrar" clears only the open filter and is off while it has nothing', async () => {
    const bar = mountBar({ types: [1] })
    await openMenu(bar, 'Provincia')
    expect(inMenu('Borrar').hasAttribute('disabled')).toBe(true)
    inMenu('Ver 42 eventos').click()
    await flushPromises()

    await openMenu(bar, 'Disciplina')
    inMenu('Borrar').click()
    await flushPromises()

    expect(bar.types.value).toEqual([])
    expect(menu()).not.toBeNull()
  })

  it('on a phone, the main button says how many events there are, and only closes', async () => {
    const bar = mountBar({ types: [1] })
    await openMenu(bar, 'Disciplina')
    expect(inMenu('Ver 42 eventos')).toBeDefined()

    bar.total.value = 1
    await flushPromises()
    inMenu('Ver 1 evento').click()
    await flushPromises()

    expect(menu()).toBeNull()
    expect(bar.types.value).toEqual([1])
  })

  it('closes on Escape and gives the focus back to its button', async () => {
    const bar = mountBar()
    ;(opener(bar, 'Provincia').element as HTMLElement).focus()
    await openMenu(bar, 'Provincia')

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await flushPromises()

    expect(menu()).toBeNull()
    expect(document.activeElement).toBe(opener(bar, 'Provincia').element)
  })

  it('closes on a tap outside, and on back or forward', async () => {
    const bar = mountBar()
    await openMenu(bar, 'Disciplina')
    document.querySelector<HTMLElement>('.filter-menu__scrim')!.click()
    await flushPromises()
    expect(menu()).toBeNull()

    await openMenu(bar, 'Disciplina')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await flushPromises()
    expect(menu()).toBeNull()
  })

  describe('the focus, when the control that had it goes away or turns off', () => {
    const focused = () => document.activeElement as HTMLElement | null

    it('goes from the cross to the button of the same filter', async () => {
      const bar = mountBar({ types: [1] })
      const cross = bar.wrapper.get('[aria-label="Quitar disciplina"]')
      ;(cross.element as HTMLElement).focus()

      await cross.trigger('click')
      await flushPromises()

      expect(focused()).toBe(opener(bar, 'Disciplina').element)
    })

    it('goes from "Limpiar" to the first filter button', async () => {
      const bar = mountBar({ types: [1] })
      const clearAll = bar.wrapper.get('.event-filters__clear-all')
      ;(clearAll.element as HTMLElement).focus()

      await clearAll.trigger('click')
      await flushPromises()

      expect(focused()).toBe(opener(bar, 'Disciplina').element)
    })

    it('goes from "Borrar" to the main button of the menu', async () => {
      const bar = mountBar({ types: [1] })
      await openMenu(bar, 'Disciplina')
      const clear = inMenu('Borrar')
      clear.focus()

      clear.click()
      await flushPromises()

      expect(focused()?.textContent?.trim()).toMatch(/^Ver \d+ eventos?$/)
    })

    it('goes from the year arrow that turns off to the other one', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Fecha')
      const previous = menu()!.querySelector<HTMLButtonElement>('[aria-label="Año anterior"]')!
      previous.focus()

      previous.click()
      await flushPromises()

      expect(focused()?.getAttribute('aria-label')).toBe('Año siguiente')
    })
  })

  it('keeps room for two lines of the date hint, so the menu does not shrink on choosing', () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        'src/features/public-gallery/presentation/components/EventFilterBar/MonthsPanel.vue',
      ),
      'utf8',
    )
    expect(css).toMatch(
      /\.filter-months__hint \{[^}]*min-block-size: calc\(var\(--tt-type-caption-line\) \* 2\)/,
    )
  })

  // On desktop the scrim lets clicks through: another filter button opens with one click, and a
  // click anywhere else closes the menu.
  it('lets a click outside through on desktop, and closes on it', async () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        'src/features/public-gallery/presentation/components/EventFilterBar/FilterMenu.vue',
      ),
      'utf8',
    )
    const desktop = css.slice(css.indexOf('@media (min-width: 768px)'))
    expect(desktop).toMatch(/\.filter-menu \{[^}]*pointer-events: none/)
    expect(desktop).toMatch(/\.filter-menu__panel \{[^}]*pointer-events: auto/)

    const bar = mountBar()
    await openMenu(bar, 'Disciplina')
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()

    expect(menu()).toBeNull()
  })

  // On a phone the buttons slide sideways; "Limpiar" stays out of that, always in view.
  it('keeps "Limpiar" out of the row that slides', async () => {
    const bar = mountBar({ types: [1] })
    await flushPromises()

    expect(bar.wrapper.find('.event-filters__scroll .event-filters__clear-all').exists()).toBe(
      false,
    )
    expect(bar.wrapper.find('.event-filters > .event-filters__clear-all').exists()).toBe(true)
    expect(bar.wrapper.findAll('.event-filters__scroll .event-filter')).toHaveLength(3)
  })

  // A dialog with a list of checkboxes: the search inside is allowed, and the arrows move.
  describe('the keyboard inside a menu', () => {
    const press = (key: string) =>
      document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    const focusedName = () => (document.activeElement as HTMLElement).textContent?.trim()

    it('is a named dialog with checkboxes', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Disciplina')

      expect(menu()!.getAttribute('aria-label')).toBe('Disciplina')
      expect(rows().every((each) => each.getAttribute('aria-checked') !== null)).toBe(true)
    })

    it('goes down from the search to the options and between them with the arrows', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Disciplina')
      menu()!.querySelector('input')!.focus()

      press('ArrowDown')
      expect(focusedName()).toContain('Downhill')
      press('ArrowDown')
      expect(focusedName()).toContain('Enduro')
      press('ArrowUp')
      expect(focusedName()).toContain('Downhill')
      press('ArrowUp')
      expect(document.activeElement).toBe(menu()!.querySelector('input'))
    })

    it('moves between months with the arrows, skipping the ones without events', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Fecha')
      const june = rows().find((each) => each.textContent?.trim().startsWith('Jun'))!
      june.focus()

      press('ArrowRight')
      expect(focusedName()).toMatch(/^Ago/)
      press('ArrowLeft')
      expect(focusedName()).toMatch(/^Jun/)
    })
  })

  describe('Fecha', () => {
    const month = (name: string) =>
      rows().find((each) => each.textContent?.trim().startsWith(name))!
    const hint = () => menu()!.querySelector('.filter-months__hint')!.textContent

    it('opens on the newest year with its twelve months, those without events off', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Fecha')

      expect(menu()!.querySelector('.filter-months__year-number')!.textContent).toBe('2026')
      expect(month('Ago').textContent).toContain('5')
      expect(month('Jul').hasAttribute('disabled')).toBe(true)
      expect(month('Ene').hasAttribute('disabled')).toBe(true)
      expect(hint()).toBe('Toca un mes. Con un segundo toque eliges un rango.')
    })

    it('chooses a month, then a range with a second tap, and lets the only month go', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Fecha')
      const before = menu()

      month('Ago').click()
      await flushPromises()
      expect(bar.months.value).toEqual({ from: '2026-08', to: '2026-08' })
      expect(hint()).toBe('Toca otro mes para elegir un rango.')
      expect(labels(bar)[2]).toBe('Ago 2026')

      month('Jun').click()
      await flushPromises()
      expect(bar.months.value).toEqual({ from: '2026-06', to: '2026-08' })
      expect(labels(bar)[2]).toBe('Jun – Ago 2026')
      expect(month('Jul').getAttribute('aria-checked')).toBe('true')

      month('Jun').click()
      await flushPromises()
      month('Jun').click()
      await flushPromises()
      expect(bar.months.value).toBeNull()
      expect(menu()).toBe(before)
    })

    it('takes the whole year with "Todo 2026"', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Fecha')

      inMenu('Todo 2026 9').click()
      await flushPromises()

      expect(bar.months.value).toEqual({ from: '2026-01', to: '2026-12' })
    })

    it('moves between the years that have events, in the same menu', async () => {
      const bar = mountBar()
      await openMenu(bar, 'Fecha')
      const before = menu()
      const previous = menu()!.querySelector<HTMLButtonElement>('[aria-label="Año anterior"]')!
      const next = menu()!.querySelector<HTMLButtonElement>('[aria-label="Año siguiente"]')!
      expect(next.disabled).toBe(true)

      previous.click()
      await flushPromises()

      expect(menu()!.querySelector('.filter-months__year-number')!.textContent).toBe('2025')
      expect(month('Nov').textContent).toContain('2')
      expect(previous.disabled).toBe(true)
      expect(menu()).toBe(before)
    })

    it('skips the years without events', async () => {
      const bar = mountBar()
      bar.options.value = {
        ...OPTIONS,
        months: [{ month: '1970-01', count: 1 }, ...OPTIONS.months],
      }
      await openMenu(bar, 'Fecha')
      const previous = menu()!.querySelector<HTMLButtonElement>('[aria-label="Año anterior"]')!

      previous.click()
      await flushPromises()
      expect(menu()!.querySelector('.filter-months__year-number')!.textContent).toBe('2025')

      previous.click()
      await flushPromises()
      expect(menu()!.querySelector('.filter-months__year-number')!.textContent).toBe('1970')
      expect(previous.disabled).toBe(true)
    })
  })
})
