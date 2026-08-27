<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBack, SearchOutline } from '@vicons/ionicons5'

const router = useRouter()
</script>

<template>
  <div class="state-page">
    <div class="state-page__content">
      <div class="state-page__hero">
        <span class="state-page__code">404</span>
        <div class="state-page__icon state-page__icon--not-found">
          <NIcon :component="SearchOutline" :size="56" color="#fff" />
        </div>
      </div>

      <h1 class="state-page__title">Enlace no encontrado</h1>
      <p class="state-page__description">
        Este enlace de preview no existe o fue eliminado. Verifica que la dirección sea correcta o
        contacta al fotógrafo para obtener un nuevo enlace.
      </p>

      <div class="state-page__actions">
        <NButton type="primary" size="large" @click="router.push('/')">
          <template #icon><NIcon :component="ArrowBack" /></template>
          Volver al inicio
        </NButton>
      </div>
    </div>

    <div class="state-page__mountain" />
  </div>
</template>

<style scoped src="./preview-not-found.css" />
