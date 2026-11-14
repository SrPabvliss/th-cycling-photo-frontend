<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
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
  <!-- Each control keeps its size: its error goes under it, the load problem below them all. -->
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
    </label>
    <em
      v-if="raceError"
      id="photo-finder-race-error"
      class="photo-finder__error photo-finder__error--race"
      role="alert"
    >
      {{ raceError }}
    </em>

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
    </label>
    <em
      v-if="plateError"
      id="photo-finder-plate-error"
      class="photo-finder__error photo-finder__error--plate"
      role="alert"
    >
      {{ plateError }}
    </em>

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

    <FormAlert
      v-if="hasFailed"
      class="photo-finder__problem"
      data-test="finder-problem"
      tone="bad"
      title="No pudimos cargar las carreras"
      text="Puede ser tu conexión."
      :retrying="isFetching"
      @retry="refetch()"
    />
  </form>
</template>

<style scoped>
/* Mobile first; desktop starts at 768px. */
/* A grid with a row for each error, so a message never stretches a control or moves the button. */
.photo-finder {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'race' 'race-error' 'plate' 'plate-error' 'submit' 'problem';
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
  grid-area: race;
  border: thin solid var(--tt-line);
}

.photo-finder__plate {
  grid-area: plate;
  background: var(--tt-primary-soft);
}

.photo-finder__plate,
.photo-finder__submit {
  margin-block-start: var(--tt-space-2);
}

.photo-finder__submit {
  grid-area: submit;
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

/* After the focus rule, so the error still shows while the field has the focus. */
.photo-finder__race:has([aria-invalid='true']),
.photo-finder__plate:has([aria-invalid='true']) {
  outline: thin solid var(--tt-danger-ink);
}

/* As in every client field: outside the border, a line below it. `contain` keeps a long message
   from widening the plate's column; it wraps inside it instead. */
.photo-finder__error {
  contain: inline-size;
  margin-block-start: var(--tt-space-1);
  color: var(--tt-danger-ink);
  font-style: normal;
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  font-weight: var(--tt-type-caption-weight);
}

.photo-finder__error--race {
  grid-area: race-error;
}

.photo-finder__error--plate {
  grid-area: plate-error;
}

.photo-finder__problem {
  grid-area: problem;
  margin-block-start: var(--tt-space-3);
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
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-areas:
      'race plate submit'
      'race-error plate-error .'
      'problem problem problem';
    column-gap: var(--tt-space-3);
    padding: var(--tt-space-4);
  }

  .photo-finder__race {
    justify-content: center;
  }

  .photo-finder__plate,
  .photo-finder__submit {
    margin-block-start: 0;
  }

  .photo-finder__submit {
    block-size: auto;
    min-block-size: calc(var(--tt-control-l) + var(--tt-space-2));
    white-space: nowrap;
  }
}
</style>
