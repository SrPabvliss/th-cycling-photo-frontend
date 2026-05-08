<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin, useMessage } from 'naive-ui'
import { useIntervalFn } from '@vueuse/core'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { formatDate } from '@/shared/utils/date.utils'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import { usePublicEventsQuery } from '../../composables/queries/use-public-events'
import { PUBLIC_GALLERY_ROUTE_NAMES } from '../../routes'
import PublicEventCard from '../components/PublicEventCard/PublicEventCard.vue'

const router = useRouter()
const { data: events, isPending } = usePublicEventsQuery()

// --- Filters ---
const search = ref('')
const province = ref('')
const order = ref('recent')
const viewMode = ref<'grid' | 'list'>('grid')

const provinces = computed(() => {
  const set = new Set<string>()
  events.value?.forEach((e) => {
    if (e.provinceName) set.add(e.provinceName)
  })
  return [...set].sort()
})

const featuredEvent = computed(() => events.value?.find((e) => e.isFeatured))

const featuredCoverUrl = computed(() =>
  featuredEvent.value?.coverSlug
    ? getAssetPresetUrl(featuredEvent.value.coverSlug, 'cover-lg')
    : null,
)

const featuredLocation = computed(() => {
  if (!featuredEvent.value) return null
  return (
    [featuredEvent.value.cantonName, featuredEvent.value.provinceName].filter(Boolean).join(', ') ||
    null
  )
})

const filteredOtherEvents = computed(() => {
  let list = (events.value ?? []).filter((e) => !e.isFeatured)

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q))
  }

  if (province.value) {
    list = list.filter((e) => e.provinceName === province.value)
  }

  switch (order.value) {
    case 'photos':
      list = [...list].sort((a, b) => b.photoCount - a.photoCount)
      break
    case 'az':
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'expiring':
      // TODO(PENDING_BACKEND): orden real requiere campo expiresAt por evento
      list = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      break
    default:
      list = [...list].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return list
})

const totalEvents = computed(() => events.value?.length ?? 0)

// TODO(PENDING_BACKEND): totales de fotos, expirando y expiresAt por evento deben venir del backend
const MOCK_TOTAL_PHOTOS = '42,841'
const MOCK_EXPIRING = 2
const MOCK_EXPIRING_DATE = '12 May 2026'

// Mock: los últimos 2 eventos no-featured se marcan como expirando
const eventsWithExpiring = computed(() =>
  filteredOtherEvents.value.map((e, i) => ({
    event: e,
    expiring:
      i >= filteredOtherEvents.value.length - 2
        ? { label: `Expira ${MOCK_EXPIRING_DATE}`, daysLeft: 12 - i, urgencyPct: 25 + i * 10 }
        : undefined,
  })),
)

function goToEvent(slug: string) {
  router.push({ name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_GALLERY, params: { slug } })
}

// ── Countdown ──
// TODO(PENDING_BACKEND): fecha del próximo evento debe venir del endpoint de configuración global
const NEXT_EVENT_DATE = new Date('2026-05-17T00:00:00')

