<script setup lang="ts">
import { computed, ref } from 'vue'

import EventForm from '../../../components/EventForm/EventForm.vue'
import type { IEventFormData, IEventFormExtra } from '../../../../types/event-form.types'

defineProps<{
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  submit: [data: IEventFormData, extra: IEventFormExtra]
}>()

const formRef = ref<InstanceType<typeof EventForm> | null>(null)

defineExpose({
  submit: () => formRef.value?.submit(),
  canSubmit: computed(() => formRef.value?.canSubmit ?? false),
})
</script>

<template>
  <div class="details-step">
    <div class="ce-sechead">
      <div>
        <h2>Detalles del evento</h2>
        <p>Lo que identifica al evento en la plataforma y en su página pública.</p>
      </div>
    </div>
    <EventForm
      ref="formRef"
      hide-footer
      :is-submitting="isSubmitting"
      @submit="(data, extra) => emit('submit', data, extra)"
    />
  </div>
</template>

<style scoped src="./details-step.css" />
