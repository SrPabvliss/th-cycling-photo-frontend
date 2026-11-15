import { LAYOUT_SLOTS, registerLayoutSlot } from '@/core/layout/slot-registry'
import PriceSheetHost from './presentation/components/PriceSheetHost/PriceSheetHost.vue'

export function registerPricingLayoutSlots(): void {
  registerLayoutSlot(LAYOUT_SLOTS.CLIENT_OVERLAY, PriceSheetHost)
}
