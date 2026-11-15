<script setup lang="ts">
import { computed } from 'vue'

import { contactWhatsAppHref, type CommercialTopic } from '@/shared/constants/commercial'

// The main action of a commercial page: a chat with Titan, its message already written.
const props = defineProps<{ topic: CommercialTopic; label: string }>()

const href = computed(() => contactWhatsAppHref(props.topic))
</script>

<template>
  <a class="whatsapp-link" :href="href" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" />
    </svg>
    {{ label }}
  </a>
</template>

<style scoped>
.whatsapp-link {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  min-block-size: var(--tt-control-l);
  padding-inline: calc(var(--tt-space-5) - var(--tt-space-1) / 2);
  border-radius: calc(var(--tt-radius-m) + var(--tt-space-1) / 2);
  background: var(--tt-wa);
  color: var(--tt-on-wa);
  font-size: var(--tt-type-title-size);
  font-weight: var(--tt-type-eyebrow-weight);
  text-decoration: none;
}

.whatsapp-link:hover {
  background: color-mix(in srgb, var(--tt-wa) 88%, var(--tt-ink));
}

.whatsapp-link svg {
  flex: none;
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: currentColor;
}
</style>
