<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NCard, NFlex } from 'naive-ui'

import FrozenBadge from '../FrozenBadge/FrozenBadge.vue'
import FrozenInfoModal from '../FrozenInfoModal/FrozenInfoModal.vue'

defineProps<{
  message: string
}>()

const showInfo = ref(false)
</script>

<template>
  <NCard class="frozen-panel">
    <NFlex vertical align="center" :size="12">
      <FrozenBadge />
      <p class="frozen-panel__text">{{ message }}</p>
      <NFlex :size="8">
        <NButton @click="showInfo = true">¿Qué significa?</NButton>
        <slot />
      </NFlex>
    </NFlex>
  </NCard>

  <FrozenInfoModal v-model:show="showInfo" />
</template>

<style scoped src="./frozen-blocked-panel.css"></style>
