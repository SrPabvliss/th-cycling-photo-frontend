<script setup lang="ts">
import type { ProfileBlockIconName } from '../../../types/profile-section.types'

const SVG_PATHS: Record<ProfileBlockIconName, string> = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  wa: '<path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12z"/>',
  phone:
    '<path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1L6.6 10.8z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/>',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><line x1="2.5" y1="10" x2="21.5" y2="10"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4"/>',
}

defineProps<{
  icon: ProfileBlockIconName
}>()
</script>

<template>
  <span class="profile-block-icon">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      v-html="SVG_PATHS[icon] || ''"
    />
  </span>
</template>

<style scoped src="./profile-block-icon.css"></style>
