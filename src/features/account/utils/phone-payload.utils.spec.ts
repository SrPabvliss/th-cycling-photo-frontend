import { describe, expect, it } from 'vitest'
import { buildLabelPayload, buildUpdatePhonePayload } from './phone-payload.utils'
import type { IUserPhone } from '../types/responses/user-phone.response'

describe('phone-payload.utils', () => {
  const PHONE: IUserPhone = {
    id: 'ph-1',
    phoneNumber: '+593999999999',
    label: 'Casa',
    isWhatsapp: true,
    isPrimary: true,
  }

  describe('buildLabelPayload', () => {
    it('sends null when the label is cleared', () => {
      expect(buildLabelPayload('', 'Casa')).toBeNull()
      expect(buildLabelPayload('   ', 'Casa')).toBeNull()
    })

    it('sends undefined when the label is unchanged', () => {
      expect(buildLabelPayload('Casa', 'Casa')).toBeUndefined()
    })

    it('sends undefined when an already-empty label stays empty', () => {
      expect(buildLabelPayload('', null)).toBeUndefined()
      expect(buildLabelPayload('   ', null)).toBeUndefined()
    })

    it('sends the trimmed new value when the label changes', () => {
      expect(buildLabelPayload('  Oficina  ', 'Casa')).toBe('Oficina')
      expect(buildLabelPayload('Personal', null)).toBe('Personal')
    })
  })

  describe('buildUpdatePhonePayload', () => {
    it('clears the label without touching the phone number', () => {
      const payload = buildUpdatePhonePayload(
        { label: '', phoneNumber: PHONE.phoneNumber, isValid: true },
        PHONE,
      )
      expect(payload).toEqual({ label: null })
    })

    it('sends only the changed phone number', () => {
      const payload = buildUpdatePhonePayload(
        { label: PHONE.label ?? '', phoneNumber: '+593888888888', isValid: true },
        PHONE,
      )
      expect(payload).toEqual({ phoneNumber: '+593888888888' })
    })

    it('returns an empty payload when nothing changed', () => {
      const payload = buildUpdatePhonePayload(
        { label: PHONE.label ?? '', phoneNumber: PHONE.phoneNumber, isValid: true },
        PHONE,
      )
      expect(payload).toEqual({})
    })

    it('sends both fields when both changed', () => {
      const payload = buildUpdatePhonePayload(
        { label: 'Oficina', phoneNumber: '+593888888888', isValid: true },
        PHONE,
      )
      expect(payload).toEqual({ label: 'Oficina', phoneNumber: '+593888888888' })
    })

    it('omits an invalid changed phone number', () => {
      const payload = buildUpdatePhonePayload(
        { label: PHONE.label ?? '', phoneNumber: '+593888888888', isValid: false },
        PHONE,
      )
      expect(payload).toEqual({})
    })

    it('still saves the label when the phone number is invalid', () => {
      const payload = buildUpdatePhonePayload(
        { label: 'Oficina', phoneNumber: '+593888888888', isValid: false },
        PHONE,
      )
      expect(payload).toEqual({ label: 'Oficina' })
    })

    it('keeps the phone number when it is unchanged, even if flagged invalid', () => {
      const payload = buildUpdatePhonePayload(
        { label: PHONE.label ?? '', phoneNumber: PHONE.phoneNumber, isValid: false },
        PHONE,
      )
      expect(payload).toEqual({})
    })

    it('sends isWhatsapp when it changed', () => {
      const payload = buildUpdatePhonePayload(
        {
          label: PHONE.label ?? '',
          phoneNumber: PHONE.phoneNumber,
          isValid: true,
          isWhatsapp: false,
        },
        PHONE,
      )
      expect(payload).toEqual({ isWhatsapp: false })
    })

    it('omits isWhatsapp when unchanged', () => {
      const payload = buildUpdatePhonePayload(
        {
          label: PHONE.label ?? '',
          phoneNumber: PHONE.phoneNumber,
          isValid: true,
          isWhatsapp: true,
        },
        PHONE,
      )
      expect(payload).toEqual({})
    })

    it('omits isWhatsapp when not provided by the caller', () => {
      const payload = buildUpdatePhonePayload(
        { label: PHONE.label ?? '', phoneNumber: PHONE.phoneNumber, isValid: true },
        PHONE,
      )
      expect(payload).toEqual({})
    })

    it('combines isWhatsapp with other changed fields', () => {
      const payload = buildUpdatePhonePayload(
        { label: 'Oficina', phoneNumber: '+593888888888', isValid: true, isWhatsapp: false },
        PHONE,
      )
      expect(payload).toEqual({
        label: 'Oficina',
        phoneNumber: '+593888888888',
        isWhatsapp: false,
      })
    })
  })
})
