import {
  CONTACT_MESSAGES,
  CONTACT_WHATSAPP,
  type CommercialTopic,
} from '@/shared/constants/commercial'
import { buildWhatsAppUrl } from '@/shared/utils/whatsapp.utils'

// Lives with the commercial pages, not with the shared contact data: building the link brings the
// phone number library, and the footer and the season bar read that data on every screen.
export function contactWhatsAppHref(topic: CommercialTopic): string {
  return buildWhatsAppUrl(CONTACT_WHATSAPP, CONTACT_MESSAGES[topic].body)
}
