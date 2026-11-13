import { LAYOUT_SLOTS, registerLayoutSlot } from '@/core/layout/slot-registry'
import SeasonBar from './presentation/components/SeasonBar/SeasonBar.vue'

/** The season bar reaches the client shell through the registry: core never imports features. */
export function registerHouseSpotsLayoutSlots(): void {
  registerLayoutSlot(LAYOUT_SLOTS.CLIENT_SEASON_BAR, SeasonBar)
}
