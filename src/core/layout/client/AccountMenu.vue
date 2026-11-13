<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { canOperate } from '@/core/auth/capabilities'
import { getHomePath } from '@/core/auth/role-config'
import { useHatStore } from '@/core/auth/stores/hat.store'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useLogoutMutation } from '@/core/auth/use-logout'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { useColorSchemeStore } from '@/core/theme/color-scheme.store'
import UserAvatar from './UserAvatar.vue'

const props = defineProps<{
  id: string
  show: boolean
  /** The avatar button: it gets the focus back when the menu closes from the keyboard. */
  trigger: HTMLElement | null
}>()

const emit = defineEmits<{
  'update:show': [boolean]
}>()

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const hatStore = useHatStore()
const schemeStore = useColorSchemeStore()
// No redirect of its own: where to land after signing out depends on the screen, see signOut.
const { mutateAsync: logout } = useLogoutMutation({ redirectTo: null })

const panel = ref<HTMLElement | null>(null)

const permissions = computed(() => session.currentUser?.permissions ?? [])
const fullName = computed(() =>
  [session.currentUser?.firstName, session.currentUser?.lastName].filter(Boolean).join(' '),
)
const isDark = computed(() => schemeStore.scheme === 'dark')

function close() {
  emit('update:show', false)
}

function items(): HTMLElement[] {
  return Array.from(
    panel.value?.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemcheckbox"]') ??
      [],
  )
}

function focusItem(index: number) {
  const all = items()
  if (all.length === 0) return
  all[(index + all.length) % all.length]!.focus()
}

function onKeydown(event: KeyboardEvent) {
  const current = items().indexOf(document.activeElement as HTMLElement)

  if (event.key === 'Escape') {
    close()
    props.trigger?.focus()
  } else if (event.key === 'ArrowDown') focusItem(current + 1)
  else if (event.key === 'ArrowUp') focusItem(current - 1)
  else if (event.key === 'Home') focusItem(0)
  else if (event.key === 'End') focusItem(-1)
  else if (event.key === 'Tab') return close()
  else return

  event.preventDefault()
}

function goOperate() {
  close()
  hatStore.setHat('operating')
  router.push(getHomePath(permissions.value))
}

async function signOut() {
  // Read before the session goes: a screen that needs one cannot stay open without it.
  const needsSession = route.matched.some((record) => record.meta.requiresAuth)
  close()

  try {
    await logout()
  } catch {
    // The session is cleared locally whether or not the server answered.
  }

  if (needsSession) router.push(ROUTE_PATHS.LANDING)
}

watch(
  () => props.show,
  async (open) => {
    if (!open) return
    await nextTick()
    focusItem(0)
  },
  { immediate: true },
)

// Any navigation closes it: a menu link, the back button, a redirect.
watch(() => route.fullPath, close)
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="account-menu">
      <button
        type="button"
        class="account-menu__scrim"
        aria-label="Cerrar menú de cuenta"
        tabindex="-1"
        @click="close"
      />

      <div
        :id="id"
        ref="panel"
        class="account-menu__panel"
        role="menu"
        aria-label="Cuenta"
        @keydown="onKeydown"
      >
        <div class="account-menu__who" role="presentation">
          <UserAvatar :name="fullName" />
          <div class="account-menu__identity">
            <span v-if="fullName" class="account-menu__name">{{ fullName }}</span>
            <span class="account-menu__email">{{ session.currentUser?.email }}</span>
          </div>
        </div>

        <div class="account-menu__separator" role="separator" />

        <RouterLink
          class="account-menu__item"
          role="menuitem"
          tabindex="-1"
          :to="{ name: ROUTE_NAMES.ACCOUNT_PROFILE }"
          @click="close"
        >
          <svg class="account-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          Mi perfil
        </RouterLink>

        <button
          type="button"
          class="account-menu__item"
          role="menuitemcheckbox"
          tabindex="-1"
          :aria-checked="isDark ? 'true' : 'false'"
          @click="schemeStore.toggle()"
        >
          <svg class="account-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
          </svg>
          Modo oscuro
          <span
            class="account-menu__switch"
            :class="{ 'account-menu__switch--on': isDark }"
            aria-hidden="true"
          />
        </button>

        <button
          v-if="canOperate(permissions)"
          type="button"
          class="account-menu__item"
          role="menuitem"
          tabindex="-1"
          @click="goOperate"
        >
          <svg class="account-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 4 3 8l4 4M3 8h14M17 12l4 4-4 4M21 16H7" />
          </svg>
          Modo organizador
        </button>

        <div class="account-menu__separator" role="separator" />

        <button
          type="button"
          class="account-menu__item account-menu__item--danger"
          role="menuitem"
          tabindex="-1"
          @click="signOut"
        >
          <svg class="account-menu__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Mobile: a sheet from the bottom over a scrim. Desktop: a popover under the avatar. */
