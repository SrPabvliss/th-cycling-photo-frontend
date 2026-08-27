import { computed, shallowRef, type Component } from 'vue'

export const LAYOUT_SLOTS = {
  APP_NAV_ACTIONS: 'app-nav-actions',
  PUBLIC_NAV_ACTION: 'public-nav-action',
  PUBLIC_NAV_OVERLAY: 'public-nav-overlay',
} as const

export type LayoutSlot = (typeof LAYOUT_SLOTS)[keyof typeof LAYOUT_SLOTS]

const registry = shallowRef<Partial<Record<LayoutSlot, Component[]>>>({})

export function registerLayoutSlot(slot: LayoutSlot, component: Component): void {
  registry.value = { ...registry.value, [slot]: [...(registry.value[slot] ?? []), component] }
}

export function useLayoutSlot(slot: LayoutSlot) {
  return computed<Component[]>(() => registry.value[slot] ?? [])
}
