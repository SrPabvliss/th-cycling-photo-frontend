import { ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { NO_PAYOUT_METHOD_LEFT, useConfigurationItems } from '../use-configuration-items'
import type {
  IEventConfigurationPresetResponse,
  IEventConfigurationResponse,
  IEventPayoutMethodResponse,
} from '../../types/responses/event-configuration.response'
import type { PayoutMethodResponse } from '@/features/tenant-profile/types/responses/payout-method.response'

const PUBLIC_NAME = 0
const WATERMARK = 1
const WHATSAPP = 2
const PAYPHONE = 3
const BANK_TRANSFER = 4

const profilePayphoneMethod: PayoutMethodResponse = {
  id: '11111111-1111-4111-8111-111111111111',
  provider: 'payphone',
  isActive: true,
  sortOrder: 0,
  status: 'verified',
  receiverIdentifier: '987654321',
  bankName: null,
  accountNumber: null,
  accountType: null,
  accountHolder: null,
  holderIdentification: null,
  verifiedAt: '2026-01-01T00:00:00.000Z',
}

const profileBankMethod: PayoutMethodResponse = {
  id: '22222222-2222-4222-8222-222222222222',
  provider: 'bank_transfer',
  isActive: true,
  sortOrder: 1,
  status: 'verified',
  receiverIdentifier: null,
  bankName: 'Banco Pichincha',
  accountNumber: '2100458899',
  accountType: 'ahorros',
  accountHolder: 'Andrés Cepeda Mora',
  holderIdentification: '1712345678',
  verifiedAt: '2026-01-01T00:00:00.000Z',
}

function makePreset(
  overrides: Partial<IEventConfigurationPresetResponse> = {},
): IEventConfigurationPresetResponse {
  return {
    publicName: 'Andes Bike Media',
    watermarkStorageKey: 'tenants/andes/marca-andes-2026.png',
    watermarkUrl: 'https://cdn.example/marca-andes-2026.png',
    whatsappNumber: '+593 99 812 4477',
    whatsappPendingVerification: false,
    availablePayoutMethods: [profilePayphoneMethod, profileBankMethod],
    missing: [],
    ...overrides,
  }
}

function makeEventPayphone(
  overrides: Partial<IEventPayoutMethodResponse> = {},
): IEventPayoutMethodResponse {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    provider: 'payphone',
    isActive: true,
    sortOrder: 0,
    receiverIdentifier: '911112222',
    bankName: null,
    accountNumber: null,
    accountType: null,
    accountHolder: null,
    holderIdentification: null,
    sourcePayoutMethodId: null,
    ...overrides,
  }
}

function makeEventBank(
  overrides: Partial<IEventPayoutMethodResponse> = {},
): IEventPayoutMethodResponse {
  return {
    id: '44444444-4444-4444-8444-444444444444',
    provider: 'bank_transfer',
    isActive: true,
    sortOrder: 1,
    receiverIdentifier: null,
    bankName: 'Banco Guayaquil',
    accountNumber: '9988776655',
    accountType: 'corriente',
    accountHolder: 'Evento Only Holder',
    holderIdentification: '0912345678',
    sourcePayoutMethodId: null,
    ...overrides,
  }
}

function makeCurrent(
  overrides: Partial<IEventConfigurationResponse> = {},
): IEventConfigurationResponse {
  return {
    publicName: 'Evento Sierra Norte',
    watermarkStorageKey: 'events/sierra-norte/marca.png',
    watermarkUrl: 'https://cdn.titantv.com.ec/events/sierra-norte/marca.png',
    whatsappNumber: '+593 90 000 1111',
    payoutMethods: [makeEventPayphone(), makeEventBank()],
    isEditable: true,
    ...overrides,
  }
}

