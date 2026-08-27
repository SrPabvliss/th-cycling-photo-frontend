<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { BanOutline } from '@vicons/ionicons5'

const props = defineProps<{
  eventsTotal: number | null
}>()

const hint = computed(() =>
  props.eventsTotal != null
    ? `Tu contrato vigente ya consumió sus ${props.eventsTotal} eventos: no puedes crear otro hasta renovarlo. Escríbenos para emitir un contrato nuevo.`
    : 'Tu contrato vigente ya consumió su cupo de eventos: no puedes crear otro hasta renovarlo. Escríbenos para emitir un contrato nuevo.',
)
</script>

<template>
  <div class="ees-headsup ees-headsup--red" data-test="no-quota-note">
    <NIcon :component="BanOutline" :size="15" />
    <span><b>Sin cupo de eventos.</b> {{ hint }}</span>
  </div>
</template>

<style scoped src="./event-empty-states.css" />
