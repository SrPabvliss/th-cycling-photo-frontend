<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { BanOutline, HourglassOutline } from '@vicons/ionicons5'

const props = defineProps<{
  variant: 'only-invites' | 'crisis'
}>()

const icon = computed(() => (props.variant === 'crisis' ? BanOutline : HourglassOutline))
</script>

<template>
  <div
    class="oes-headsup"
    :class="{ 'oes-headsup--red': variant === 'crisis' }"
    data-test="heads-up"
  >
    <NIcon :component="icon" :size="15" />
    <span v-if="variant === 'crisis'">
      <b>La mayoría de los organizadores está sin cupo.</b>
      Ninguno de ellos puede crear eventos hasta renovar.
    </span>
    <span v-else>
      <b>Ningún contrato se ha aceptado todavía.</b>
      Los organizadores aparecerán en cuanto alguien acepte su invitación.
    </span>
  </div>
</template>

<style scoped src="./organizer-empty-states.css" />