describe('useConfigurationItems', () => {
  it('behaves exactly as before when no current configuration is given', () => {
    const preset = ref(makePreset())
    const { items } = useConfigurationItems(preset)

    expect(items.value[PUBLIC_NAME]!.state).toBe('profile')
    expect(items.value[PUBLIC_NAME]!.useProfile).toBe(true)
    expect(items.value[PUBLIC_NAME]!.saveToProfile).toBe(false)
    expect(items.value[PUBLIC_NAME]!.draft).toEqual({ value: '' })
  })

  it('seeds each draft from the event rather than leaving it empty', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent())
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PUBLIC_NAME]!.draft).toEqual({ value: 'Evento Sierra Norte' })
    expect(items.value[WATERMARK]!.draft).toEqual({
      storageKey: 'events/sierra-norte/marca.png',
      fileName: 'marca.png',
    })
    expect(items.value[WHATSAPP]!.draft).toEqual({ value: '+593 90 000 1111' })
    expect(items.value[PAYPHONE]!.draft).toMatchObject({ phone: '+593911112222' })
    expect(items.value[BANK_TRANSFER]!.draft).toMatchObject({
      bankName: 'Banco Guayaquil',
      accountNumber: '9988776655',
    })
  })

  it('starts with the profile unselected for a value the event already carries', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent())
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PUBLIC_NAME]!.useProfile).toBe(false)
    expect(items.value[WATERMARK]!.useProfile).toBe(false)
    expect(items.value[WHATSAPP]!.useProfile).toBe(false)
    expect(items.value[PAYPHONE]!.useProfile).toBe(false)
    expect(items.value[BANK_TRANSFER]!.useProfile).toBe(false)
  })

  it('starts with the profile selected only where the event has nothing and the profile has something', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent({ publicName: null }))
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PUBLIC_NAME]!.useProfile).toBe(true)
    expect(items.value[WATERMARK]!.useProfile).toBe(false)
  })

  it('chips a payout row copied from the profile as Del perfil', () => {
    const preset = ref(makePreset())
    const current = ref(
      makeCurrent({
        payoutMethods: [
          makeEventPayphone({ sourcePayoutMethodId: profilePayphoneMethod.id }),
          makeEventBank(),
        ],
      }),
    )
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PAYPHONE]!.state).toBe('profile')
  })

  it('chips a payout row that belongs only to this event as Solo este evento', () => {
    const preset = ref(makePreset())
    const current = ref(
      makeCurrent({
        payoutMethods: [makeEventPayphone(), makeEventBank({ sourcePayoutMethodId: null })],
      }),
    )
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[BANK_TRANSFER]!.state).toBe('new')
  })

  it('chips a missing value as Falta', () => {
    const preset = ref(makePreset({ availablePayoutMethods: [] }))
    const current = ref(makeCurrent({ payoutMethods: [] }))
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PAYPHONE]!.state).toBe('missing')
    expect(items.value[BANK_TRANSFER]!.state).toBe('missing')
  })

  it('does not default saveToProfile to true when editing an existing event', () => {
    const preset = ref(makePreset({ publicName: null, availablePayoutMethods: [] }))
    const current = ref(makeCurrent({ payoutMethods: [] }))
    const { items } = useConfigurationItems(preset, current)

    items.value.forEach((item) => {
      expect(item.saveToProfile).toBe(false)
    })
  })

  it('chips a non-payout value equal to the profile as Del perfil', () => {
    const preset = ref(makePreset({ publicName: 'Andes Bike Media' }))
    const current = ref(makeCurrent({ publicName: 'Andes Bike Media' }))
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PUBLIC_NAME]!.state).toBe('profile')
  })

  it('chips a non-payout value that differs from the profile as Solo este evento', () => {
    const preset = ref(makePreset({ publicName: 'Andes Bike Media' }))
    const current = ref(makeCurrent({ publicName: 'Evento Sierra Norte' }))
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PUBLIC_NAME]!.state).toBe('new')
  })

  it('chips a missing non-payout value as Falta', () => {
    const preset = ref(makePreset({ publicName: null }))
    const current = ref(makeCurrent({ publicName: null }))
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PUBLIC_NAME]!.state).toBe('missing')
  })

  it('sends the profile method when the row was switched to the profile', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent())
    const { toSelection, setUseProfile } = useConfigurationItems(preset, current)

    setUseProfile('payphone', true)

    expect(toSelection().payoutMethods).toContainEqual({
      source: 'profile',
      id: profilePayphoneMethod.id,
    })
  })

  it('sends the event row when it is untouched but another payout row changed', () => {
    const preset = ref(makePreset())
    const current = ref(
      makeCurrent({ payoutMethods: [makeEventPayphone({ id: 'event-payphone-id' })] }),
    )
    const { toSelection, setUseProfile } = useConfigurationItems(preset, current)

    setUseProfile('bankTransfer', true)

    expect(toSelection().payoutMethods).toContainEqual({
      source: 'event',
      id: 'event-payphone-id',
    })
  })

  it('sends the event row when it is untouched even if it was originally seeded from the profile, as long as something else changed', () => {
    const preset = ref(makePreset())
    const current = ref(
      makeCurrent({
        payoutMethods: [
          makeEventPayphone({
            id: 'event-payphone-id',
            sourcePayoutMethodId: profilePayphoneMethod.id,
          }),
        ],
      }),
    )
    const { toSelection, setUseProfile } = useConfigurationItems(preset, current)

    setUseProfile('bankTransfer', true)

    expect(toSelection().payoutMethods).toContainEqual({
      source: 'event',
      id: 'event-payphone-id',
    })
  })

  it('is ready right away when the stored payphone number is a bare Ecuadorean subscriber', () => {
    const preset = ref(makePreset())
    const current = ref(
      makeCurrent({
        payoutMethods: [makeEventPayphone({ receiverIdentifier: '984198999' }), makeEventBank()],
      }),
    )
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PAYPHONE]!.draft).toMatchObject({ phone: '+593984198999' })
    expect(items.value[PAYPHONE]!.isReady).toBe(true)
  })

  it('does not add the profile bank details to an event that only has a payphone', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent({ payoutMethods: [makeEventPayphone()] }))
    const { items, toSelection, patchDraft } = useConfigurationItems(preset, current)

    expect(items.value[BANK_TRANSFER]!.useProfile).toBe(false)
    expect(items.value[BANK_TRANSFER]!.state).toBe('missing')

    patchDraft('publicName', { value: 'Nombre publico actualizado' })
    const selection = toSelection()

    expect(selection.payoutMethods ?? []).not.toContainEqual(
      expect.objectContaining({ source: 'profile', id: profileBankMethod.id }),
    )
  })

  it('can be saved when an item is missing everywhere but the event still keeps a payout method', () => {
    const preset = ref(makePreset({ watermarkStorageKey: null }))
    const current = ref(makeCurrent({ watermarkStorageKey: null }))
    const { readyCount, canSave } = useConfigurationItems(preset, current)

    expect(readyCount.value).toBeLessThan(5)
    expect(canSave.value).toBe(true)
  })

  it('sends nothing when the screen is saved without any change', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent())
    const { toSelection } = useConfigurationItems(preset, current)

    expect(toSelection()).toEqual({})
  })

  it('sends the edited draft as new when the event row was changed in place', () => {
    const preset = ref(makePreset())
    const current = ref(
      makeCurrent({ payoutMethods: [makeEventPayphone({ id: 'event-payphone-id' })] }),
    )
    const { toSelection, patchDraft } = useConfigurationItems(preset, current)

    patchDraft('payphone', { phone: '+593 99 000 3333', verification: 'verified' })

    expect(toSelection().payoutMethods).toContainEqual({
      source: 'new',
      provider: 'payphone',
      phone: '+593 99 000 3333',
    })
  })

  it('lets either payout method be removed when both are active', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent())
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PAYPHONE]!.removeDisabledReason).toBeNull()
    expect(items.value[BANK_TRANSFER]!.removeDisabledReason).toBeNull()
  })

  it('refuses to remove the only active payout method', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent({ payoutMethods: [makeEventPayphone()] }))
    const { items } = useConfigurationItems(preset, current)

    expect(items.value[PAYPHONE]!.removeDisabledReason).toBe(NO_PAYOUT_METHOD_LEFT)
  })

  it('blocks removing the remaining method after the other one was already removed', () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent())
    const { items, setPayoutRemoved } = useConfigurationItems(preset, current)

    expect(items.value[BANK_TRANSFER]!.removeDisabledReason).toBeNull()

    setPayoutRemoved('payphone', true)

    expect(items.value[BANK_TRANSFER]!.removeDisabledReason).toBe(NO_PAYOUT_METHOD_LEFT)
  })

  it("omits a removed payout row from the payload and still sends the other as the event's own", () => {
    const preset = ref(makePreset())
    const current = ref(makeCurrent())
    const { toSelection, setPayoutRemoved } = useConfigurationItems(preset, current)

    setPayoutRemoved('payphone', true)
    const selection = toSelection()

    expect(selection.payoutMethods).not.toContainEqual(
      expect.objectContaining({ id: '33333333-3333-4333-8333-333333333333' }),
    )
    expect(selection.payoutMethods).toContainEqual({
      source: 'event',
      id: '44444444-4444-4444-8444-444444444444',
    })
  })
})
