import type { InjectionKey } from 'vue'
import type { ICardNavigation } from './use-workspace-card-navigation'

export const CARD_NAV_KEY: InjectionKey<ICardNavigation> = Symbol('CARD_NAV')
