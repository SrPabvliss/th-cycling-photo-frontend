<script setup lang="ts">
// One topic of the buyer profile, folded. The header is the button; the body exists only while
// open, so each section loads and saves on its own.
export type ProfileSectionIcon = 'user' | 'phone' | 'mail' | 'lock' | 'docu'

const props = defineProps<{
  id: string
  title: string
  icon: ProfileSectionIcon
  meta?: string
  metaTone?: 'ok' | 'warn' | 'muted'
}>()

const open = defineModel<boolean>('open', { required: true })

const PATHS: Record<ProfileSectionIcon, string> = {
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  phone:
    'M6.6 3.5h2.6l1.4 4-1.9 1.3a10 10 0 0 0 5 5l1.3-1.9 4 1.4v2.6a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z',
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  docu: 'M7 3h7l4 4v14H7zM14 3v4h4M10 12h5M10 16h5',
}

const bodyId = `perfil-${props.id}`
</script>

<template>
  <section class="profile-section" :class="{ 'profile-section--open': open }">
    <button
      type="button"
      class="profile-section__head"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="bodyId"
      @click="open = !open"
    >
      <span class="profile-section__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path :d="PATHS[icon]" /></svg>
      </span>
      <span class="profile-section__title">{{ title }}</span>
      <span v-if="meta" class="profile-section__meta" :data-tone="metaTone ?? 'muted'">
        {{ meta }}
      </span>
      <svg class="profile-section__chevron" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
    <div :id="bodyId" class="profile-section__body" :hidden="!open">
      <slot v-if="open" />
    </div>
  </section>
</template>

<style scoped>
.profile-section + .profile-section {
  border-block-start: thin solid var(--tt-line-subtle);
}

.profile-section__head {
  display: flex;
  align-items: center;
  gap: var(--tt-space-3);
  inline-size: 100%;
  min-block-size: calc(var(--tt-control-l) + var(--tt-space-2));
  padding: 0 var(--tt-space-4);
  border: 0;
  background: none;
  color: var(--tt-ink);
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.profile-section__head:focus-visible {
  outline: medium solid var(--tt-primary);
  outline-offset: calc(var(--tt-space-1) / -2);
}

.profile-section__icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-s);
  block-size: var(--tt-control-s);
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
}

.profile-section svg {
  inline-size: var(--tt-icon-m);
  block-size: var(--tt-icon-m);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.profile-section__title {
  flex: 1;
  min-inline-size: 0;
  font-weight: var(--tt-type-title-weight);
}

.profile-section__meta {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  white-space: nowrap;
}

.profile-section__meta[data-tone='ok'] {
  color: var(--tt-success-ink);
}

.profile-section__meta[data-tone='warn'] {
  color: var(--tt-warning-ink);
}

.profile-section__chevron {
  flex: none;
  color: var(--tt-ink-muted);
  transition: transform var(--tt-motion-fast) var(--tt-easing-standard);
}

.profile-section--open .profile-section__chevron {
  transform: rotate(90deg);
}

.profile-section__body {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  padding: var(--tt-space-1) var(--tt-space-4) var(--tt-space-5);
}

@media (prefers-reduced-motion: reduce) {
  .profile-section__chevron {
    transition: none;
  }
}
</style>
