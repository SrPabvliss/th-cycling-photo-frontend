import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { IBibAttribute } from '@/features/photos/types/responses/photo-detail.response'
import { formatDate } from '@/shared/utils/date.utils'
import PhotoBibPanel from './PhotoBibPanel.vue'

const buildBib = (overrides: Partial<IBibAttribute> = {}): IBibAttribute => ({
  id: 'b1',
  digits: '141',
  status: 'read',
  confidence: 0.93,
  source: 'ai',
  cropUrl: 'https://signed/crop.jpg',
  digitsOriginal: '141',
  wasCorrected: false,
  correctedAt: null,
  correctedByName: null,
  ...overrides,
})

describe('PhotoBibPanel', () => {
  it('shows the red no-bib state when nothing was read', () => {
    const wrapper = mount(PhotoBibPanel, { props: { bibs: [], frozen: false } })
    expect(wrapper.find('.pd-card').classes()).toContain('red')
    expect(wrapper.find('.pd-nobib-b').text()).toBe('Sin dorsal')
    expect(wrapper.find('.pd-nobib p').text()).toBe(
      'Nadie llega a esta foto. El comprador la busca escribiendo su número y esta foto no tiene ninguno: está en la galería, pero fuera de todas las búsquedas.',
    )
    expect(wrapper.find('[data-test="bib-primary-btn"]').text()).toContain(
      'Escribir el dorsal a mano',
    )
  })

  it('does not show the no-bib state when the photo has a bib', () => {
    const wrapper = mount(PhotoBibPanel, { props: { bibs: [buildBib()], frozen: false } })
    expect(wrapper.find('.pd-card').classes()).not.toContain('red')
    expect(wrapper.find('.pd-nobib').exists()).toBe(false)
  })

  it('renders one row per bib with its crop image', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({ id: 'b1', digits: '141', cropUrl: 'https://signed/crop-141.jpg' }),
          buildBib({ id: 'b2', digits: '7', cropUrl: 'https://signed/crop-7.jpg' }),
        ],
        frozen: false,
      },
    })
    const rows = wrapper.findAll('.pd-bib')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.find('img').attributes('src')).toBe('https://signed/crop-141.jpg')
    expect(rows[1]!.find('img').attributes('src')).toBe('https://signed/crop-7.jpg')
  })

  it('does not break when a bib has no crop image', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: { bibs: [buildBib({ cropUrl: null })], frozen: false },
    })
    expect(wrapper.find('.pd-bib').exists()).toBe(true)
    expect(wrapper.find('.pd-bib img').exists()).toBe(false)
  })

  it('shows the original struck through beside the corrected number', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            digits: '141',
            digitsOriginal: '249',
            wasCorrected: true,
            confidence: 0.72,
            correctedByName: 'Ana',
            correctedAt: new Date('2026-08-20'),
          }),
        ],
        frozen: false,
      },
    })
    const numberEl = wrapper.find('.pd-bib-n')
    expect(numberEl.find('s').text()).toBe('249')
    expect(numberEl.find('b').text()).toBe('141')
  })

  it('names the person and the moment for a corrected bib', () => {
    const correctedAt = new Date('2026-08-20')
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            digits: '141',
            digitsOriginal: '249',
            wasCorrected: true,
            confidence: 0.72,
            correctedByName: 'Ana',
            correctedAt,
          }),
        ],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib-t em').text()).toBe(
      `La IA leyó 249 · 72% · lo corrigió Ana el ${formatDate(correctedAt)}`,
    )
  })

  it('marks a doubtful reading amber and asks for a review', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ status: 'abstained', source: 'ai', wasCorrected: false })],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib').classes()).toContain('dud')
    expect(wrapper.find('.pd-mini.amber').text()).toBe('Revisar')
    expect(wrapper.find('.pd-note').text()).toBe(
      'La IA leyó algo pero no se fía. Compara el recorte con el número: si no coinciden, corrígelo.',
    )
  })

  it('does not mark an ordinary confident reading as doubtful', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ status: 'read', source: 'ai', wasCorrected: false })],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib').classes()).not.toContain('dud')
    expect(wrapper.find('.pd-mini.amber').exists()).toBe(false)
    expect(wrapper.find('.pd-note').exists()).toBe(false)
  })

  it('stops treating a doubtful reading as doubtful once a person corrected it', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            status: 'abstained',
            source: 'ai',
            wasCorrected: true,
            digitsOriginal: '249',
            digits: '141',
            confidence: 0.72,
            correctedByName: 'Ana',
            correctedAt: new Date('2026-08-20'),
          }),
        ],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib').classes()).not.toContain('dud')
    expect(wrapper.find('.pd-mini.amber').exists()).toBe(false)
  })

  it('marks a corrected ai-source bib with the ok tone and provenance', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            source: 'ai',
            status: 'read',
            wasCorrected: true,
            digitsOriginal: '249',
            digits: '141',
            confidence: 0.72,
            correctedByName: 'Ana',
            correctedAt: new Date('2026-08-20'),
          }),
        ],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib').classes()).toContain('ok')
    expect(wrapper.find('.pd-lect').text()).toContain('Corregido por una persona')
  })

  it('marks a bib a person typed directly (source reviewer, never corrected) with the ok tone', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ source: 'reviewer', wasCorrected: false, confidence: null })],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib').classes()).toContain('ok')
    expect(wrapper.find('.pd-lect').text()).toContain('Escrito por una persona')
  })

  it('never renders the literal word null when a corrected bib has no recorded corrector name', () => {
    const correctedAt = new Date('2026-08-20')
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            digits: '141',
            digitsOriginal: '249',
            wasCorrected: true,
            confidence: 0.72,
            correctedByName: null,
            correctedAt,
          }),
        ],
        frozen: false,
      },
    })
    const text = wrapper.find('.pd-bib-t em').text()
    expect(text).not.toContain('null')
    expect(text).toBe(`La IA leyó 249 · 72% · lo corrigió una persona el ${formatDate(correctedAt)}`)
  })

  it('never renders the literal word null when a reviewer-written bib has no recorded corrector name', () => {
    const correctedAt = new Date('2026-08-20')
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            source: 'reviewer',
            wasCorrected: false,
            confidence: null,
            correctedByName: null,
            correctedAt,
          }),
        ],
        frozen: false,
      },
    })
    const text = wrapper.find('.pd-bib-t em').text()
    expect(text).not.toContain('null')
    expect(text).toBe(`una persona · ${formatDate(correctedAt)}`)
  })

  it('shows the primary button enabled on an open event with no bibs', () => {
    const wrapper = mount(PhotoBibPanel, { props: { bibs: [], frozen: false } })
    const btn = wrapper.find('[data-test="bib-primary-btn"]')
    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.text()).toContain('Escribir el dorsal a mano')
    expect(btn.text()).not.toContain('Congelado · sin cambios')
    expect(wrapper.find('.pd-note').text()).toBe(
      'Se abre el taller de dorsales, a pantalla completa, con esta foto ya cargada.',
    )
    btn.trigger('click')
    expect(wrapper.emitted('open-workshop')).toHaveLength(1)
  })

  it('disables the primary button and relabels it on a frozen event with no bibs', () => {
    const wrapper = mount(PhotoBibPanel, { props: { bibs: [], frozen: true } })
    const btn = wrapper.find('[data-test="bib-primary-btn"]')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toContain('Congelado · sin cambios')
    expect(btn.text()).not.toContain('Escribir el dorsal a mano')
    expect(wrapper.find('.pd-note').exists()).toBe(false)
    btn.trigger('click')
    expect(wrapper.emitted('open-workshop')).toBeUndefined()
  })

  it('shows the footer button enabled on an open event with bibs', () => {
    const wrapper = mount(PhotoBibPanel, { props: { bibs: [buildBib()], frozen: false } })
    const btn = wrapper.find('[data-test="bib-footer-btn"]')
    expect(btn.attributes('disabled')).toBeUndefined()
    expect(btn.text()).toContain('Corregir en el taller de dorsales')
    expect(btn.text()).not.toContain('Congelado · sin cambios')
    btn.trigger('click')
    expect(wrapper.emitted('open-workshop')).toHaveLength(1)
  })

  it('disables the footer button and relabels it on a frozen event with bibs', () => {
    const wrapper = mount(PhotoBibPanel, { props: { bibs: [buildBib()], frozen: true } })
    const btn = wrapper.find('[data-test="bib-footer-btn"]')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toContain('Congelado · sin cambios')
    expect(btn.text()).not.toContain('Corregir en el taller de dorsales')
    btn.trigger('click')
    expect(wrapper.emitted('open-workshop')).toBeUndefined()
  })

  it('titles the card Dorsales · 2 when the photo has two bibs', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ id: 'b1', digits: '141' }), buildBib({ id: 'b2', digits: '7' })],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-card-h h4').text()).toBe('Dorsales · 2')
  })

  it('titles the card Dorsal (singular) when the photo has one bib', () => {
    const wrapper = mount(PhotoBibPanel, { props: { bibs: [buildBib()], frozen: false } })
    expect(wrapper.find('.pd-card-h h4').text()).toBe('Dorsal')
  })

  it('marks a person-corrected bib with a check icon, distinct from a raw AI reading', () => {
    const corrected = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ source: 'ai', status: 'abstained', wasCorrected: true })],
        frozen: false,
      },
    })
    expect(corrected.find('[data-test="bib-person-icon"]').exists()).toBe(true)

    const raw = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ source: 'ai', status: 'read', wasCorrected: false })],
        frozen: false,
      },
    })
    expect(raw.find('[data-test="bib-person-icon"]').exists()).toBe(false)
    expect(raw.find('[data-test="bib-doubtful-icon"]').exists()).toBe(false)
  })

  it('marks a doubtful AI reading with a warning icon, not the person check', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ source: 'ai', status: 'abstained', wasCorrected: false })],
        frozen: false,
      },
    })
    expect(wrapper.find('[data-test="bib-doubtful-icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="bib-person-icon"]').exists()).toBe(false)
  })

  it('does not treat a reviewer-typed abstained bib as doubtful', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({ source: 'reviewer', status: 'abstained', wasCorrected: false, confidence: null }),
        ],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-mini.amber').exists()).toBe(false)
    expect(wrapper.find('.pd-note').exists()).toBe(false)
    expect(wrapper.find('[data-test="bib-doubtful-icon"]').exists()).toBe(false)
  })

  it('drops the confidence segment when a corrected bib has no confidence', () => {
    const correctedAt = new Date('2026-08-20')
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            digits: '141',
            digitsOriginal: '249',
            wasCorrected: true,
            confidence: null,
            correctedByName: 'Ana',
            correctedAt,
          }),
        ],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib-t em').text()).toBe(
      `La IA leyó 249 · lo corrigió Ana el ${formatDate(correctedAt)}`,
    )
  })

  it('drops the trailing date when a corrected bib has no correction date', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({
            digits: '141',
            digitsOriginal: '249',
            wasCorrected: true,
            confidence: 0.72,
            correctedByName: 'Ana',
            correctedAt: null,
          }),
        ],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-bib-t em').text()).toBe('La IA leyó 249 · 72% · lo corrigió Ana')
  })

  it('pins the confident AI reading provenance string exactly', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [buildBib({ source: 'ai', status: 'read', wasCorrected: false, confidence: 0.93 })],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-lect').text()).toBe('Leído por la IA · 93%')
  })

  it('pins the doubtful reading provenance string exactly', () => {
    const wrapper = mount(PhotoBibPanel, {
      props: {
        bibs: [
          buildBib({ source: 'ai', status: 'abstained', wasCorrected: false, confidence: 0.72 }),
        ],
        frozen: false,
      },
    })
    expect(wrapper.find('.pd-lect').text()).toBe('Confianza 72%')
  })
})
