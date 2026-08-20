import { describe, expect, it } from 'vitest'
import { toMyProfile } from './my-profile.mapper'
import type { IApiMyProfile } from '../types/responses/my-profile.response'

describe('my-profile.mapper', () => {
  const API_PROFILE: IApiMyProfile = {
    id: 'u-1',
    email: 'pablo@example.com',
    firstName: 'Pablo',
    lastName: 'Villacres',
    avatarUrl: 'https://cdn/avatar.jpg',
    countryId: 63,
    provinceId: 4,
    cantonId: 12,
    birthDate: '1998-05-13',
    gender: 'male',
    phones: [
      {
        id: 'ph-1',
        phoneNumber: '+593999999999',
        label: 'Personal',
        isWhatsapp: true,
        isPrimary: true,
      },
    ],
  }

  describe('toMyProfile', () => {
    it('maps camelCase fields and nested phones', () => {
      const result = toMyProfile(API_PROFILE)
      expect(result.firstName).toBe('Pablo')
      expect(result.countryId).toBe(63)
      expect(result.phones[0]!.isWhatsapp).toBe(true)
    })

    it('keeps nulls as nulls', () => {
      expect(toMyProfile({ ...API_PROFILE, birthDate: null }).birthDate).toBeNull()
    })
  })
})
