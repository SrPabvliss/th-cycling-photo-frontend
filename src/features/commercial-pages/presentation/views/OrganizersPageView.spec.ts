import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { contactMailHref, contactWhatsAppHref } from '@/shared/constants/commercial'
import OrganizersPageView from './OrganizersPageView.vue'
import { contactLinks, textOf } from './commercial-page-testing'

const mountPage = () => mount(OrganizersPageView, { attachTo: document.body })

describe('OrganizersPageView', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.title = ''
  })

  it('opens with the hero of the prototype', () => {
    const wrapper = mountPage()

    expect(textOf(wrapper.find('h1'))).toBe(
      'Tu carrera termina en la meta. Las fotos siguen vendiendo.',
    )
    expect(wrapper.text()).toContain('Para organizadores')
    expect(wrapper.text()).toContain(
      'Sube las fotos de tu evento a Titan TV. Cada corredor se busca por su número de placa, paga y descarga. Sin mandar fotos una por una.',
    )
  })

  it('has the sections of the prototype, in its order', () => {
    const wrapper = mountPage()

    expect(wrapper.findAll('h2').map(textOf)).toEqual([
      'De la meta al teléfono del corredor',
      'Todo resuelto, nada que armar',
      'Cuéntanos de tu carrera',
    ])
    expect(wrapper.findAll('h3').map(textOf)).toEqual([
      'Subes las fotos',
      'Titan lee las placas',
      'Cada quien se busca y compra',
      'Descarga sus originales',
    ])
  })

  it('lists the four steps in order, each with its phone', () => {
    const wrapper = mountPage()
    const steps = wrapper.findAll('ol > li')

    expect(steps.length).toBe(4)
    expect(textOf(steps[2]!)).toContain(
      'Escribe su placa, ve sus fotos y paga. Si lleva más, paga menos por foto.',
    )
    for (const step of steps) expect(step.find('[data-test="phone"]').exists()).toBe(true)
  })

  it('lists what is included', () => {
    const items = mountPage()
      .findAll('ul > li')
      .map((item) => textOf(item.find('b')))

    expect(items).toEqual([
      'Tu evento en vitrina',
      'Búsqueda por placa',
      'Fotos protegidas',
      'Más fotos, mejor precio',
      'Cobro por transferencia',
      'Entrega automática',
      'Pedidos a la vista',
      'Enlaces para compartir',
    ])
  })

  it('shows the four organizer figures with their date', () => {
    const wrapper = mountPage()

    expect(
      wrapper
        .findAll('[data-test="figure"]')
        .map((f) => `${f.find('dt').text()} ${f.find('dd').text()}`),
    ).toEqual([
      '14 carreras publicadas',
      '+18.000 fotos en galería',
      '+1.000 fotos vendidas y entregadas',
      '+500 ciclistas registrados',
    ])
    expect(wrapper.text()).toContain('Cifras de la plataforma a noviembre de 2026.')
  })

  it('writes on WhatsApp in a new tab and by email, with the organizer message', () => {
    const links = contactLinks(mountPage())
    const whatsApp = { href: contactWhatsAppHref('organizador'), target: '_blank', rel: 'noopener' }
    const mail = { href: contactMailHref('organizador'), target: undefined, rel: undefined }

    expect(links).toEqual([
      { text: 'Quiero publicar mi evento', ...whatsApp },
      { text: 'Escribir por correo', ...mail },
      { text: 'Escribir por WhatsApp', ...whatsApp },
      { text: 'info@titantv.com.ec', ...mail },
    ])
  })

  it('writes the email address out in the closing', () => {
    expect(mountPage().text()).toContain('O por correo: info@titantv.com.ec')
  })

  it('draws the phones as decoration only', () => {
    const phones = mountPage().findAll('[data-test="phone"]')

    expect(phones.length).toBe(6)
    for (const phone of phones) expect(phone.element.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('carries no house ad of its own', () => {
    expect(mountPage().find('.house-spot').exists()).toBe(false)
  })

  it('names the tab after the page', () => {
    mountPage()

    expect(document.title).toBe('Publica tu evento · Titan TV')
    expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Sube las fotos de tu carrera a Titan TV: cada corredor se busca por su placa, paga y descarga. Escríbenos por WhatsApp o por correo.',
    )
  })
})
