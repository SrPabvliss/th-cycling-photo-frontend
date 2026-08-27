import { LAYOUT_SLOTS, registerLayoutSlot } from '@/core/layout/slot-registry'
import CartNavButton from './presentation/components/CartIcon/CartIcon.vue'
import CartNavDrawer from './presentation/components/CartDrawer/CartDrawer.vue'

export function registerCartLayoutSlots(): void {
  registerLayoutSlot(LAYOUT_SLOTS.PUBLIC_NAV_ACTION, CartNavButton)
  registerLayoutSlot(LAYOUT_SLOTS.PUBLIC_NAV_OVERLAY, CartNavDrawer)
}
