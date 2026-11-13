import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, nextTick, reactive } from 'vue'

import PriceSheet from './PriceSheet.vue'

interface ITier {
  minQty: number
  maxQty: number | null
  pricePerPhoto: number
}

const REAL_TIERS: ITier[] = [
  { minQty: 1, maxQty: 2, pricePerPhoto: 4 },
  { minQty: 3, maxQty: 6, pricePerPhoto: 3 },
  { minQty: 7, maxQty: 9, pricePerPhoto: 2.5 },
  { minQty: 10, maxQty: null, pricePerPhoto: 2 },
]

const query = reactive({
  tiers: REAL_TIERS as ITier[] | undefined,
  status: 'success' as 'pending' | 'error' | 'success',
  isFetching: false,
})
const refetch = vi.fn()

vi.mock('@/shared/pricing/use-pricing-tiers', () => ({
  usePricingTiersQuery: () => ({
    data: computed(() =>
      query.tiers ? { currency: 'USD', source: 'default', tiers: query.tiers } : undefined,
    ),
    status: computed(() => query.status),
    isFetching: computed(() => query.isFetching),
    refetch,
  }),
}))

function mountSheet(props: { open?: boolean; quantity?: number } = {}) {
  return mount(PriceSheet, {
    props: { open: true, quantity: 0, ...props },
    attachTo: document.body,
    global: { stubs: { teleport: true } },
  })
}

type Wrapper = ReturnType<typeof mountSheet>
const rows = (wrapper: Wrapper) => wrapper.findAll('.price-sheet__tier')
/** Text of each row, its columns joined by a space however the layout puts them. */
const lines = (wrapper: Wrapper, selector: string) =>
  wrapper.findAll(selector).map((row) =>
    Array.from(row.element.children, (cell) => (cell.textContent ?? '').replace(/\s+/g, ' ').trim())
      .join(' ')
      .replace(/· −/g, '· −'),
  )

describe('PriceSheet', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(query, { tiers: REAL_TIERS, status: 'success', isFetching: false })
    refetch.mockClear()
  })

  it('is not there while closed', () => {
    expect(mountSheet({ open: false }).find('[role="dialog"]').exists()).toBe(false)
  })

  it('is a modal dialog named by its title', () => {
    const dialog = mountSheet().get('[role="dialog"]')

    expect(dialog.attributes('aria-modal')).toBe('true')
    const title = document.getElementById(dialog.attributes('aria-labelledby')!)
    expect(title?.textContent).toBe('Mientras más fotos, menos pagas')
  })

  it('explains how the price works', () => {
    const text = mountSheet().text()

    expect(text).toContain(
      'El precio por foto depende de cuántas lleves de la misma carrera. Cuando pasas de nivel, bajan todas las fotos del pedido, no solo las nuevas.',
    )
    expect(text).toContain(
      'Se cuenta por carrera: las fotos de otro evento van en un pedido aparte, con su propio precio.',
    )
  })

  it('lists the tiers with their discount against the first one', () => {
    expect(lines(mountSheet(), '.price-sheet__tier')).toEqual([
      '1 a 2 fotos $4,00 c/u',
      '3 a 6 fotos −25% $3,00 c/u',
      '7 a 9 fotos −38% $2,50 c/u',
      '10 o más fotos Mejor precio · −50% $2,00 c/u',
    ])
  })

  it('points at the price of the quantity in the cart', () => {
    const wrapper = mountSheet({ quantity: 4 })

    const marked = rows(wrapper).filter((row) => row.text().includes('Tu precio ahora'))
    expect(marked).toHaveLength(1)
    expect(marked[0]!.text()).toContain('3 a 6 fotos')
    expect(marked[0]!.classes()).toContain('price-sheet__tier--current')
  })

  it('points at no price with nothing in the cart', () => {
    expect(mountSheet({ quantity: 0 }).text()).not.toContain('Tu precio ahora')
  })

  it('works an example out of the tiers', () => {
    const wrapper = mountSheet()

    expect(lines(wrapper, '.price-sheet__example-row')).toEqual([
      '2 fotos $8,00',
      '3 fotos $9,00',
      '7 fotos $17,50',
      '10 fotos $20,00',
    ])
    expect(wrapper.text()).toContain('La tercera foto te cuesta $1,00 más que llevar dos.')
  })

  it('leaves the "third photo" sentence out when the second tier does not start at three', () => {
    query.tiers = [
      { minQty: 1, maxQty: 4, pricePerPhoto: 5 },
      { minQty: 5, maxQty: null, pricePerPhoto: 4 },
    ]
    const wrapper = mountSheet()

    expect(lines(wrapper, '.price-sheet__example-row')).toEqual([
      '4 fotos $20,00',
      '5 fotos $20,00',
    ])
    expect(wrapper.text()).not.toContain('La tercera foto')
  })

  it('has no example and no discounts with a single tier', () => {
    query.tiers = [{ minQty: 1, maxQty: null, pricePerPhoto: 4 }]
    const wrapper = mountSheet()

    expect(lines(wrapper, '.price-sheet__tier')).toEqual(['1 o más fotos $4,00 c/u'])
    expect(wrapper.find('.price-sheet__example').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('%')
  })

  it('asks to close from the understood button and from the close button', async () => {
    const wrapper = mountSheet()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Entendido')!
      .trigger('click')
    await wrapper.get('button[aria-label="Cerrar"]').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('asks to close on Escape and when tapping outside', async () => {
    const wrapper = mountSheet()
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.get('.price-sheet__scrim').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(2)
  })

  it('says the prices could not load and offers to retry, with no invented price', async () => {
    Object.assign(query, { tiers: undefined, status: 'error' })
    const wrapper = mountSheet()

    expect(wrapper.text()).toContain('No pudimos cargar los precios')
    expect(wrapper.text()).not.toContain('$')
    expect(rows(wrapper)).toHaveLength(0)

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Reintentar')!
      .trigger('click')
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
