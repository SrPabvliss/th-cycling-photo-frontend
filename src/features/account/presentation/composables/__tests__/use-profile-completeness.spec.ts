import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import type { ICurrentUser } from '@/core/auth/current-user'
import type { IMyProfile } from '@/features/account/types/responses/my-profile.response'
import type { PayoutMethodResponse } from '@/features/tenant-profile/types/responses/payout-method.response'
import type { TenantProfileResponse } from '@/features/tenant-profile/types/responses/tenant-profile.response'
import { useProfileCompleteness } from '../use-profile-completeness'

const bankMethod = {
  id: '22222222-2222-4222-8222-222222222222',
  provider: 'bank_transfer',
  isActive: true,
  status: 'verified',
} as PayoutMethodResponse

function setup(
  tenantProfile: Partial<TenantProfileResponse>,
  payoutMethods: PayoutMethodResponse[] | undefined,
) {
  return useProfileCompleteness({
    currentUser: ref({ emailVerified: true } as ICurrentUser),
    myProfile: ref({ birthDate: '1990-01-01' } as unknown as IMyProfile),
    tenantProfile: ref({
      publicName: 'Andes Bike Media',
      whatsappNumber: '+593998124477',
      watermarkUrl: null,
      ...tenantProfile,
    } as TenantProfileResponse),
    payoutMethods: ref(payoutMethods),
    isOperator: ref(true),
  })
}

describe('useProfileCompleteness', () => {
  it('treats a business with name, WhatsApp and only a bank account as complete', () => {
    const { businessPending } = setup({}, [bankMethod])

    expect(businessPending.value).toEqual([])
  })

  it('asks for a payout method only when none is active', () => {
    const { businessPending } = setup({}, [{ ...bankMethod, isActive: false }])

    expect(businessPending.value.map((item) => item.label)).toEqual(['Método de cobro'])
  })

  it('still asks for the public name and the WhatsApp number', () => {
    const { businessPending } = setup({ publicName: null, whatsappNumber: null }, [bankMethod])

    expect(businessPending.value.map((item) => item.label)).toEqual([
      'Nombre público',
      'WhatsApp comercial',
    ])
  })

  it('does not flag a missing payout method while the methods are still loading', () => {
    const { businessPending } = setup({}, undefined)

    expect(businessPending.value).toEqual([])
  })
})
