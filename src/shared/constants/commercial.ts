import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { buildWhatsAppUrl } from '@/shared/utils/whatsapp.utils'

// Titan's commercial contact, in one place: the pages for brands and organizers, their house ads
// and the footer all read it from here.

/** Who a commercial page talks to: a brand that wants a space, or an event organizer. */
export type CommercialTopic = 'marca' | 'organizador'

/** The page for each: a house ad leads to the one its message speaks to. */
export const COMMERCIAL_PAGE_PATHS: Record<CommercialTopic, string> = {
  marca: ROUTE_PATHS.BRANDS_PAGE,
  organizador: ROUTE_PATHS.ORGANIZERS_PAGE,
}

/** Titan's WhatsApp, the number every commercial page writes to. */
export const CONTACT_WHATSAPP = '593999247774'
/** Titan's mailbox. Whoever else must read it gets it by forwarding there, never as a copy. */
export const CONTACT_EMAIL = 'info@titantv.com.ec'

/** The message each page leaves written: WhatsApp takes the body, the email both. */
export const CONTACT_MESSAGES: Record<CommercialTopic, { subject: string; body: string }> = {
  marca: {
    subject: 'Publicidad en Titan TV',
    body: 'Hola, Titan TV. Quiero anunciar mi marca en la plataforma.\n\nMarca: \nQué vendemos: \nMe interesa saber qué espacios hay y cuánto cuestan.',
  },
  organizador: {
    subject: 'Quiero publicar mi evento en Titan TV',
    body: 'Hola, Titan TV. Organizo un evento y quiero publicar y vender sus fotos en la plataforma.\n\nEvento: \nFecha: \nCiudad: \nCorredores esperados: ',
  },
}

export function contactWhatsAppHref(topic: CommercialTopic): string {
  return buildWhatsAppUrl(CONTACT_WHATSAPP, CONTACT_MESSAGES[topic].body)
}

export function contactMailHref(topic: CommercialTopic): string {
  const { subject, body } = CONTACT_MESSAGES[topic]
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
