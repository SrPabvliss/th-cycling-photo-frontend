<script setup lang="ts">
import { computed } from 'vue'

import { contactMailHref, type CommercialTopic } from '@/shared/constants/commercial'
import { FIGURES_AS_OF, type PlatformFigure } from '../../../constants/platform-figures'
import PhoneMockup from '../PhoneMockup/PhoneMockup.vue'
import type { PhoneBlock } from '../PhoneMockup/phone-blocks'
import WhatsAppLink from '../WhatsAppLink/WhatsAppLink.vue'

// Navy opening of a commercial page: what it offers, how to write, two phones and the figures.
const props = defineProps<{
  topic: CommercialTopic
  eyebrow: string
  title: string
  lead: string
  action: string
  phones: [PhoneBlock[], PhoneBlock[]]
  figures: PlatformFigure[]
}>()

const mailHref = computed(() => contactMailHref(props.topic))
</script>

<template>
  <div class="commercial-hero">
    <div class="commercial-hero__main">
      <div class="commercial-hero__text">
        <p class="commercial-hero__eyebrow">{{ eyebrow }}</p>
        <h1 class="commercial-hero__title">{{ title }}</h1>
        <p class="commercial-hero__lead">{{ lead }}</p>
        <div class="commercial-hero__actions">
          <WhatsAppLink :topic="topic" :label="action" />
          <a class="commercial-hero__mail" :href="mailHref">Escribir por correo</a>
        </div>
      </div>
      <div class="commercial-hero__art" aria-hidden="true">
        <PhoneMockup v-for="(blocks, index) in phones" :key="index" :blocks="blocks" />
      </div>
    </div>
    <div class="commercial-hero__figures-band">
      <dl class="commercial-hero__figures">
        <div v-for="figure in figures" :key="figure.label" data-test="figure">
          <dt>{{ figure.value }}</dt>
          <dd>{{ figure.label }}</dd>
        </div>
      </dl>
      <p class="commercial-hero__as-of">Cifras de la plataforma a {{ FIGURES_AS_OF }}.</p>
    </div>
  </div>
</template>

<style scoped>
.commercial-hero {
  --tt-focus-ring: var(--tt-on-navy);
  background: var(--tt-navy);
  color: var(--tt-on-navy);
}

.commercial-hero__main,
.commercial-hero__figures-band {
  max-inline-size: var(--tt-container-max);
  margin-inline: auto;
  padding-inline: var(--tt-space-4);
}

.commercial-hero__main {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--tt-space-6) - var(--tt-space-1));
  align-items: center;
  padding-block: var(--tt-space-6);
}

.commercial-hero__eyebrow {
  margin: 0;
  color: var(--tt-on-navy-eyebrow);
  font-size: var(--tt-type-eyebrow-size);
  line-height: var(--tt-type-eyebrow-line);
  font-weight: var(--tt-type-eyebrow-weight);
  letter-spacing: var(--tt-type-eyebrow-tracking);
  text-transform: uppercase;
}

.commercial-hero__title {
  margin: calc(var(--tt-space-2) + var(--tt-space-1) / 2) 0
    calc(var(--tt-space-3) + var(--tt-space-1) / 2);
  font-family: var(--tt-font-display);
  font-stretch: var(--tt-display-stretch);
  font-size: clamp(
    var(--tt-type-display-m-size),
    5.2vw,
    calc(var(--tt-type-display-l-size) + var(--tt-space-3))
  );
  font-weight: var(--tt-type-display-l-weight);
  line-height: 1.02;
  text-transform: uppercase;
  text-wrap: balance;
  overflow-wrap: break-word;
}

.commercial-hero__lead {
  max-inline-size: 52ch;
  margin: 0 0 var(--tt-space-5);
  color: var(--tt-on-navy-muted);
  font-size: calc(var(--tt-type-body-size) + var(--tt-space-1) - 1px);
  line-height: calc(var(--tt-space-6) - var(--tt-space-1));
}

.commercial-hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tt-space-3);
}

.commercial-hero__mail {
  display: inline-flex;
  align-items: center;
  min-block-size: var(--tt-control-l);
  padding-inline: calc(var(--tt-space-5) - var(--tt-space-1) / 2);
  border-radius: calc(var(--tt-radius-m) + var(--tt-space-1) / 2);
  box-shadow: inset 0 0 0 1.5px var(--tt-navy-line);
  color: var(--tt-on-navy);
  font-size: var(--tt-type-title-size);
  font-weight: var(--tt-type-eyebrow-weight);
  text-decoration: none;
}

.commercial-hero__mail:hover {
  background: color-mix(in srgb, var(--tt-on-navy) 8%, transparent);
}

.commercial-hero__art {
  display: flex;
  justify-content: center;
  gap: calc(var(--tt-space-4) + var(--tt-space-1) / 2);
}

.commercial-hero__art > :deep(.phone-mockup) {
  max-inline-size: calc(var(--tt-space-8) * 2 + var(--tt-space-7) - var(--tt-space-1) / 2);
  margin-inline: 0;
}

.commercial-hero__art > :deep(.phone-mockup:nth-child(2)) {
  margin-block-start: calc(var(--tt-space-6) + var(--tt-space-1) / 2);
}

.commercial-hero__figures {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  border-block-start: 1px solid var(--tt-navy-line);
}

.commercial-hero__figures > div {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tt-space-1) / 2);
  min-inline-size: 0;
  padding: calc(var(--tt-space-5) - var(--tt-space-1)) var(--tt-space-4)
    calc(var(--tt-space-5) - var(--tt-space-1) / 2) 0;
}

.commercial-hero__figures dt {
  font-family: var(--tt-font-display);
  font-stretch: var(--tt-display-stretch);
  font-size: clamp(var(--tt-type-display-m-size), 4vw, var(--tt-type-display-l-size));
  font-weight: var(--tt-type-display-l-weight);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.commercial-hero__figures dd {
  margin: 0;
  color: var(--tt-on-navy-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.commercial-hero__as-of {
  margin: 0;
  padding-block-end: var(--tt-space-5);
  color: var(--tt-on-navy-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

@media (min-width: 641px) {
  .commercial-hero__figures {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .commercial-hero__main,
  .commercial-hero__figures-band {
    padding-inline: var(--tt-space-6);
  }
}

@media (min-width: 821px) {
  .commercial-hero__main {
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
    gap: calc(var(--tt-space-6) + var(--tt-space-2));
    padding-block: var(--tt-space-7) calc(var(--tt-space-6) + var(--tt-space-2));
  }

  .commercial-hero__art > :deep(.phone-mockup) {
    max-inline-size: calc(var(--tt-space-8) * 3 + var(--tt-space-5) + var(--tt-space-1));
  }
}
</style>