function calcCountdown() {
  const diff = NEXT_EVENT_DATE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

const countdown = ref(calcCountdown())
useIntervalFn(() => {
  countdown.value = calcCountdown()
}, 1000)

// ── Notify form ──
const message = useMessage()
const notifyEmail = ref('')

function handleNotify() {
  if (!notifyEmail.value) return
  message.success('¡Te avisamos cuando se publique la galería!')
  notifyEmail.value = ''
}
</script>

<template>
  <PublicLayout>
    <!-- ── PAGE HEAD ── -->
    <section class="page-head">
      <div class="ph-inner">
        <div class="ph-eyebrow">Archivo · Temporada 2026</div>
        <div class="ph-row">
          <h1 class="ph-title">Eventos<br /><em>Titan TV.</em></h1>
          <div>
            <p class="ph-lede">
              Cada fecha que cubrimos en los Andes ecuatorianos. Encuentra tus fotos por evento o
              pista antes de que la galería expire.
            </p>
            <div class="ph-meta-row">
              <div>
                Total<strong>{{ totalEvents || '—' }} eventos</strong>
              </div>
              <div>
                Fotos<strong>{{ MOCK_TOTAL_PHOTOS }}</strong>
              </div>
              <div>
                Por expirar<strong class="ph-meta-warn">{{ MOCK_EXPIRING }} eventos</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── TOOLBAR ── -->
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input v-model="search" type="text" placeholder="Buscar evento o pista…" />
        </div>

        <div class="filter-grid">
          <div class="filter-col">
            <div class="filter-label">Provincia</div>
            <select v-model="province">
              <option value="">Todas las provincias</option>
              <option v-for="p in provinces" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <div class="filter-col">
            <div class="filter-label">Orden</div>
            <select v-model="order">
              <option value="recent">Más recientes</option>
              <option value="photos">Más fotos</option>
              <option value="expiring">Próximos a expirar</option>
              <option value="az">A–Z</option>
            </select>
          </div>
        </div>

        <div class="toolbar-spacer" />

        <div class="view-toggle">
          <button
            :class="{ active: viewMode === 'grid' }"
            aria-label="Grid"
            @click="viewMode = 'grid'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" />
              <rect x="13" y="3" width="8" height="8" />
              <rect x="3" y="13" width="8" height="8" />
              <rect x="13" y="13" width="8" height="8" />
            </svg>
          </button>
          <button
            :class="{ active: viewMode === 'list' }"
            aria-label="Lista"
            @click="viewMode = 'list'"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ── LOADING ── -->
    <div v-if="isPending" class="ev-loading">
      <NSpin size="large" />
    </div>

    <template v-else-if="events && events.length > 0">
      <!-- ── FEATURED EVENT ── -->
      <section v-if="featuredEvent" class="featured">
        <div class="ft-inner">
          <div class="ft-tag">Evento en curso · Galería abierta</div>
          <article class="ft-card" @click="goToEvent(featuredEvent.slug)">
            <div
              class="ft-image"
              :style="featuredCoverUrl ? `background-image: url(${featuredCoverUrl})` : ''"
            />

            <div class="ft-body">
              <div>
                <div class="ft-badge">Galería abierta</div>
                <h2 class="ft-title">{{ featuredEvent.name }}</h2>
                <div class="ft-meta">
                  <div>
                    Fecha
                    <strong>{{ formatDate(featuredEvent.date) }}</strong>
                  </div>
                  <div v-if="featuredLocation">
                    Ubicación
                    <strong>{{ featuredLocation }}</strong>
                  </div>
                </div>
              </div>
              <div class="ft-actions">
                <button class="ft-btn-primary" @click.stop="goToEvent(featuredEvent.slug)">
                  Ver galería
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
          </article>
        </div>
      </section>

      <!-- ── EXPIRING ALERT ── -->
      <section v-if="MOCK_EXPIRING > 0" class="expiring-alert">
        <div class="ea-inner">
          <div class="ea-row">
            <div class="ea-icon">!</div>
            <div class="ea-text">
              <h4>{{ MOCK_EXPIRING }} eventos expiran este mes</h4>
              <p>
                Las galerías de eventos antiguos se eliminan automáticamente para liberar espacio.
                Compra o descarga tus fotos antes de que se vayan.
              </p>
              <div class="ea-stamp">Próx. eliminación · {{ MOCK_EXPIRING_DATE }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── EVENTS GRID ── -->
      <section v-if="filteredOtherEvents.length > 0" class="events-section">
        <div class="es-inner">
          <!-- Section divider -->
          <div class="section-divider">
            <div class="sd-row">
              <div>
                <div class="sd-label">Archivo · {{ filteredOtherEvents.length }} eventos</div>
                <h3 class="sd-title">Eventos pasados</h3>
              </div>
              <div class="sd-count">
                Mostrando 1–{{ filteredOtherEvents.length }} / {{ filteredOtherEvents.length }}
              </div>
            </div>
          </div>

          <!-- Grid -->
          <div class="events-grid" :class="{ 'events-grid--list': viewMode === 'list' }">
            <PublicEventCard
              v-for="{ event: e, expiring } in eventsWithExpiring"
              :key="e.slug"
              :event="e"
              :expiring="expiring"
              @click="goToEvent"
            />
          </div>

          <!-- TODO(PENDING_BACKEND): paginación real requiere endpoint con cursor/page -->
          <div class="load-more-row">
            <button class="load-more-btn">Cargar más eventos →</button>
          </div>
        </div>
      </section>
    </template>

    <!-- ── PRÓXIMO EVENTO ── -->
    <section class="upcoming">
      <div class="upcoming-wrap upcoming-inner">
        <div class="upcoming-image">
          <div class="upcoming-corners" />
          <div class="upcoming-stamp">Save the date · 17 May 2026</div>
        </div>

        <div class="upcoming-body">
          <div class="upcoming-eyebrow">Próximamente · Coming up</div>
          <h2 class="upcoming-title">Algo grande<br />se asoma<br />en los Andes.</h2>
          <p class="upcoming-desc">
            La siguiente parada de la temporada viene con pista nueva. Sigue la cobertura y sé el
            primero en ver las fotos.
          </p>

          <div class="countdown">
            <div>
              <div class="countdown-n">{{ String(countdown.days).padStart(2, '0') }}</div>
              <div class="countdown-l">Días</div>
            </div>
            <div>
              <div class="countdown-n">{{ String(countdown.hours).padStart(2, '0') }}</div>
              <div class="countdown-l">Horas</div>
            </div>
            <div>
              <div class="countdown-n">{{ String(countdown.minutes).padStart(2, '0') }}</div>
              <div class="countdown-l">Min</div>
            </div>
            <div>
              <div class="countdown-n">{{ String(countdown.seconds).padStart(2, '0') }}</div>
              <div class="countdown-l">Seg</div>
            </div>
          </div>

          <form class="notify-form" @submit.prevent="handleNotify">
            <input
              v-model="notifyEmail"
              type="email"
              placeholder="tu@correo.com — te avisamos cuando se publique"
            />
            <button type="submit">Notificarme</button>
          </form>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<style scoped src="./styles/public-event-list-view.css" />
