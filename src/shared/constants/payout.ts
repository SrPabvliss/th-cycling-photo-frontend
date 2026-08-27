export const ECUADOR_BANKS = [
  'Banco Pichincha',
  'Banco Guayaquil',
  'Produbanco',
  'Banco Internacional',
  'Banco Bolivariano',
  'Banco del Pacífico',
  'Cooperativa JEP',
]

export const BANK_OPTIONS = ECUADOR_BANKS.map((bank) => ({ value: bank, label: bank }))

export const ACCOUNT_TYPES = ['ahorros', 'corriente'] as const

export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'ahorros', label: 'Ahorros' },
  { value: 'corriente', label: 'Corriente' },
]
