<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowForward } from '@vicons/ionicons5'

import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import heroImage from '@/assets/brand/hero-downhill.webp'
import aboutImage from '@/assets/brand/about-experience.webp'
import ctaImage from '@/assets/brand/cta-explore.webp'
import { PublicEventCard, usePublicEventsQuery } from '@/shared/public-events'

const router = useRouter()
const { events } = usePublicEventsQuery()

// The api sends the list newest first.
const recentEvents = computed(() => events.value.slice(0, 3))
</script>

<template>
  <!-- Hero Section -->
  <section class="hero">
    <img
      :src="heroImage"
      alt=""
      aria-hidden="true"
      class="hero-bg"
      fetchpriority="high"
      decoding="async"
    />
    <div class="hero-overlay" />
    <div class="hero-content">
      <TitanLogo :size="200" variant="full" />
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
        <PublicEventCard v-for="event in recentEvents" :key="event.slug" :event="event" />
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="about">
    <div class="about-inner">
      <div class="about-image">
        <img
          :src="aboutImage"
          alt="Ciclista de downhill ejecutando un truco aéreo"
          class="about-image-photo"
          loading="lazy"
          decoding="async"
        />
        <span class="about-image-caption">Capturando la velocidad pura de los Andes.</span>
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
    <img :src="ctaImage" alt="" aria-hidden="true" class="cta-bg" loading="lazy" decoding="async" />
    <div class="cta-overlay">
      <h2 class="cta-title">Listo para encontrar tu carrera?</h2>
      <p class="cta-subtitle">
        Busca por tu numero de placa, color de casco o marca de bicicleta para encontrar todas tus
        fotos profesionales de los ultimos eventos.
      </p>
      <NButton size="large" ghost class="cta-button" @click="router.push('/gallery')">
        Buscar en la biblioteca
      </NButton>
    </div>
  </section>
</template>

<style scoped src="./styles/landing-view.css" />
