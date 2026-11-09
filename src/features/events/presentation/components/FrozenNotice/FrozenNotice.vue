<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'

import FrozenBadge from '../FrozenBadge/FrozenBadge.vue'
import FrozenInfoModal from '../FrozenInfoModal/FrozenInfoModal.vue'

const showInfo = ref(false)
</script>

<template>
  <span class="frozen-notice">
    <FrozenBadge />
    <NButton text type="primary" size="tiny" @click.stop="showInfo = true">
      ¿Qué significa?
    </NButton>
  </span>

  <FrozenInfoModal v-model:show="showInfo" />
</template>

<style scoped src="./frozen-notice.css"></style>
