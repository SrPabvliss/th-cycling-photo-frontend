<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  categoryName: string | null
  frozen: boolean
}>()

defineEmits<{
  assign: []
}>()

const hasCategory = computed(() => Boolean(props.categoryName))
</script>

<template>
  <section class="pd-card">
    <div class="pd-card-h">
      <h4>Categoría</h4>
    </div>
    <div class="pd-catrow">
      <span class="gp-cat" :class="{ none: !hasCategory }" data-test="category-chip">
        {{ hasCategory ? categoryName : 'Sin categoría' }}
      </span>
      <button
        v-if="!frozen"
        type="button"
        class="tt-btn tt-btn-ghost sm"
        data-test="category-btn"
        @click="$emit('assign')"
      >
        {{ hasCategory ? 'Cambiar' : 'Asignar' }}
      </button>
    </div>
    <p v-if="!hasCategory" class="pd-note">
      Sin categoría, la foto no aparece cuando alguien filtra la galería por tramo del circuito.
    </p>
  </section>
</template>

<style scoped src="./photo-category-card.css" />
