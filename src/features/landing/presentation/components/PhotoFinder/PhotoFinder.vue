<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import { usePublicEventsQuery } from '@/shared/public-events'
import { parsePlate } from '@/shared/utils/plate.utils'
import { finderTarget } from '../../../utils/finder-target'

// A plate belongs to one race: the same rider carries another number in the next one. So the
// race is chosen first, and only then the plate means something.
const RACES_PAGE_SIZE = 50

const router = useRouter()
const {
  status,
  isFetching,
  events: races,
  refetch,
} = usePublicEventsQuery({ hasPhotos: true }, { pageSize: RACES_PAGE_SIZE })

const raceSlug = ref('')
const plateText = ref('')
const raceError = ref<string | null>(null)
const plateError = ref<string | null>(null)
const raceField = ref<HTMLSelectElement | null>(null)

const isLoading = computed(() => status.value === 'pending')
const hasFailed = computed(() => status.value === 'error')

watch(raceSlug, () => (raceError.value = null))
watch(plateText, () => (plateError.value = null))

function search() {
  if (hasFailed.value || isLoading.value) return

  if (!raceSlug.value) {
    raceError.value = 'Elige primero la carrera.'
    raceField.value?.focus()
    return
  }

  const { plate, error } = parsePlate(plateText.value)
  if (error) {
    plateError.value = 'Escribe solo el número de tu placa.'
    return
  }

  router.push(finderTarget(raceSlug.value, plate))
}
</script>

<template>
  <form class="photo-finder" novalidate @submit.prevent="search">
    <label class="photo-finder__race">
      <span class="photo-finder__label">Carrera</span>
      <select
        ref="raceField"
        v-model="raceSlug"
        class="photo-finder__select"
        aria-label="Carrera"
        :disabled="isLoading || hasFailed"
        :aria-invalid="raceError ? 'true' : undefined"
        :aria-describedby="raceError ? 'photo-finder-race-error' : undefined"
      >
        <option v-if="isLoading" value="">Cargando carreras</option>
        <template v-else>
          <option value="">Elige tu carrera</option>
          <option v-for="race in races" :key="race.slug" :value="race.slug">{{ race.name }}</option>
        </template>
      </select>
      <span v-if="raceError" id="photo-finder-race-error" class="photo-finder__error" role="alert">
        {{ raceError }}
      </span>
      <span v-else-if="hasFailed" class="photo-finder__error" role="alert">
        No pudimos cargar las carreras.
        <button type="button" class="photo-finder__retry" :disabled="isFetching" @click="refetch()">
          Reintentar
        </button>
      </span>
    </label>

    <label class="photo-finder__plate">
      <span class="photo-finder__label">N.º de placa</span>
      <span class="photo-finder__plate-field">
        <span class="photo-finder__hash" aria-hidden="true">#</span>
        <input
          v-model="plateText"
          class="photo-finder__input"
          inputmode="numeric"
          autocomplete="off"
          placeholder="127"
          aria-label="Número de placa"
          :aria-invalid="plateError ? 'true' : undefined"
          :aria-describedby="plateError ? 'photo-finder-plate-error' : undefined"
        />
      </span>
      <span
        v-if="plateError"
        id="photo-finder-plate-error"
        class="photo-finder__error"
        role="alert"
      >
        {{ plateError }}
      </span>
    </label>

    <NButton
      class="photo-finder__submit"
      type="primary"
      size="large"
      attr-type="submit"
      :disabled="hasFailed || isLoading"
    >
      <template #icon>
        <svg viewBox="0 0 24 24" class="photo-finder__icon" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </template>
      Buscar mis fotos
    </NButton>
  </form>
</template>

<style scoped>
/* Mobile first; desktop starts at 768px. */
.photo-finder {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  padding: var(--tt-space-3);
  border-radius: var(--tt-radius-l);
  background: var(--tt-surface-raised);
  box-shadow: var(--tt-card-edge), var(--tt-shadow-3);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.photo-finder__race,
.photo-finder__plate {
  display: flex;
  flex-direction: column;
  padding: var(--tt-space-2) var(--tt-space-3);
  border-radius: var(--tt-radius-m);
}

.photo-finder__race {
  border: thin solid var(--tt-line);
}

.photo-finder__plate {
  background: var(--tt-primary-soft);
}

.photo-finder__label {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-label-size);
  line-height: var(--tt-type-label-line);
  font-weight: var(--tt-type-label-weight);
}

.photo-finder__plate .photo-finder__label {
  color: var(--tt-primary-ink);
}

.photo-finder__select {
  inline-size: 100%;
  block-size: var(--tt-icon-xl);
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--tt-ink);
  font-family: inherit;
  font-size: var(--tt-type-title-size);
  font-weight: var(--tt-type-body-medium-weight);
}

.photo-finder__plate-field {
  display: flex;
  align-items: center;
  gap: var(--tt-space-1);
  font-family: var(--tt-font-display);
  font-stretch: var(--tt-number-stretch);
  font-size: var(--tt-type-display-s-size);
  line-height: 1.15;
  font-weight: var(--tt-type-number-weight);
}

.photo-finder__hash {
  color: var(--tt-ink-muted);
}

.photo-finder__input {
  inline-size: 100%;
  min-inline-size: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--tt-ink);
  font: inherit;
}

.photo-finder__input::placeholder {
  color: var(--tt-ink-muted);
}

.photo-finder__race:focus-within,
.photo-finder__plate:focus-within {
  outline: thin solid var(--tt-primary);
}

.photo-finder__error {
  color: var(--tt-danger-ink);
  font-family: var(--tt-font-sans);
  font-stretch: normal;
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  font-weight: var(--tt-type-caption-weight);
}

.photo-finder__retry {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-weight: var(--tt-type-title-weight);
  text-decoration: underline;
  cursor: pointer;
}

.photo-finder__icon {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (min-width: 768px) {
  .photo-finder {
    flex-direction: row;
    align-items: stretch;
    gap: var(--tt-space-3);
    padding: var(--tt-space-4);
  }

  .photo-finder__race {
    flex: 1;
    justify-content: center;
  }

  .photo-finder__submit {
    block-size: auto;
    min-block-size: calc(var(--tt-control-l) + var(--tt-space-2));
    white-space: nowrap;
  }
}
</style>
