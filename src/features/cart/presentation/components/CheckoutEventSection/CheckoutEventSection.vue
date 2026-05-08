<script setup lang="ts">
import { computed, ref } from 'vue'

import { formatDate } from '@/shared/utils/date.utils'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import { useParticipantCategoriesQuery } from '@/features/classifications/composables/queries/use-participant-categories'
import type { ICartGroup } from '../../../types/responses/cart.response'
import type { IEventFormData } from '../../../composables/use-checkout-stepper'

const props = defineProps<{
  group: ICartGroup
  form: IEventFormData
  isFirst: boolean
  isLast: boolean
  stepIndex: number
  totalSteps: number
  isCheckingOut: boolean
}>()

const emit = defineEmits<{
  'update:form': [form: IEventFormData]
  prev: []
  next: []
  checkout: []
}>()

function updateForm(patch: Partial<IEventFormData>) {
  emit('update:form', { ...props.form, ...patch })
}

const { data: categories } = useParticipantCategoriesQuery(1)

const categoryOptions = computed(
  () => categories.value?.map((c) => ({ label: c.name, value: c.name })) ?? [],
)

const notesLength = computed(() => (props.form.notes ?? '').length)
const isHeavy = computed(() => props.group.photos.length > 9)
const visibleThumbs = computed(() =>
  isHeavy.value ? props.group.photos.slice(0, 8) : props.group.photos.slice(0, 6),
)
const thumbLimit = computed(() => (isHeavy.value ? 8 : 6))
const extraCount = computed(() => Math.max(0, props.group.photos.length - thumbLimit.value))

// ── Inline validation ──
const submitted = ref(false)
const categoryError = computed(() => submitted.value && !props.form.categoryName)
const bibError = computed(() => submitted.value && !props.form.bibNumber?.trim())

function validate(): boolean {
  submitted.value = true
  return !!props.form.categoryName && !!props.form.bibNumber?.trim()
}

function handleNext() {
  if (validate()) emit('next')
}

function handleCheckout() {
  if (validate()) emit('checkout')
}
</script>

