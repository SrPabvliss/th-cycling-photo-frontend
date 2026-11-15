<script setup lang="ts">
import {
  ILLUSTRATION_VIEW_BOX,
  ILLUSTRATIONS,
  type IllustrationKey,
} from '@/shared/components/empty-state/illustrations'
import { usePageMeta } from '@/shared/composables/use-page-meta'
import { PLATFORM_FIGURES } from '../../constants/platform-figures'
import CommercialClose from '../components/CommercialClose/CommercialClose.vue'
import CommercialHero from '../components/CommercialHero/CommercialHero.vue'
import PhoneMockup from '../components/PhoneMockup/PhoneMockup.vue'
import type { PhoneBlock } from '../components/PhoneMockup/phone-blocks'
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

const PLACES: { title: string; text: string; phone: PhoneBlock[] }[] = [
  {
    title: 'Lo primero que ven',
    text: 'Franja completa entre las carreras. Aparece al entrar y vuelve mientras bajan.',
    phone: BETWEEN_EVENTS,
  },
  {
    title: 'Entre sus fotos',
    text: 'Una celda del tamaño de una foto, repetida a lo largo de toda la galería.',
    phone: amongPhotos(15),
  },
  {
    title: 'Cuando se encuentra',
    text: 'Al lado de sus fotos, en el momento en que más atención pone.',
    phone: [
      { kind: 'bar' },
      { kind: 'field', text: '# 45' },
      { kind: 'grid', cells: 5, markAt: 4, markText: 'Tu marca' },
    ],
  },
  {
    title: 'Presentas la carrera',
    text: 'Tu nombre arriba del evento y bajo cada foto que abren.',
    phone: [
      { kind: 'mark', shape: 'strip', text: 'Presenta: tu marca' },
      { kind: 'big' },
      { kind: 'mark', shape: 'wide', text: 'Tu marca aquí' },
    ],
  },
]

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
        <h2 class="commercial-page__heading">Cuatro lugares donde nadie te salta</h2>
        <p class="commercial-page__sub">
          Tu marca va dentro del recorrido del corredor, no en una esquina de la pantalla.
        </p>
        <div class="brands-page__places">
          <div v-for="place in PLACES" :key="place.title" class="brands-page__place">
            <PhoneMockup :blocks="place.phone" />
            <div class="brands-page__place-text">
              <h3 class="commercial-page__item-title">{{ place.title }}</h3>
              <p class="commercial-page__item-text">{{ place.text }}</p>
            </div>
          </div>
        </div>
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
.brands-page__places {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--tt-space-6) - var(--tt-space-1)) var(--tt-space-5);
}

.brands-page__place {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  min-inline-size: 0;
}

.brands-page__place-text {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  text-align: center;
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

@media (min-width: 901px) {
  .brands-page__places {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
