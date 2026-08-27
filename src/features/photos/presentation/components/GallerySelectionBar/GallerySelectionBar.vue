<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber, pluralize } from '@/shared/utils/format.utils'

const props = defineProps<{
  count: number
  total: number
  phrase: string
  wholeSet: boolean
  canAssign: boolean
}>()

const emit = defineEmits<{
  'select-all': []
  'only-page': []
  clear: []
  assign: []
}>()

const title = computed(() =>
  props.wholeSet
    ? `${formatNumber(props.total)} fotos seleccionadas`
    : `${formatNumber(props.count)} ${pluralize(props.count, 'foto seleccionada', 'fotos seleccionadas')}`,
)

const showSelectAllLink = computed(() => !props.wholeSet && props.total > props.count)
</script>

<template>
  <div class="gp-selbar" :class="{ all: wholeSet }">
    <div class="gp-selbar-t">
      <b data-test="selection-title">{{ title }}</b>
      <span data-test="selection-subline">
        <template v-if="wholeSet"
          >Todas las {{ phrase }} del evento, incluidas las que no están en pantalla.</template
        >
        <template v-else
          >Solo las de esta página.
          <button
            v-if="showSelectAllLink"
            class="gp-selink"
            data-test="select-all-link"
            type="button"
            @click="emit('select-all')"
          >
            Seleccionar las {{ formatNumber(total) }} {{ phrase }}
          </button></template
        >
      </span>
    </div>
    <button
      v-if="wholeSet"
      class="tt-btn tt-btn-ghost sm"
      data-test="only-page-btn"
      type="button"
      @click="emit('only-page')"
    >
      Volver a las de esta página
    </button>
    <button
      class="tt-btn tt-btn-ghost sm"
      data-test="clear-btn"
      type="button"
      @click="emit('clear')"
    >
      Quitar selección
    </button>
    <button
      class="tt-btn tt-btn-solid"
      data-test="assign-btn"
      type="button"
      :disabled="!canAssign"
      @click="canAssign && emit('assign')"
    >
      Asignar categoría
    </button>
  </div>
</template>

<style scoped src="./gallery-selection-bar.css" />
