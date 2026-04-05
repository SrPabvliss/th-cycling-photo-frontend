export type RiderCategory =
  | 'pre_infantil'
  | 'infantil'
  | 'pre_juvenil'
  | 'juvenil'
  | 'damas_abiertas'
  | 'damas_elite'
  | 'novatos_dobles'
  | 'novatos_rigidos'
  | 'master_a'
  | 'master_b'
  | 'master_c'
  | 'e_bike'
  | 'enduro_a'
  | 'enduro_b'
  | 'rigidas'
  | 'elite'
  | 'pro_elite'

export const RIDER_CATEGORY_OPTIONS: Array<{ label: string; value: RiderCategory }> = [
  { label: 'Pre Infantil', value: 'pre_infantil' },
  { label: 'Infantil', value: 'infantil' },
  { label: 'Pre Juvenil', value: 'pre_juvenil' },
  { label: 'Juvenil', value: 'juvenil' },
  { label: 'Damas Abiertas', value: 'damas_abiertas' },
  { label: 'Damas Elite', value: 'damas_elite' },
  { label: 'Novatos Dobles', value: 'novatos_dobles' },
  { label: 'Novatos Rígidos', value: 'novatos_rigidos' },
  { label: 'Master A', value: 'master_a' },
  { label: 'Master B', value: 'master_b' },
  { label: 'Master C', value: 'master_c' },
  { label: 'E-Bike', value: 'e_bike' },
  { label: 'Enduro A', value: 'enduro_a' },
  { label: 'Enduro B', value: 'enduro_b' },
  { label: 'Rígidas', value: 'rigidas' },
  { label: 'Elite', value: 'elite' },
  { label: 'Pro Elite', value: 'pro_elite' },
]
