import type { InjectionKey } from 'vue'
import type { UseCardNavigationReturn } from './use-card-navigation'

export const CARD_NAV_KEY: InjectionKey<UseCardNavigationReturn> = Symbol('CARD_NAV')
