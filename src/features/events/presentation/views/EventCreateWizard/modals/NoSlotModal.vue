<script setup lang="ts">
import { NButton, NIcon, NModal } from 'naive-ui'
import { BanOutline, LogoWhatsapp } from '@vicons/ionicons5'

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [boolean]
  'back-to-events': []
  contact: []
}>()
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="Se acabaron los cupos"
    style="width: 460px; max-width: calc(100vw - 32px)"
    @update:show="emit('update:show', $event)"
  >
    <div class="ce-noslot" data-test="no-slot-modal">
      <p class="ce-noslot-sub">
        Alguien usó el último cupo de tu contrato mientras creabas este evento.
      </p>

      <div class="tt-notice red">
        <NIcon :component="BanOutline" :size="18" />
        <div>
          <b>El evento no se creó</b>
          Los cupos se descuentan al crear, no al empezar. Nada de lo que escribiste se guardó.
        </div>
      </div>

      <p class="tt-m-note">Si amplías el contrato, tendrás que volver a llenar el formulario.</p>
    </div>

    <template #footer>
      <div class="ce-noslot-foot">
        <NButton data-test="no-slot-back" @click="emit('back-to-events')">Volver a Eventos</NButton>
        <NButton type="primary" data-test="no-slot-contact" @click="emit('contact')">
          <template #icon><NIcon :component="LogoWhatsapp" :size="15" /></template>
          Escribir a Titan TV
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./no-slot-modal.css" />
