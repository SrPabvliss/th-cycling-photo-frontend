<script setup lang="ts">
const props = defineProps<{
  mode: 'login' | 'register'
}>()

const content = {
  login: {
    eyebrow: 'Acceso · Clientes & equipo',
    titleHtml: 'Tu archivo<br>de <em>cada línea</em><br>de salida.',
    blurb:
      'Accede a las fotos de tu competencia, guarda tu pedido y recibe alertas cuando subamos nuevas galerías.',
  },
  register: {
    eyebrow: 'Registro · Nueva cuenta',
    titleHtml: 'Empieza a<br>encontrar <em>tus</em><br>fotos.',
    blurb:
      'Crea tu cuenta para solicitar fotos de competencia y recibir alertas de nuevos eventos.',
  },
}
</script>

<template>
  <aside class="auth-side">
    <div class="auth-side__bg" />
    <div class="auth-side__grid" />

    <!-- Top -->
    <div class="auth-side__content auth-side__top">
      <RouterLink to="/" class="auth-side__logo">
        <img src="/titan-logo.png" alt="Titan TV" />
        <div class="auth-side__wordmark">
          TITAN TV
          <small>DOWNHILL MEDIA · EC</small>
        </div>
      </RouterLink>
      <div class="auth-side__meta">
        <div class="auth-side__meta-loc">Papallacta · 3,250 msnm</div>
        <div>Temporada 2026 · Fecha 03</div>
      </div>
    </div>

    <!-- Hero -->
    <div class="auth-side__content auth-side__hero">
      <div class="auth-side__eyebrow">{{ content[props.mode].eyebrow }}</div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <h2 class="auth-side__title" v-html="content[props.mode].titleHtml" />
      <p class="auth-side__blurb">{{ content[props.mode].blurb }}</p>
    </div>

    <!-- Stats -->
    <div class="auth-side__content auth-side__stats">
      <div class="auth-side__stat">
        <div class="auth-side__stat-label">Eventos</div>
        <div class="auth-side__stat-value">24</div>
      </div>
      <div class="auth-side__stat">
        <div class="auth-side__stat-label">Fotos</div>
        <div class="auth-side__stat-value">42 <small>K</small></div>
      </div>
      <div class="auth-side__stat">
        <div class="auth-side__stat-label">Desde</div>
        <div class="auth-side__stat-value">2015</div>
      </div>
    </div>
  </aside>
</template>

<style scoped src="./styles/auth-side-panel.css" />
