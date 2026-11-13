<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton } from 'naive-ui'

import { ErrorState } from '@/shared/components/loading'
import { useDialogFocus } from '@/shared/composables/use-dialog-focus'
import { quotePhotos, sortTiers } from '@/shared/pricing/quote'
import { buildTierCards, formatMoney } from '@/shared/pricing/tier-cards'
import { usePricingTiersQuery } from '@/shared/pricing/use-pricing-tiers'

const TITLE_ID = 'price-sheet-title'

const props = defineProps<{
  open: boolean
  /** Photos of the event at hand in the cart; 0 when there is none to point at. */
  quantity: number
}>()

const emit = defineEmits<{
  close: []
}>()

const { data, status, isFetching, refetch } = usePricingTiersQuery()

const panel = ref<HTMLElement | null>(null)
useDialogFocus(
  panel,
  () => props.open,
  () => emit('close'),
)

const tiers = computed(() => sortTiers(data.value?.tiers ?? []))
const currency = computed(() => data.value?.currency ?? '')
const currentIndex = computed(() => quotePhotos(tiers.value, props.quantity)?.tierIndex ?? -1)

const rows = computed(() =>
  buildTierCards(tiers.value, currency.value).map((card, index) => ({
    ...card,
    isCurrent: index === currentIndex.value,
  })),
)

// One order per tier: the most the first tier takes, then the least each of the others asks for.
const example = computed(() => {
  if (tiers.value.length < 2) return []

  const first = tiers.value[0]!
  const quantities = [
    first.maxQty ?? first.minQty,
    ...tiers.value.slice(1).map((tier) => tier.minQty),
  ]

  return quantities.flatMap((quantity) => {
    const quote = quotePhotos(tiers.value, quantity)
    return quote ? [{ quantity, total: formatMoney(quote.total, currency.value) }] : []
  })
})

// Only true to say when the second tier starts at the third photo.
const thirdPhotoNote = computed(() => {
  if (tiers.value[1]?.minQty !== 3) return null

  const two = quotePhotos(tiers.value, 2)
  const three = quotePhotos(tiers.value, 3)
  if (!two || !three || three.total <= two.total) return null

  const difference = formatMoney(three.total - two.total, currency.value)
  return `La tercera foto te cuesta ${difference} más que llevar dos.`
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="price-sheet">
      <button
        type="button"
        class="price-sheet__scrim"
        aria-label="Cerrar"
        tabindex="-1"
        @click="emit('close')"
      />

      <div
        ref="panel"
        class="price-sheet__panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="TITLE_ID"
        tabindex="-1"
      >
        <div class="price-sheet__head">
          <h2 :id="TITLE_ID" class="price-sheet__title">Mientras más fotos, menos pagas</h2>
          <button
            type="button"
            class="price-sheet__close"
            aria-label="Cerrar"
            @click="emit('close')"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>

        <ErrorState
          v-if="status === 'error'"
          title="No pudimos cargar los precios"
          text="Puede ser tu conexión."
          :retrying="isFetching"
          @retry="refetch()"
        />

        <template v-else>
          <p class="price-sheet__lead">
            El precio por foto depende de cuántas lleves de la misma carrera. Cuando pasas de nivel,
            bajan todas las fotos del pedido, no solo las nuevas.
          </p>

          <ul class="price-sheet__tiers">
            <li
              v-for="row in rows"
              :key="row.label"
              class="price-sheet__tier"
              :class="{ 'price-sheet__tier--current': row.isCurrent }"
            >
              <span>
                {{ row.label }}
                <span v-if="row.discountPercent !== null" class="price-sheet__badge">
                  <template v-if="row.isBest">Mejor precio · </template>−{{ row.discountPercent }}%
                </span>
              </span>
              <strong>{{ row.price }} c/u</strong>
              <span v-if="row.isCurrent" class="price-sheet__now">Tu precio ahora</span>
            </li>
          </ul>

          <div v-if="example.length > 0" class="price-sheet__example">
            <span class="price-sheet__eyebrow">Ejemplo</span>
            <div v-for="row in example" :key="row.quantity" class="price-sheet__example-row">
              <span>{{ row.quantity }} {{ row.quantity === 1 ? 'foto' : 'fotos' }}</span>
              <strong>{{ row.total }}</strong>
            </div>
            <span v-if="thirdPhotoNote" class="price-sheet__note">{{ thirdPhotoNote }}</span>
          </div>

          <p class="price-sheet__note">
            Se cuenta por carrera: las fotos de otro evento van en un pedido aparte, con su propio
            precio.
          </p>
        </template>

        <NButton size="large" block @click="emit('close')">Entendido</NButton>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Mobile: a sheet from the bottom. From 768px: a panel in the middle. */
.price-sheet {
  position: fixed;
  inset: 0;
  z-index: 1600;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-family: var(--tt-font-sans);
}

.price-sheet__scrim {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  padding: 0;
  border: 0;
  background: var(--tt-scrim);
  cursor: default;
}

.price-sheet__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  max-block-size: var(--tt-sheet-max-height);
  padding: var(--tt-space-4) var(--tt-space-4) calc(var(--tt-space-5) + env(safe-area-inset-bottom));
  overflow-y: auto;
  outline: none;
  border-radius: var(--tt-radius-xl) var(--tt-radius-xl) 0 0;
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-sheet);
  animation: price-sheet-up var(--tt-motion-sheet) var(--tt-easing-standard);
}

