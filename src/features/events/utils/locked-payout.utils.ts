import type { PayoutItemId } from '../types/configuration-item.types'

/** What a viewer without `tenant.payout_method.manage` reads on a payout item. */
export interface ILockedPayoutCopy {
  profileTitle: string
  otherTitle: string
  otherHint: string
  note: string
}

const METHOD_NAMES: Record<PayoutItemId, { method: string; other: string }> = {
  payphone: { method: 'Payphone', other: 'otro número' },
  bankTransfer: { method: 'transferencia bancaria', other: 'otra cuenta' },
}

export function lockedPayoutCopy(
  id: PayoutItemId,
  hasProfileValue: boolean,
  currentLabel: string | null,
): ILockedPayoutCopy {
  const { method, other } = METHOD_NAMES[id]

  let note: string
  if (hasProfileValue) {
    note = `Poner ${other} que no esté en el perfil lo hace un administrador.`
  } else if (currentLabel) {
    note = `Este evento cobra con ${currentLabel}. Cambiarlo por ${other} lo hace un administrador.`
  } else {
    note = `El perfil del negocio no tiene ${method}. Pídele a un administrador que lo configure.`
  }

  return {
    profileTitle: 'Usar la del perfil',
    otherTitle: currentLabel ? 'Mantener la de este evento' : 'No usar en este evento',
    otherHint: currentLabel ?? 'No se cobra por aquí',
    note,
  }
}
