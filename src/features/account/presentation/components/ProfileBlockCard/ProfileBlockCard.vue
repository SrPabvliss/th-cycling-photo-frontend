<script setup lang="ts">
import type { ProfileBlockIconName } from '../../../types/profile-section.types'
import ProfileBlockIcon from '../ProfileBlockIcon/ProfileBlockIcon.vue'

defineProps<{
  icon: ProfileBlockIconName
  title: string
  subtitle?: string
  highlighted?: boolean
}>()
</script>

<template>
  <section class="profile-block-card" :class="{ 'is-highlighted': highlighted }">
    <header class="profile-block-card__head">
      <ProfileBlockIcon :icon="icon" />

      <div class="profile-block-card__titles">
        <h3>{{ title }}</h3>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>

      <div v-if="$slots.aside" class="profile-block-card__aside">
        <slot name="aside" />
      </div>
    </header>

    <div class="profile-block-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped src="./profile-block-card.css"></style>