<template>
  <div class="cs-grid">
    <!-- ── LEFT ASIDE ── -->
    <aside class="cs-aside">
      <div class="cs-panel">
        <div class="cs-panel-head">
          <div class="cs-panel-eyebrow"><strong>Tu selección</strong> · Evento activo</div>
        </div>

        <div class="cs-aside-body">
          <!-- Heavy variant (>9 photos) -->
          <template v-if="isHeavy">
            <div class="cs-heavy-hero">
              <div>
                <div class="cs-heavy-n">{{ group.photos.length }}</div>
                <div class="cs-heavy-label">Fotos · pedido grande</div>
              </div>
              <div style="position: relative">
                <div class="cs-heavy-sub">Titan TV revisará cada foto.</div>
              </div>
            </div>
            <div class="cs-thumbs cs-thumbs--dense">
              <div
                v-for="photo in visibleThumbs"
                :key="photo.id"
                class="cs-thumb"
                :style="`background-image: url(${getGalleryUrl(photo.publicSlug)})`"
              />
              <div v-if="extraCount > 0" class="cs-thumb">
                <div class="cs-thumb-more">+{{ extraCount }}</div>
              </div>
            </div>
          </template>

          <!-- Normal variant (≤9 photos) -->
          <template v-else>
            <div class="cs-thumbs">
              <div
                v-for="photo in visibleThumbs"
                :key="photo.id"
                class="cs-thumb"
                :style="`background-image: url(${getGalleryUrl(photo.publicSlug)})`"
              />
              <div v-if="extraCount > 0" class="cs-thumb">
                <div class="cs-thumb-more">+{{ extraCount }}</div>
              </div>
            </div>
            <div class="cs-counter-row">
              <span>Fotos seleccionadas</span>
              <span class="cs-counter-big">{{ group.photos.length }}</span>
            </div>
          </template>

          <dl class="cs-kv">
            <dt>Evento</dt>
            <dd>{{ group.eventName }}</dd>
            <dt>Fecha</dt>
            <dd class="soft">{{ formatDate(group.eventDate) }}</dd>
            <dt>Fotógrafo</dt>
            <dd class="soft">Titan TV</dd>
          </dl>

          <div class="cs-benefits">
            <div class="cs-benefit">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="1" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span>Alta resolución, sin marcas de agua</span>
            </div>
            <div class="cs-benefit">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                />
              </svg>
              <span>Contacto vía WhatsApp en menos de 24h</span>
            </div>
            <div class="cs-benefit">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="2" y="5" width="20" height="14" rx="1" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              <span>Pago por transferencia o depósito</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── RIGHT: Form ── -->
    <section class="cs-panel">
      <!-- Form head -->
      <div class="cs-form-head">
        <div class="cs-form-eyebrow">
          Evento {{ stepIndex + 1 }} de {{ totalSteps }} · <strong>Datos por evento</strong>
        </div>
        <h2 class="cs-form-title">Confirmar pedido</h2>
        <p class="cs-form-sub">
          Completa los datos para <strong>{{ group.eventName }}</strong
          >. Los pedimos por cada evento para separar tus fotos por carrera.
        </p>
      </div>

      <!-- Form body -->
      <div class="cs-form-body">
        <div class="cs-fgrid">
          <!-- Categoría -->
          <div class="cs-fld" :class="{ 'cs-fld--error': categoryError }">
            <label>
              Categoría
              <span class="cs-req">*</span>
            </label>
            <select
              :value="form.categoryName ?? ''"
              @change="
                (e) => updateForm({ categoryName: (e.target as HTMLSelectElement).value || null })
              "
            >
              <option value="">Seleccionar categoría</option>
              <option v-for="c in categoryOptions" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
            <span v-if="categoryError" class="cs-fld-error">Elige una categoría</span>
          </div>

          <!-- Dorsal -->
          <div class="cs-fld" :class="{ 'cs-fld--error': bibError }">
            <label>
              Número de dorsal
              <span class="cs-req">*</span>
            </label>
            <input
              type="text"
              :value="form.bibNumber ?? ''"
              placeholder="Ej. 127"
              maxlength="10"
              @input="(e) => updateForm({ bibNumber: (e.target as HTMLInputElement).value })"
            />
            <span v-if="bibError" class="cs-fld-error">Ingresa tu número de dorsal</span>
            <span v-else class="cs-fld-hint"
              >Si no competiste, escribe <strong>S/N</strong> en observaciones.</span
            >
          </div>

          <!-- TODO(PENDING_BACKEND): select de sesión requiere campo sessions[] en ICartGroup -->

          <!-- Observaciones -->
          <div class="cs-fld cs-fld--full">
            <label>
              Observaciones
              <span class="cs-opt">(opcional)</span>
            </label>
            <textarea
              :value="form.notes ?? ''"
              placeholder="¿Color de casco? ¿Marca de bici? ¿Algún dato que ayude a verificar que estas fotos son tuyas?"
              maxlength="500"
              rows="4"
              @input="(e) => updateForm({ notes: (e.target as HTMLTextAreaElement).value })"
            />
            <span class="cs-char-count">{{ notesLength }} / 500</span>
          </div>
        </div>
      </div>

      <!-- Form foot -->
      <div class="cs-form-foot">
        <div class="cs-foot-note">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Te contactaremos por WhatsApp para coordinar el pago.
        </div>
        <div class="cs-foot-actions">
          <button v-if="!isFirst" class="cs-btn cs-btn--ghost" @click="emit('prev')">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Anterior
          </button>
          <div v-else />

          <button v-if="!isLast" class="cs-btn cs-btn--primary" @click="handleNext">
            Siguiente evento
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
          <button
            v-else
            class="cs-btn cs-btn--primary"
            :disabled="isCheckingOut"
            @click="handleCheckout"
          >
            Revisar pedido
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped src="./checkout-event-section.css" />
