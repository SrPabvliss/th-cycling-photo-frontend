import { describe, expect, it } from 'vitest'

import {
  COMMERCIAL_PAGE_PATHS,
  CONTACT_EMAIL,
  CONTACT_MESSAGES,
  CONTACT_WHATSAPP,
  contactMailHref,
} from './commercial'

describe('commercial contact', () => {
  it('writes to Titan on WhatsApp and by email', () => {
    expect(CONTACT_WHATSAPP).toBe('593999247774')
    expect(CONTACT_EMAIL).toBe('info@titantv.com.ec')
  })

  it('leads brands to /anunciate and organizers to /organizadores', () => {
    expect(COMMERCIAL_PAGE_PATHS).toEqual({ marca: '/anunciate', organizador: '/organizadores' })
  })

  it('has the brand message of the prototype', () => {
    expect(CONTACT_MESSAGES.marca).toEqual({
      subject: 'Publicidad en Titan TV',
      body: 'Hola, Titan TV. Quiero anunciar mi marca en la plataforma.\n\nMarca: \nQué vendemos: \nMe interesa saber qué espacios hay y cuánto cuestan.',
    })
  })

  it('has the organizer message of the prototype', () => {
    expect(CONTACT_MESSAGES.organizador).toEqual({
      subject: 'Quiero publicar mi evento en Titan TV',
      body: 'Hola, Titan TV. Organizo un evento y quiero publicar y vender sus fotos en la plataforma.\n\nEvento: \nFecha: \nCiudad: \nCorredores esperados: ',
    })
  })

  it.each(['marca', 'organizador'] as const)(
    'opens the %s email with its subject and body, to one address and no copies',
    (topic) => {
      const href = contactMailHref(topic)
      const { subject, body } = CONTACT_MESSAGES[topic]

      expect(href).toBe(
        `mailto:info@titantv.com.ec?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      )
      expect(href).not.toMatch(/[?&](cc|bcc)=/i)
    },
  )
})
