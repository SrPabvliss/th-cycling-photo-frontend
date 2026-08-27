import { computed, type Ref } from 'vue'

import type { ICurrentUser } from '@/core/auth/current-user'
import type { IMyProfile } from '@/features/account/types/responses/my-profile.response'
import type { TenantProfileResponse } from '@/features/tenant-profile/types/responses/tenant-profile.response'
import type { PayoutMethodResponse } from '@/features/tenant-profile/types/responses/payout-method.response'

export type ProfilePendingSection =
  | 'personal-info'
  | 'phones'
  | 'email'
  | 'brand'
  | 'contact'
  | 'payouts'

export interface IProfilePendingItem {
  label: string
  urgent: boolean
  group: 'account' | 'business'
  section: ProfilePendingSection
}

interface IUseProfileCompletenessArgs {
  currentUser: Ref<ICurrentUser | null | undefined>
  myProfile: Ref<IMyProfile | undefined>
  tenantProfile: Ref<TenantProfileResponse | undefined>
  payoutMethods: Ref<PayoutMethodResponse[] | undefined>
  isOperator: Ref<boolean>
}

export function useProfileCompleteness({
  currentUser,
  myProfile,
  tenantProfile,
  payoutMethods,
  isOperator,
}: IUseProfileCompletenessArgs) {
  const hasVerifiedPayphone = computed(() =>
    (payoutMethods.value ?? []).some(
      (method) => method.provider === 'payphone' && method.status === 'verified',
    ),
  )

  const pendingItems = computed<IProfilePendingItem[]>(() => {
    const items: IProfilePendingItem[] = []

    if (currentUser.value && !currentUser.value.emailVerified) {
      items.push({ label: 'Verifica tu correo', urgent: true, group: 'account', section: 'email' })
    }

    if (myProfile.value && !myProfile.value.birthDate) {
      items.push({
        label: 'Fecha de nacimiento',
        urgent: false,
        group: 'account',
        section: 'personal-info',
      })
    }

    if (isOperator.value) {
      if (!hasVerifiedPayphone.value) {
        items.push({
          label: 'Configura Payphone',
          urgent: true,
          group: 'business',
          section: 'payouts',
        })
      }
      if (tenantProfile.value && !tenantProfile.value.publicName) {
        items.push({ label: 'Nombre público', urgent: false, group: 'business', section: 'brand' })
      }
      if (tenantProfile.value && !tenantProfile.value.watermarkUrl) {
        items.push({ label: 'Marca de agua', urgent: false, group: 'business', section: 'brand' })
      }
      if (tenantProfile.value && !tenantProfile.value.whatsappNumber) {
        items.push({
          label: 'WhatsApp comercial',
          urgent: false,
          group: 'business',
          section: 'contact',
        })
      }
    }

    return items
  })

  const accountPending = computed(() =>
    pendingItems.value.filter((item) => item.group === 'account'),
  )
  const businessPending = computed(() =>
    pendingItems.value.filter((item) => item.group === 'business'),
  )

  return { pendingItems, accountPending, businessPending, hasVerifiedPayphone }
}
