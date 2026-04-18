<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBack, TimeOutline } from '@vicons/ionicons5'

const router = useRouter()
</script>

<template>
  <div class="state-page">
    <div class="state-page__content">
      <div class="state-page__hero">
        <span class="state-page__code">EXP</span>
        <div class="state-page__icon state-page__icon--expired">
          <NIcon :component="TimeOutline" :size="56" color="#fff" />
        </div>
      </div>

      <h1 class="state-page__title">Este enlace ha expirado</h1>
      <p class="state-page__description">
        El enlace de preview ya no está disponible. Contacta al fotógrafo para solicitar uno nuevo.
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

<style scoped src="./preview-expired.css" />
