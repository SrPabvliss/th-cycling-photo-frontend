<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import {
  AlertCircleOutline,
  CheckmarkCircleOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
} from '@vicons/ionicons5'

withDefaults(
  defineProps<{
    listos?: number
    total?: number
    cta?: string
    back?: boolean
    dis?: boolean
    nota?: string | null
  }>(),
  { cta: 'Continuar', back: false, dis: false, nota: null },
)

const emit = defineEmits<{
  next: []
  back: []
}>()
</script>

<template>
  <div class="ce-foot">
    <span v-if="listos !== undefined" class="ce-progress" :class="{ ok: listos === total }">
      <NIcon
        :component="listos === total ? CheckmarkCircleOutline : AlertCircleOutline"
        :size="15"
      />
      {{ listos }} de {{ total }} listos
    </span>
    <span v-if="nota" class="ce-footnote">{{ nota }}</span>
    <div class="ce-foot-spacer" />
    <NButton v-if="back" class="ce-foot__back" @click="emit('back')">
      <template #icon><NIcon :component="ChevronBackOutline" /></template>
      Atrás
    </NButton>
    <NButton
      type="primary"
      class="ce-foot__cta"
      icon-placement="right"
      :disabled="dis"
      @click="emit('next')"
    >
      {{ cta }}
      <template v-if="!dis" #icon><NIcon :component="ChevronForwardOutline" /></template>
    </NButton>
  </div>
</template>

<style scoped src="./wizard-footer.css" />
