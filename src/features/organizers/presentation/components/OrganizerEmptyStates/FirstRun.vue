<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { AddOutline, BusinessOutline } from '@vicons/ionicons5'

const props = defineProps<{
  canIssue?: boolean
}>()

const emit = defineEmits<{
  issue: []
}>()

function handleIssue() {
  emit('issue')
}
</script>

<template>
  <div class="oes-empty oes-empty--tall">
    <span class="oes-empty__icon">
      <NIcon :component="BusinessOutline" :size="22" />
    </span>
    <b>Todavía no hay organizadores</b>
    <span class="oes-empty__hint">
      Un organizador aparece aquí cuando alguien acepta un contrato. Emite el primero y el titular
      lo verá al abrir su enlace.
    </span>
    <NButton
      v-if="props.canIssue !== false"
      type="primary"
      class="oes-empty__action"
      data-test="issue-contract"
      @click="handleIssue"
    >
      <template #icon><NIcon :component="AddOutline" /></template>
      Emitir contrato
    </NButton>
  </div>
</template>

<style scoped src="./organizer-empty-states.css" />
