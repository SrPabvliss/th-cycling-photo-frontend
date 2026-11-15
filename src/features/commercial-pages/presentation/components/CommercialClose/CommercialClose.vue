<script setup lang="ts">
import { computed } from 'vue'

import { CONTACT_EMAIL, contactMailHref, type CommercialTopic } from '@/shared/constants/commercial'
import WhatsAppLink from '../WhatsAppLink/WhatsAppLink.vue'

// Navy closing of a commercial page: one last call to write, with the address written out.
const props = defineProps<{ topic: CommercialTopic; title: string; text: string }>()

const mailHref = computed(() => contactMailHref(props.topic))
</script>

<template>
  <div class="commercial-close">
    <div class="commercial-close__inner">
      <h2 class="commercial-close__title">{{ title }}</h2>
      <p class="commercial-close__text">{{ text }}</p>
      <WhatsAppLink :topic="topic" label="Escribir por WhatsApp" />
      <p class="commercial-close__mail">
        O por correo: <a :href="mailHref">{{ CONTACT_EMAIL }}</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.commercial-close {
  --tt-focus-ring: var(--tt-on-navy);
  background: var(--tt-navy);
  color: var(--tt-on-navy);
}

.commercial-close__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: calc(var(--tt-space-3) + var(--tt-space-1) / 2);
  max-inline-size: var(--tt-container-max);
  margin-inline: auto;
  padding: var(--tt-space-7) var(--tt-space-4);
}

.commercial-close__title {
  margin: 0;
  font-family: var(--tt-font-display);
  font-stretch: var(--tt-display-stretch);
  font-size: clamp(
    var(--tt-type-display-s-size),
    3.6vw,
    calc(var(--tt-type-display-m-size) + var(--tt-space-2) - 2px)
  );
  font-weight: var(--tt-type-display-m-weight);
  line-height: 1.06;
  text-transform: uppercase;
  text-wrap: balance;
  overflow-wrap: break-word;
}

.commercial-close__text {
  max-inline-size: 56ch;
  margin: 0;
  color: var(--tt-on-navy-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

.commercial-close__mail {
  margin: 0;
  color: var(--tt-on-navy-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
  overflow-wrap: anywhere;
}

.commercial-close__mail a {
  color: var(--tt-on-navy);
  font-weight: var(--tt-type-title-weight);
}

@media (min-width: 768px) {
  .commercial-close__inner {
    padding-inline: var(--tt-space-6);
  }
}
</style>
