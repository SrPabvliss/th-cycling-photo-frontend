<script setup lang="ts">
import {
  ILLUSTRATION_VIEW_BOX,
  ILLUSTRATIONS,
  type IllustrationKey,
} from '@/shared/components/empty-state/illustrations'
import { usePageMeta } from '@/shared/composables/use-page-meta'
import { BRAND_SCREEN_GROUPS } from '../../constants/brand-screens'
import { PLATFORM_FIGURES } from '../../constants/platform-figures'
import CommercialClose from '../components/CommercialClose/CommercialClose.vue'
import CommercialHero from '../components/CommercialHero/CommercialHero.vue'
import type { PhoneBlock } from '../components/PhoneMockup/phone-blocks'
import ScreenCarousel from '../components/ScreenCarousel/ScreenCarousel.vue'
import StepList, { type ICommercialStep } from '../components/StepList/StepList.vue'

// For brands: where the house ads go and how to get one. Static: no data, no form.
usePageMeta({
  title: 'Anuncia tu marca · Titan TV',
  description:
    'Pon tu marca frente a los ciclistas que buscan sus fotos de carrera en Titan TV. Escríbenos por WhatsApp o por correo.',
})

const BETWEEN_EVENTS: PhoneBlock[] = [
  { kind: 'bar' },
  { kind: 'row' },
  { kind: 'row' },
  { kind: 'row' },
  { kind: 'mark', shape: 'band', text: 'Tu marca aquí' },
  { kind: 'row' },
  { kind: 'row' },
]
const amongPhotos = (cells: number): PhoneBlock[] => [
  { kind: 'bar' },
  { kind: 'grid', cells, markAt: 7, markText: 'Tu marca' },
]

const HERO_PHONES: [PhoneBlock[], PhoneBlock[]] = [BETWEEN_EVENTS, amongPhotos(12)]

const AUDIENCE: { title: string; text: string; illustration: IllustrationKey }[] = [
  {
    title: 'Solo gente que pedalea',
    text: 'Corredores, equipos y familias. Nadie llega aquí por accidente.',
    illustration: 'sinResultados',
  },
  {
    title: 'Miran con calma',
    text: 'Buscar tu propia foto toma minutos, no segundos. Tu marca acompaña todo ese rato.',
    illustration: 'fotosListas',
  },
  {
    title: 'Regresan en cada carrera',
    text: 'Cada evento nuevo los trae de vuelta, y tu marca los recibe otra vez.',
    illustration: 'sinEventos',
  },
]

const STEPS: ICommercialStep[] = [
  { title: 'Nos escribes', text: 'Un mensaje por WhatsApp basta.' },
  { title: 'Eliges dónde y cuánto tiempo', text: 'Te pasamos espacios, fechas y precios claros.' },
  { title: 'Sales en la próxima carrera', text: 'Nos mandas tu arte o lo armamos contigo.' },
]

const FIGURES = [
  PLATFORM_FIGURES.events,
  PLATFORM_FIGURES.photos,
  PLATFORM_FIGURES.accounts,
  PLATFORM_FIGURES.provinces,
]
</script>

<template>
  <div class="commercial-page">
    <CommercialHero
      topic="marca"
      eyebrow="Publicidad en Titan TV"
      title="Donde el ciclista se busca, te encuentra a ti"
      lead="Después de cada carrera, los corredores entran a Titan TV a buscar sus fotos. No pasan de largo: revisan una por una. Pon tu marca en ese recorrido."
      action="Quiero mi espacio"
      :phones="HERO_PHONES"
      :figures="FIGURES"
    />

    <section class="commercial-page__section">
      <div class="commercial-page__band">
        <h2 class="commercial-page__heading">
          <span class="brands-page__line">Imposible no verte.</span>{{ ' ' }}
          <span class="brands-page__line">Difícil no elegirte.</span>
        </h2>
        <p class="commercial-page__sub">
          Entre sus fotos, en su búsqueda, en su carrito. Donde ellos miran, estás tú.
        </p>
        <ScreenCarousel :groups="BRAND_SCREEN_GROUPS" />
      </div>
    </section>

    <section class="commercial-page__section commercial-page__section--sunken">
      <div class="commercial-page__band">
        <h2 class="commercial-page__heading">Un público que ya es el tuyo</h2>
        <p class="commercial-page__sub">
          Bicicletas, cascos, repuestos, hidratación, seguros. Aquí no hay que adivinar quién está
          mirando.
        </p>
        <div class="brands-page__audience">
          <div v-for="group in AUDIENCE" :key="group.title" class="brands-page__group">
            <!-- Markup generated from the design files by scripts/sync-illustrations.mjs. -->
            <!-- eslint-disable vue/no-v-html -->
            <svg
              class="brands-page__illustration"
              :data-illustration="group.illustration"
              :viewBox="ILLUSTRATION_VIEW_BOX"
              fill="none"
              aria-hidden="true"
              v-html="ILLUSTRATIONS[group.illustration]"
            />
            <!-- eslint-enable vue/no-v-html -->
            <h3 class="commercial-page__item-title">{{ group.title }}</h3>
            <p class="commercial-page__item-text">{{ group.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="commercial-page__section">
      <div class="commercial-page__band">
        <h2 class="commercial-page__heading">Tu marca al aire en tres pasos</h2>
        <p class="commercial-page__sub">Sin agencias ni trámites.</p>
        <StepList :steps="STEPS" />
      </div>
    </section>

    <CommercialClose
      topic="marca"
      title="Que la próxima carrera te encuentre adentro"
      text="Escríbenos hoy y te respondemos con espacios y precios."
    />
  </div>
</template>

<style scoped src="./styles/commercial-page.css" />

<style scoped>
.brands-page__line {
  display: block;
}

.brands-page__audience {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--tt-space-6) - var(--tt-space-1));
}

.brands-page__group {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  min-inline-size: 0;
}

.brands-page__illustration {
  display: block;
  inline-size: calc(var(--tt-space-8) + var(--tt-space-7));
  block-size: auto;
  margin-block-end: var(--tt-space-1);
}

@media (min-width: 761px) {
  .brands-page__audience {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
