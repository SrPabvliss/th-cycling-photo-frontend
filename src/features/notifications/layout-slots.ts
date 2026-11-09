import { LAYOUT_SLOTS, registerLayoutSlot } from '@/core/layout/slot-registry'
import NotificationBell from './presentation/components/NotificationBell/NotificationBell.vue'

export function registerNotificationLayoutSlots(): void {
  registerLayoutSlot(LAYOUT_SLOTS.APP_NAV_ACTIONS, NotificationBell)
}