.account-menu {
  position: fixed;
  inset: 0;
  z-index: var(--tt-layer-menu);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-family: var(--tt-font-sans);
}

.account-menu__scrim {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  padding: 0;
  border: 0;
  background: var(--tt-scrim);
  cursor: default;
}

.account-menu__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  max-block-size: var(--tt-sheet-max-height);
  padding: var(--tt-space-4) var(--tt-space-4) calc(var(--tt-space-5) + env(safe-area-inset-bottom));
  overflow-y: auto;
  border-radius: var(--tt-radius-xl) var(--tt-radius-xl) 0 0;
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-sheet);
  animation: account-menu-up var(--tt-motion-sheet) var(--tt-easing-standard);
}

.account-menu__who {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
  padding: var(--tt-space-1) var(--tt-space-2) var(--tt-space-2);
}

.account-menu__identity {
  display: flex;
  flex-direction: column;
  min-inline-size: 0;
}

.account-menu__name,
.account-menu__email {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-menu__name {
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
  font-weight: var(--tt-type-title-weight);
}

.account-menu__email {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.account-menu__separator {
  flex: none;
  block-size: 0;
  margin-block: var(--tt-space-1);
  border-block-start: thin solid var(--tt-line-subtle);
}

.account-menu__item {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
  inline-size: 100%;
  min-block-size: var(--tt-control-l);
  padding-inline: var(--tt-space-2);
  border: 0;
  border-radius: var(--tt-radius-m);
  background: none;
  color: var(--tt-ink);
  text-align: start;
  text-decoration: none;
  font-family: inherit;
  font-size: var(--tt-type-body-medium-size);
  line-height: var(--tt-type-body-medium-line);
  font-weight: var(--tt-type-body-medium-weight);
  cursor: pointer;
}

.account-menu__item:hover,
.account-menu__item:focus-visible {
  background: var(--tt-surface-sunken);
}

.account-menu__item--danger {
  color: var(--tt-danger-ink);
}

.account-menu__icon {
  flex: none;
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  color: var(--tt-ink-muted);
}

.account-menu__item--danger .account-menu__icon {
  color: inherit;
}

.account-menu__switch {
  --switch-knob: var(--tt-icon-l);
  --switch-gap: calc(var(--tt-space-1) * 3 / 4);

  position: relative;
  flex: none;
  inline-size: var(--tt-control-m);
  block-size: calc(var(--switch-knob) + var(--switch-gap) * 2);
  margin-inline-start: auto;
  border-radius: var(--tt-radius-pill);
  background: var(--tt-line);
}

.account-menu__switch::after {
  content: '';
  position: absolute;
  inset-block-start: var(--switch-gap);
  inset-inline-start: var(--switch-gap);
  inline-size: var(--switch-knob);
  block-size: var(--switch-knob);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-on-primary);
  transition: transform var(--tt-motion-base) var(--tt-easing-standard);
}

.account-menu__switch--on {
  background: var(--tt-primary);
}

.account-menu__switch--on::after {
  transform: translateX(calc(var(--tt-control-m) - var(--switch-knob) - var(--switch-gap) * 2));
}

@keyframes account-menu-up {
  from {
    transform: translateY(100%);
  }
}

@media (min-width: 768px) {
  .account-menu {
    align-items: flex-end;
    justify-content: flex-start;
  }

  .account-menu__scrim {
    background: transparent;
  }

  .account-menu__panel {
    inline-size: calc(var(--tt-sidebar-width) + var(--tt-space-8));
    margin: calc(var(--tt-header-desktop) - var(--tt-space-1)) var(--tt-space-5) 0 0;
    padding: var(--tt-space-3);
    border-radius: var(--tt-radius-l);
    box-shadow: var(--tt-shadow-pop);
    animation: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .account-menu__panel {
    animation: none;
  }

  .account-menu__switch::after {
    transition: none;
  }
}
</style>
