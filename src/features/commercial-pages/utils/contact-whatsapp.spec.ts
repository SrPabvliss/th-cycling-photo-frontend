import { describe, expect, it } from 'vitest'

import { CONTACT_MESSAGES } from '@/shared/constants/commercial'
import { contactWhatsAppHref } from './contact-whatsapp'

describe('contactWhatsAppHref', () => {
  it.each(['marca', 'organizador'] as const)(
    'opens the %s chat with its message already written',
    (topic) => {
      expect(contactWhatsAppHref(topic)).toBe(
        `https://api.whatsapp.com/send?phone=593999247774&text=${encodeURIComponent(CONTACT_MESSAGES[topic].body)}`,
      )
    },
  )
})
