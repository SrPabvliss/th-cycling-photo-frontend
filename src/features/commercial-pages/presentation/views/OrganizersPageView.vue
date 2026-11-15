<script setup lang="ts">
import { usePageMeta } from '@/shared/composables/use-page-meta'
import { PLATFORM_FIGURES } from '../../constants/platform-figures'
import CommercialClose from '../components/CommercialClose/CommercialClose.vue'
import CommercialHero from '../components/CommercialHero/CommercialHero.vue'
import type { PhoneBlock } from '../components/PhoneMockup/phone-blocks'
import StepList, { type ICommercialStep } from '../components/StepList/StepList.vue'

// For organizers: how their event's photos get sold on Titan and how to start. Static.
usePageMeta({
  title: 'Publica tu evento · Titan TV',
  description:
    'Sube las fotos de tu carrera a Titan TV: cada corredor se busca por su placa, paga y descarga. Escríbenos por WhatsApp o por correo.',
})

const HERO_PHONES: [PhoneBlock[], PhoneBlock[]] = [
  [{ kind: 'bar' }, { kind: 'field', text: '# 45' }, { kind: 'grid', cells: 6 }],
  [{ kind: 'bar' }, { kind: 'big' }, { kind: 'row' }, { kind: 'field', text: 'Confirmar pedido' }],
]

const STEPS: ICommercialStep[] = [
  {
    title: 'Subes las fotos',
    text: 'Creas tu evento y cargas todo desde tu panel.',
    phone: [{ kind: 'bar' }, { kind: 'big' }, { kind: 'row' }],
  },
  {
    title: 'Titan lee las placas',
    text: 'Cada foto queda ligada al número del corredor. Sin etiquetar a mano.',
    phone: [
      { kind: 'bar' },
      { kind: 'grid', cells: 9 },
      { kind: 'field', text: '# 45 · # 112 · # 7' },
    ],
  },
  {
    title: 'Cada quien se busca y compra',
    text: 'Escribe su placa, ve sus fotos y paga. Si lleva más, paga menos por foto.',
    phone: [{ kind: 'bar' }, { kind: 'field', text: '# 45' }, { kind: 'grid', cells: 4 }],
  },
  {
    title: 'Descarga sus originales',
    text: 'Recibe un enlace con sus fotos sin marca de agua. Tú ves cada pedido.',
    phone: [{ kind: 'bar' }, { kind: 'big' }, { kind: 'field', text: 'Descargar' }],
  },
]

const INCLUDED: { title: string; text: string }[] = [
  { title: 'Tu evento en vitrina', text: 'Galería propia con portada, fecha y lugar.' },
  { title: 'Búsqueda por placa', text: 'El corredor llega a sus fotos en segundos.' },
  { title: 'Fotos protegidas', text: 'Marca de agua hasta que se paga.' },
  { title: 'Más fotos, mejor precio', text: 'Tú pones los tramos; el carrito hace la cuenta.' },
  { title: 'Cobro por transferencia', text: 'El corredor recibe los datos y tú confirmas.' },
  { title: 'Entrega automática', text: 'Un enlace de descarga, sin mandar archivos a mano.' },
  { title: 'Pedidos a la vista', text: 'Qué se pidió, qué se pagó y qué se entregó.' },
  {
    title: 'Enlaces para compartir',
    text: 'Mándale a un corredor sus fotos, listas para comprar.',
  },
]

const FIGURES = [
  PLATFORM_FIGURES.events,
  PLATFORM_FIGURES.photos,
  PLATFORM_FIGURES.delivered,
  PLATFORM_FIGURES.accounts,
]
</script>

<template>
  <div class="commercial-page">
    <CommercialHero
      topic="organizador"
      eyebrow="Para organizadores"
      title="Tu carrera termina en la meta. Las fotos siguen vendiendo."
      lead="Sube las fotos de tu evento a Titan TV. Cada corredor se busca por su número de placa, paga y descarga. Sin mandar fotos una por una."
      action="Quiero publicar mi evento"
      :phones="HERO_PHONES"
      :figures="FIGURES"
    />

    <section class="commercial-page__section">
      <div class="commercial-page__band">
        <h2 class="commercial-page__heading">De la meta al teléfono del corredor</h2>
        <p class="commercial-page__sub">Cuatro pasos. Tú solo haces el primero.</p>
        <StepList :steps="STEPS" />
      </div>
    </section>

    <section class="commercial-page__section commercial-page__section--sunken">
      <div class="commercial-page__band">
        <h2 class="commercial-page__heading">Todo resuelto, nada que armar</h2>
        <p class="commercial-page__sub">
          La misma plataforma con la que Titan TV vende sus propias carreras.
        </p>
        <ul class="organizers-page__included">
          <li v-for="item in INCLUDED" :key="item.title" class="organizers-page__item">
            <div>
              <b>{{ item.title }}</b>
              <span>{{ item.text }}</span>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <CommercialClose
      topic="organizador"
      title="Cuéntanos de tu carrera"
      text="Fecha, lugar y cuántos corredores esperas. Te respondemos con una propuesta."
    />
  </div>
</template>

<style scoped src="./styles/commercial-page.css" />

<style scoped>
.organizers-page__included {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--tt-space-3) var(--tt-space-6);
  margin: 0;
  padding: 0;
  list-style: none;
}

.organizers-page__item {
  display: flex;
  align-items: flex-start;
  gap: var(--tt-space-3);
  padding-block-end: var(--tt-space-3);
  border-block-end: 1px solid var(--tt-line);
}

.organizers-page__item::before {
  content: '';
  flex: none;
  inline-size: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  block-size: calc(var(--tt-space-2) + var(--tt-space-1) / 2);
  margin-block-start: calc(var(--tt-space-2) - 1px);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary);
}

.organizers-page__item b {
  display: block;
  font-size: var(--tt-type-title-size);
  line-height: var(--tt-type-body-line);
  font-weight: var(--tt-type-eyebrow-weight);
}

.organizers-page__item span {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

@media (min-width: 641px) {
  .organizers-page__included {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
