<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import {
  ArrowBack,
  ChatbubbleEllipsesOutline,
  CheckmarkCircle,
  CardOutline,
  FlashOutline,
} from '@vicons/ionicons5'

defineProps<{
  eventName: string
  photoCount: number
}>()

const router = useRouter()
</script>

<template>
  <div class="state-page">
    <div class="state-page__content">
      <div class="state-page__hero">
        <span class="state-page__code">OK</span>
        <div class="state-page__icon state-page__icon--success">
          <NIcon :component="CheckmarkCircle" :size="64" color="#fff" />
        </div>
      </div>

      <h1 class="state-page__title">¡Pedido recibido!</h1>
      <p class="state-page__description">
        Tu selección de <strong>{{ photoCount }} foto{{ photoCount !== 1 ? 's' : '' }}</strong> del
        evento <strong>{{ eventName }}</strong> fue registrada correctamente. Te contactaremos
        pronto por WhatsApp.
      </p>

      <div class="state-page__actions">
        <NButton type="primary" size="large" @click="router.push('/')">
          <template #icon><NIcon :component="ArrowBack" /></template>
          Volver al inicio
        </NButton>
      </div>

      <div class="state-page__cards">
        <div class="state-page__card">
          <div class="state-page__card-icon">
            <NIcon :component="ChatbubbleEllipsesOutline" :size="24" color="#105080" />
          </div>
          <p class="state-page__card-title">Te contactamos</p>
          <p class="state-page__card-desc">Vía WhatsApp para confirmar tu pedido</p>
        </div>
        <div class="state-page__card">
          <div class="state-page__card-icon">
            <NIcon :component="CardOutline" :size="24" color="#105080" />
          </div>
          <p class="state-page__card-title">Coordinas el pago</p>
          <p class="state-page__card-desc">Transferencia o depósito bancario</p>
        </div>
        <div class="state-page__card">
          <div class="state-page__card-icon state-page__card-icon--green">
            <NIcon :component="FlashOutline" :size="24" color="#18a058" />
          </div>
          <p class="state-page__card-title">Recibes tus fotos</p>
          <p class="state-page__card-desc">En alta calidad sin marca de agua</p>
        </div>
      </div>
    </div>

    <div class="state-page__mountain" />
  </div>
</template>

<style scoped src="./order-confirmation.css" />
