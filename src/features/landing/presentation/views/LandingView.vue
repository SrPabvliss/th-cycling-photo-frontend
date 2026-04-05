<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowForward } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import { usePublicEventsQuery } from '@/features/public-gallery/composables/queries/use-public-events'
import { PUBLIC_GALLERY_ROUTE_NAMES } from '@/features/public-gallery/routes'
import PublicEventCard from '@/features/public-gallery/presentation/components/PublicEventCard/PublicEventCard.vue'

const router = useRouter()
const { data: events } = usePublicEventsQuery()

const featuredEvent = computed(() => events.value?.find((e) => e.isFeatured))
const recentEvents = computed(() => events.value?.filter((e) => !e.isFeatured).slice(0, 3) ?? [])

function handleEventClick(eventId: string) {
  router.push({ name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_GALLERY, params: { eventId } })
}
</script>

<template>
  <PublicLayout>
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <TitanLogo :size="64" />
        <h1 class="hero-title">
          Poderosos dioses que<br />
          gobiernan las montañas
        </h1>
        <p class="hero-subtitle">
          de los Andes Ecuatorianos con sus
          <span class="hero-accent">caballos de acero</span>.
        </p>
        <NButton type="primary" size="large" @click="router.push('/gallery')">
          Busca tus fotos
          <template #icon>
            <NIcon :component="ArrowForward" />
          </template>
        </NButton>
      </div>
    </section>

    <!-- Featured event -->
    <section v-if="featuredEvent" class="events-section">
      <div class="events-inner">
        <h2 class="events-section__title">Evento destacado</h2>
        <PublicEventCard :event="featuredEvent" featured @click="handleEventClick" />
      </div>
    </section>

    <!-- Recent events -->
    <section v-if="recentEvents.length > 0" class="events-section events-section--light">
      <div class="events-inner">
        <div class="events-section__header">
          <h2 class="events-section__title">Eventos recientes</h2>
          <NButton text type="primary" @click="router.push('/gallery')">
            Ver todos
            <template #icon><NIcon :component="ArrowForward" /></template>
          </NButton>
        </div>
        <div class="events-grid">
          <PublicEventCard
            v-for="event in recentEvents"
            :key="event.id"
            :event="event"
            @click="handleEventClick"
          />
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="about">
      <div class="about-inner">
        <div class="about-image">
          <div class="about-image-placeholder">
            <span class="about-image-caption">Capturando la velocidad pura de los Andes.</span>
          </div>
        </div>
        <div class="about-text">
          <span class="about-label">11 AÑOS DE HISTORIA</span>
          <h2 class="about-title">Cobertura profesional para eventos de downhill ecuatorianos.</h2>
          <p class="about-description">
            Titan TV es un productor de contenido ecuatoriano especializado en ciclismo de montaña
            downhill. Procesamos cientos de fotografias despues de cada competencia, asegurando que
            cada ciclista tenga su momento capturado en alta calidad.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section id="cta" class="cta">
      <div class="cta-overlay">
        <h2 class="cta-title">Listo para encontrar tu carrera?</h2>
        <p class="cta-subtitle">
          Busca por tu numero de dorsal, color de casco o marca de bicicleta para encontrar todas
          tus fotos profesionales de los ultimos eventos.
        </p>
        <NButton size="large" ghost class="cta-button" @click="router.push('/gallery')">
          Buscar en la biblioteca
        </NButton>
      </div>
    </section>
  </PublicLayout>
</template>

<style scoped src="./styles/landing-view.css" />
