import {
  findCurrentMethod,
  findMethod,
  presentText,
  usablePublicName,
  watermarkFileName,
} from './configuration-draft.utils'
import type { ConfigurationItemId } from '../types/configuration-item.types'
import type {
  IEventConfigurationPresetResponse,
  IEventConfigurationResponse,
} from '../types/responses/event-configuration.response'

export function buildProfileValues(
  preset: IEventConfigurationPresetResponse | undefined,
): Record<ConfigurationItemId, string | null> {
  const payphone = findMethod(preset, 'payphone')
  const bank = findMethod(preset, 'bank_transfer')
  return {
    publicName: usablePublicName(preset?.publicName),
    watermark: watermarkFileName(presentText(preset?.watermarkStorageKey)),
    whatsapp: presentText(preset?.whatsappNumber),
    payphone: presentText(payphone?.receiverIdentifier),
    bankTransfer: bank
      ? presentText([bank.bankName, bank.accountNumber].filter(Boolean).join(' · '))
      : null,
  }
}

export function buildHasProfileValues(
  preset: IEventConfigurationPresetResponse | undefined,
  values: Record<ConfigurationItemId, string | null>,
): Record<ConfigurationItemId, boolean> {
  return {
    publicName: values.publicName !== null,
    watermark: values.watermark !== null,
    whatsapp: values.whatsapp !== null,
    payphone: findMethod(preset, 'payphone') !== null,
    bankTransfer: findMethod(preset, 'bank_transfer') !== null,
  }
}

export function buildCurrentValues(
  current: IEventConfigurationResponse | undefined,
): Record<ConfigurationItemId, string | null> {
  const payphone = findCurrentMethod(current, 'payphone')
  const bank = findCurrentMethod(current, 'bank_transfer')
  return {
    publicName: usablePublicName(current?.publicName),
    watermark: watermarkFileName(presentText(current?.watermarkStorageKey)),
    whatsapp: presentText(current?.whatsappNumber),
    payphone: presentText(payphone?.receiverIdentifier),
    bankTransfer: bank
      ? presentText([bank.bankName, bank.accountNumber].filter(Boolean).join(' · '))
      : null,
  }
}

export function buildHasCurrentValues(
  current: IEventConfigurationResponse | undefined,
  values: Record<ConfigurationItemId, string | null>,
): Record<ConfigurationItemId, boolean> {
  return {
    publicName: values.publicName !== null,
    watermark: values.watermark !== null,
    whatsapp: values.whatsapp !== null,
    payphone: findCurrentMethod(current, 'payphone') !== null,
    bankTransfer: findCurrentMethod(current, 'bank_transfer') !== null,
  }
}

export function buildCurrentPayoutIsFromProfile(
  current: IEventConfigurationResponse | undefined,
): Record<ConfigurationItemId, boolean> {
  const payphone = findCurrentMethod(current, 'payphone')
  const bank = findCurrentMethod(current, 'bank_transfer')
  return {
    publicName: false,
    watermark: false,
    whatsapp: false,
    payphone: payphone !== null && payphone.sourcePayoutMethodId !== null,
    bankTransfer: bank !== null && bank.sourcePayoutMethodId !== null,
  }
}

export function buildCurrentMatchesProfile(
  current: IEventConfigurationResponse | undefined,
  preset: IEventConfigurationPresetResponse | undefined,
  currentValues: Record<ConfigurationItemId, string | null>,
  profileValues: Record<ConfigurationItemId, string | null>,
): Record<ConfigurationItemId, boolean> {
  const currentWatermarkKey = presentText(current?.watermarkStorageKey)
  const profileWatermarkKey = presentText(preset?.watermarkStorageKey)
  return {
    publicName:
      currentValues.publicName !== null && currentValues.publicName === profileValues.publicName,
    watermark: currentWatermarkKey !== null && currentWatermarkKey === profileWatermarkKey,
    whatsapp: currentValues.whatsapp !== null && currentValues.whatsapp === profileValues.whatsapp,
    payphone: false,
    bankTransfer: false,
  }
}
