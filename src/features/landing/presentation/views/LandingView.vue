<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIntervalFn } from '@vueuse/core'
import { useMessage } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { usePublicEventsQuery } from '@/features/public-gallery/composables/queries/use-public-events'
import { PUBLIC_GALLERY_ROUTE_NAMES } from '@/features/public-gallery/routes'
import { getAssetPresetUrl } from '@/shared/utils/cdn.utils'
import { formatDate } from '@/shared/utils/date.utils'

const router = useRouter()
const { data: events } = usePublicEventsQuery()

const featuredEvent = computed(() => events.value?.find((e) => e.isFeatured))
const recentEvents = computed(() => events.value?.filter((e) => !e.isFeatured).slice(0, 3) ?? [])

const featuredLocation = computed(() => {
  if (!featuredEvent.value) return null
  const parts = [featuredEvent.value.cantonName, featuredEvent.value.provinceName].filter(Boolean)
  return parts.join(', ') || null
})

const featuredCoverUrl = computed(() =>
  featuredEvent.value?.coverSlug
    ? getAssetPresetUrl(featuredEvent.value.coverSlug, 'cover-lg')
    : null,
)

function handleEventClick(slug: string) {
  router.push({ name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_GALLERY, params: { slug } })
}

// ── Countdown ──
// TODO: fecha hardcoded — reemplazar con campo nextEventDate del endpoint de configuración global
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
    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-bg" />
      <div class="hero-grid" />
      <div class="hero-watermark">TITAN · TV · DOWNHILL · MEDIA · EC · 2026</div>
      <div class="hero-content wrap">
        <div>
          <!-- TODO: hardcoded — usar temporada activa del endpoint de configuración global -->
          <div class="hero-tag">Temporada 2026 · Activa</div>
          <h1 class="hero-title">Cada<br />curva.<br /><em>Cada salto.</em></h1>
          <p class="hero-sub">
            Fotografía profesional de downhill en los Andes ecuatorianos. Encuentra tus fotos por
            número de dorsal, color de casco o marca de bicicleta.
          </p>
          <RouterLink to="/gallery" class="hero-cta">
            Busca tus fotos <span class="hero-arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ── EVENTO ACTUAL ── -->
    <section v-if="featuredEvent" class="current-event">
      <div class="wrap">
        <div class="current-head">
          <div>
            <div class="section-eyebrow">Evento reciente</div>
            <h2 class="section-title">Evento actual</h2>
          </div>
          <div class="current-status">Galería disponible</div>
        </div>

        <div
          class="current-card"
          :style="featuredCoverUrl ? `background-image: url(${featuredCoverUrl})` : ''"
          @click="handleEventClick(featuredEvent.slug)"
        >
          <div class="current-card-inner">
            <div />
            <div class="current-bottom">
              <div>
                <div class="current-photo-count">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <rect x="3" y="6" width="18" height="14" rx="1" />
                    <circle cx="12" cy="13" r="4" />
                    <path d="M9 6l2-3h2l2 3" />
                  </svg>
                  {{ featuredEvent.photoCount.toLocaleString() }} fotos
                </div>
                <h3 class="current-title">{{ featuredEvent.name }}</h3>
                <div class="current-info">
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
              <RouterLink
                :to="{
                  name: PUBLIC_GALLERY_ROUTE_NAMES.EVENT_GALLERY,
                  params: { slug: featuredEvent.slug },
                }"
                class="current-cta"
                @click.stop
              >
                Ver galería <span>→</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── EVENTOS PASADOS ── -->
    <section v-if="recentEvents.length > 0" class="past-events">
      <div class="wrap">
        <div class="past-head">
          <div>
            <div class="section-eyebrow">Archivo · 2026</div>
            <h2 class="section-title">Eventos pasados</h2>
          </div>
          <RouterLink to="/gallery" class="past-see-all"> Ver archivo completo → </RouterLink>
        </div>

        <div class="past-grid">
          <article
            v-for="(event, i) in recentEvents"
            :key="event.slug"
            class="past-card"
            @click="handleEventClick(event.slug)"
          >
            <div class="past-card-cover">
              <img
                v-if="event.coverSlug"
                :src="getAssetPresetUrl(event.coverSlug, 'cover-sm')"
                :alt="event.name"
                loading="lazy"
              />
              <div v-else class="past-card-cover-placeholder" />

              <span class="past-card-number">0{{ i + 1 }}</span>

              <div class="past-card-photos">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <rect x="3" y="6" width="18" height="14" rx="1" />
                  <circle cx="12" cy="13" r="4" />
                  <path d="M9 6l2-3h2l2 3" />
                </svg>
                {{ event.photoCount.toLocaleString() }} fotos
              </div>

              <div class="past-card-content">
                <h3>{{ event.name }}</h3>
                <div class="past-card-meta">
                  <span v-if="event.cantonName || event.provinceName">
                    📍 {{ [event.cantonName, event.provinceName].filter(Boolean).join(', ') }}
                  </span>
                  <span>{{ formatDate(event.date) }}</span>
                </div>
              </div>

              <div class="past-card-arrow">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ── PRÓXIMO EVENTO ── -->
    <section class="upcoming">
      <div class="wrap upcoming-inner">
        <div class="upcoming-image">
          <div class="upcoming-corners" />
          <!-- TODO: hardcoded — imagen y fecha del próximo evento deben venir del backend (campo coverSlug + nextEventDate) -->
          <div class="upcoming-stamp">Save the date · 17 May 2026</div>
        </div>

        <div class="upcoming-body">
          <div class="section-eyebrow upcoming-eyebrow">Próximamente · Coming up</div>
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
            <!-- TODO: sin endpoint — backend debe exponer POST /notifications/subscribe para guardar el correo -->
            <button type="submit">Notificarme</button>
          </form>
        </div>
      </div>
    </section>

    <!-- ── NOSOTROS ── -->
    <section id="nosotros" class="about">
      <div class="wrap about-grid">
        <div class="about-visual">
          <div class="about-sticker">11 años de historia</div>
          <div class="about-img-main" />
          <div class="about-img-secondary" />
        </div>

        <div class="about-body">
          <div class="section-eyebrow">Nosotros</div>
          <h2 class="about-title">Somos los ojos <span>del downhill</span> ecuatoriano.</h2>
          <p>
            Titan TV es una productora audiovisual especializada en ciclismo de montaña. Cubrimos
            las fechas más importantes de Ecuador desde 2013 —cámara en mano, botas llenas de barro,
            y el único objetivo de que cada ciclista tenga su mejor momento capturado.
          </p>
          <p>
            Procesamos cientos de fotografías después de cada carrera y las dejamos listas para que
            las encuentres con solo tu número de dorsal.
          </p>

          <div class="about-numbers">
            <div>
              <div class="about-n">13<small>+</small></div>
              <div class="about-l">Años cubriendo</div>
            </div>
            <div>
              <div class="about-n">8.4K<small>+</small></div>
              <div class="about-l">Seguidores activos</div>
            </div>
            <div>
              <div class="about-n">2.4K<small>+</small></div>
              <div class="about-l">Ciclistas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<style scoped src="./styles/landing-view.css" />
