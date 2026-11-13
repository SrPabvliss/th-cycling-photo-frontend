<script setup lang="ts">
import UserAvatar from '@/core/layout/client/UserAvatar.vue'

// Who is signed in: initials (no photo), name, email and whether the email is confirmed.
defineProps<{
  name: string
  email: string
  emailVerified: boolean
}>()
</script>

<template>
  <div class="profile-header">
    <UserAvatar :name="name" size="l" />
    <div class="profile-header__who">
      <strong class="profile-header__name">{{ name }}</strong>
      <span class="profile-header__email">{{ email }}</span>
      <span class="profile-header__pill" :data-tone="emailVerified ? 'ok' : 'warn'">
        {{ emailVerified ? 'Correo confirmado' : 'Correo sin confirmar' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--tt-space-4);
  font-family: var(--tt-font-sans);
}

.profile-header__who {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--tt-space-1) / 2);
  min-inline-size: 0;
}

.profile-header__name {
  font-size: var(--tt-type-title-size);
  font-weight: var(--tt-type-title-weight);
}

.profile-header__email {
  max-inline-size: 100%;
  overflow: hidden;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-header__pill {
  display: inline-flex;
  align-items: center;
  min-block-size: var(--tt-space-5);
  padding: 0 var(--tt-space-3);
  border-radius: var(--tt-radius-pill);
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-title-weight);
  white-space: nowrap;
}

.profile-header__pill[data-tone='ok'] {
  background: var(--tt-success-soft);
  color: var(--tt-success-ink);
}

.profile-header__pill[data-tone='warn'] {
  background: var(--tt-warning-soft);
  color: var(--tt-warning-ink);
}
</style>
