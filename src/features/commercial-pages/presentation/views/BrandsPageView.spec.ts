import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { contactMailHref, contactWhatsAppHref } from '@/shared/constants/commercial'
import BrandsPageView from './BrandsPageView.vue'
import { contactLinks, textOf } from './commercial-page-testing'

const mountPage = () => mount(BrandsPageView, { attachTo: document.body })

describe('BrandsPageView', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.title = ''
  })

  it('opens with the hero of the prototype', () => {
    const wrapper = mountPage()

    expect(textOf(wrapper.find('h1'))).toBe('Donde el ciclista se busca, te encuentra a ti')
    expect(wrapper.text()).toContain('Publicidad en Titan TV')
    expect(wrapper.text()).toContain(
      'Después de cada carrera, los corredores entran a Titan TV a buscar sus fotos. No pasan de largo: revisan una por una. Pon tu marca en ese recorrido.',
    )
  })

  it('has the sections of the prototype, in its order', () => {
    const wrapper = mountPage()

    expect(wrapper.findAll('h2').map(textOf)).toEqual([
      'Cuatro lugares donde nadie te salta',
      'Un público que ya es el tuyo',
      'Tu marca al aire en tres pasos',
      'Que la próxima carrera te encuentre adentro',
    ])
    expect(wrapper.findAll('h3').map(textOf)).toEqual([
      'Lo primero que ven',
      'Entre sus fotos',
      'Cuando se encuentra',
      'Presentas la carrera',
      'Solo gente que pedalea',
      'Miran con calma',
      'Regresan en cada carrera',
      'Nos escribes',
      'Eliges dónde y cuánto tiempo',
      'Sales en la próxima carrera',
    ])
  })

  it('shows the four brand figures with their date', () => {
    const wrapper = mountPage()
    const figures = wrapper
      .findAll('[data-test="figure"]')
      .map((f) => `${f.find('dt').text()} ${f.find('dd').text()}`)

    expect(figures).toEqual([
      '14 carreras publicadas',
      '+18.000 fotos en galería',
      '+500 ciclistas registrados',
      '6 provincias del Ecuador',
    ])
    expect(wrapper.text()).toContain('Cifras de la plataforma a noviembre de 2026.')
  })

  it('writes on WhatsApp in a new tab and by email, with the brand message', () => {
    const links = contactLinks(mountPage())
    const whatsApp = { href: contactWhatsAppHref('marca'), target: '_blank', rel: 'noopener' }

    expect(links).toEqual([
      { text: 'Quiero mi espacio', ...whatsApp },
      {
        text: 'Escribir por correo',
        href: contactMailHref('marca'),
        target: undefined,
        rel: undefined,
      },
      { text: 'Escribir por WhatsApp', ...whatsApp },
      {
        text: 'info@titantv.com.ec',
        href: contactMailHref('marca'),
        target: undefined,
        rel: undefined,
      },
    ])
  })

  it('writes the email address out in the closing', () => {
    expect(mountPage().text()).toContain('O por correo: info@titantv.com.ec')
  })

  it('draws the phones as decoration only', () => {
    const wrapper = mountPage()
    const phones = wrapper.findAll('[data-test="phone"]')

    expect(phones.length).toBe(6)
    for (const phone of phones) expect(phone.element.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('uses the house illustrations for the audience', () => {
    const drawn = mountPage()
      .findAll('[data-illustration]')
      .map((each) => each.attributes('data-illustration'))

    expect(drawn).toEqual(['sinResultados', 'fotosListas', 'sinEventos'])
  })

  it('carries no house ad of its own', () => {
    expect(mountPage().find('.house-spot').exists()).toBe(false)
  })

  it('names the tab after the page', () => {
    mountPage()

    expect(document.title).toBe('Anuncia tu marca · Titan TV')
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Pon tu marca frente a los ciclistas que buscan sus fotos de carrera en Titan TV. Escríbenos por WhatsApp o por correo.',
    )
  })
})
