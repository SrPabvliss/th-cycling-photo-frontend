<script setup lang="ts">
import { computed, ref } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { LAYOUT_SLOTS, useLayoutSlot } from '@/core/layout/slot-registry'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import AccountMenu from './AccountMenu.vue'
import ClientLogo from './ClientLogo.vue'
import UserAvatar from './UserAvatar.vue'
import { useClientShell, type ClientTab } from './client-shell'

const ACCOUNT_MENU_ID = 'client-account-menu'

const session = useSessionStore()
const shell = useClientShell()

// Other features put their pieces in the header through the slot registry: today, the cart
// button and its drawer.
const actions = useLayoutSlot(LAYOUT_SLOTS.PUBLIC_NAV_ACTION)
const overlays = useLayoutSlot(LAYOUT_SLOTS.PUBLIC_NAV_OVERLAY)

const destinations: { tab: ClientTab; label: string; to: string | { name: string } }[] = [
  { tab: 'home', label: 'Inicio', to: ROUTE_PATHS.LANDING },
  { tab: 'events', label: 'Eventos', to: ROUTE_PATHS.PUBLIC_GALLERY },
  { tab: 'photos', label: 'Mis fotos', to: { name: ROUTE_NAMES.ACCOUNT_ORDERS } },
]

const fullName = computed(() =>
  [session.currentUser?.firstName, session.currentUser?.lastName].filter(Boolean).join(' '),
)
const firstName = computed(() => session.currentUser?.firstName?.trim().split(/\s+/)[0] ?? '')

const isMenuOpen = ref(false)
const accountButton = ref<HTMLButtonElement | null>(null)
</script>

<template>
  <header class="client-header">
    <ClientLogo />

    <nav class="client-header__nav" aria-label="Navegación principal">
      <RouterLink
        v-for="destination in destinations"
        :key="destination.tab"
        class="client-header__link"
        :to="destination.to"
        :aria-current="shell.tab === destination.tab ? 'page' : undefined"
      >
        {{ destination.label }}
      </RouterLink>
    </nav>

    <div class="client-header__actions">
      <component :is="action" v-for="(action, index) in actions" :key="index" />

      <button
        v-if="session.isAuthenticated"
        ref="accountButton"
        type="button"
        class="client-header__account"
        data-test="header-account"
        aria-label="Abrir cuenta"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen ? 'true' : 'false'"
        :aria-controls="ACCOUNT_MENU_ID"
        @click="isMenuOpen = !isMenuOpen"
      >
        <UserAvatar :name="fullName" />
        <span v-if="firstName" class="client-header__name">{{ firstName }}</span>
      </button>

      <RouterLink
        v-else
        class="client-header__sign-in"
        data-test="header-sign-in"
        :to="ROUTE_PATHS.LOGIN"
      >
        Ingresar
      </RouterLink>
    </div>
  </header>

  <AccountMenu
    v-if="session.isAuthenticated"
    :id="ACCOUNT_MENU_ID"
    v-model:show="isMenuOpen"
    :trigger="accountButton"
  />

  <component :is="overlay" v-for="(overlay, index) in overlays" :key="index" />
</template>

<style scoped>
.client-header {
  position: sticky;
  inset-block-start: 0;
  z-index: 50;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tt-space-4);
  block-size: var(--tt-header-mobile);
  padding-inline: var(--tt-space-4) var(--tt-space-3);
  background: var(--tt-surface);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

/* The header navigation exists from desktop on; on mobile the bottom tab bar does its job. */
.client-header__nav {
  display: none;
  flex: 1;
  gap: var(--tt-space-1);
  margin-inline-start: var(--tt-space-5);
}

.client-header__link {
  display: flex;
  align-items: center;
  block-size: calc(var(--tt-control-m) - var(--tt-space-1));
  padding-inline: calc(var(--tt-space-3) + var(--tt-space-1) / 2);
  border-radius: var(--tt-radius-m);
  color: var(--tt-ink-muted);
  text-decoration: none;
  font-size: var(--tt-type-body-medium-size);
  font-weight: var(--tt-type-title-weight);
}

.client-header__link:hover {
  color: var(--tt-ink);
}

.client-header__link[aria-current='page'] {
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}

.client-header__actions {
  display: flex;
  align-items: center;
  gap: var(--tt-space-1);
}

.client-header__account {
  display: flex;
  align-items: center;
  gap: var(--tt-space-2);
  block-size: var(--tt-control-m);
  padding-inline: var(--tt-space-1);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: transparent;
  color: var(--tt-ink);
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.client-header__account:hover {
  background: var(--tt-surface-sunken);
}

.client-header__name {
  display: none;
}

.client-header__sign-in {
  display: flex;
  align-items: center;
  block-size: var(--tt-control-m);
  padding-inline: calc(var(--tt-space-4) + var(--tt-space-1));
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  text-decoration: none;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
}

.client-header__sign-in:hover {
  background: var(--tt-surface-sunken);
}

@media (min-width: 768px) {
  .client-header {
    block-size: var(--tt-header-desktop);
    padding-inline: var(--tt-space-6);
    border-block-end: thin solid var(--tt-line-subtle);
  }

  .client-header__nav {
    display: flex;
  }

  .client-header__name {
    display: inline;
    padding-inline-end: var(--tt-space-2);
  }

  .client-header__account :deep(.user-avatar) {
    inline-size: var(--tt-avatar-desktop);
    block-size: var(--tt-avatar-desktop);
  }
}
</style>
