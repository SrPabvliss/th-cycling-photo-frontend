<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowForward } from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'

const router = useRouter()
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
        <NButton type="primary" size="large" @click="router.push('/login')">
          Busca tus fotos
          <template #icon>
            <NIcon :component="ArrowForward" />
          </template>
        </NButton>
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
          <div class="about-features">
            <div class="about-feature">
              <h3 class="about-feature-title">Fotografia profesional</h3>
              <p class="about-feature-text">
                Capturas de alta velocidad y alta resolucion en cada salto, curva y meta.
              </p>
            </div>
            <div class="about-feature">
              <h3 class="about-feature-title">Clasificacion inteligente</h3>
              <p class="about-feature-text">
                Fotos organizadas por numero de dorsal y colores de equipamiento para facil
                busqueda.
              </p>
            </div>
          </div>
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
        <NButton size="large" ghost class="cta-button" @click="router.push('/login')">
          Buscar en la biblioteca
        </NButton>
      </div>
    </section>
  </PublicLayout>
</template>

<style scoped src="./styles/landing-view.css" />