.price-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tt-space-2);
}

.price-sheet__title {
  margin: 0;
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-heading-m-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.price-sheet__close {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--tt-control-m);
  block-size: var(--tt-control-m);
  border: 0;
  border-radius: var(--tt-radius-pill);
  background: transparent;
  color: var(--tt-ink);
  cursor: pointer;
}

.price-sheet__close:hover {
  background: var(--tt-surface-sunken);
}

.price-sheet__close svg {
  inline-size: var(--tt-icon-l);
  block-size: var(--tt-icon-l);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.price-sheet__lead {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.price-sheet__tiers {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.price-sheet__tier {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: calc(var(--tt-space-1) / 2) var(--tt-space-3);
  padding: var(--tt-space-3) var(--tt-space-4);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

.price-sheet__tier--current {
  border-color: var(--tt-primary);
  background: var(--tt-primary-soft);
}

.price-sheet__badge {
  margin-inline-start: calc(var(--tt-space-1) * 3 / 2);
  padding: 0 var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
  font-size: var(--tt-type-count-size);
  font-weight: var(--tt-type-count-weight);
  white-space: nowrap;
}

.price-sheet__tier--current .price-sheet__badge {
  background: var(--tt-surface-raised);
}

.price-sheet__now {
  flex-basis: 100%;
  color: var(--tt-primary-ink);
  font-size: var(--tt-type-label-size);
  line-height: var(--tt-type-label-line);
  font-weight: var(--tt-type-label-weight);
}

.price-sheet__example {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  padding: var(--tt-space-4);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-l);
  background: var(--tt-surface-raised);
}

.price-sheet__eyebrow {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-eyebrow-size);
  line-height: var(--tt-type-eyebrow-line);
  font-weight: var(--tt-type-eyebrow-weight);
  letter-spacing: var(--tt-type-eyebrow-tracking);
  text-transform: uppercase;
}

.price-sheet__example-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--tt-space-3);
}

.price-sheet__example-row span {
  color: var(--tt-ink-muted);
}

.price-sheet__note {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

@keyframes price-sheet-up {
  from {
    transform: translateY(100%);
  }
}

@media (min-width: 768px) {
  .price-sheet {
    align-items: center;
    justify-content: center;
  }

  .price-sheet__panel {
    inline-size: calc(var(--tt-ilu-page) * 2 + var(--tt-space-6) + var(--tt-space-2));
    max-block-size: 84%;
    padding: var(--tt-space-5);
    border-radius: var(--tt-radius-xl);
    box-shadow: var(--tt-shadow-pop);
    animation: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .price-sheet__panel {
    animation: none;
  }
}
</style>
