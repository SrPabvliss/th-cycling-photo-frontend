<script setup lang="ts">
import { computed } from 'vue'

import heroImage from '@/assets/landing/hero.webp'
import { problemKind } from '@/core/http/problem-kind'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import HouseSpot from '@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue'
import { ErrorState, useDelayedFlag } from '@/shared/components/loading'
import {
  PublicEventCard,
  PublicEventCardSkeleton,
  usePublicEventsQuery,
} from '@/shared/public-events'
import PhotoFinder from '../components/PhotoFinder/PhotoFinder.vue'
import PriceBand from '../components/PriceBand/PriceBand.vue'

const RECENT_EVENTS = 8
const SKELETON_COUNT = 4
// Intrinsic size of the hero file: lets the browser reserve its room before it arrives.
const HERO_SIZE = { width: 1920, height: 1282 }

// First page of the list every screen shares, newest first. A failure here is told in place: the
// hero and the finder do not depend on it.
const { status, error, isFetching, events, refetch } = usePublicEventsQuery()

const recentEvents = computed(() => events.value.slice(0, RECENT_EVENTS))
const isPending = computed(() => status.value === 'pending')
const showSkeletons = useDelayedFlag(isPending)
// A failed refresh with events on screen keeps them: only a list that never came is an error.
const hasFailed = computed(() => status.value === 'error' && events.value.length === 0)
// Loaded and nothing to show: the whole section goes, title included.
const hasRecentSection = computed(() => status.value !== 'success' || recentEvents.value.length > 0)
</script>

<template>
  <div class="landing">
    <section class="landing__hero">
      <img
        :src="heroImage"
        alt="Ciclista en una pista de downhill"
        :width="HERO_SIZE.width"
        :height="HERO_SIZE.height"
        fetchpriority="high"
        decoding="async"
      />
      <div class="landing__hero-text">
        <h1 class="landing__hero-title">Tu carrera, <br />tus fotos</h1>
        <p class="landing__hero-lead">
          Elige tu carrera, escribe tu placa y llévate tus fotos en alta calidad.
        </p>
      </div>
    </section>

    <PhotoFinder class="landing__finder" />

    <section v-if="hasRecentSection" class="landing__band">
      <div class="landing__band-head">
        <h2 class="landing__heading">Eventos recientes</h2>
        <RouterLink class="landing__link" :to="ROUTE_PATHS.PUBLIC_GALLERY">Ver todos</RouterLink>
      </div>

      <ErrorState
        v-if="hasFailed"
        class="landing__problem"
        data-test="recent-problem"
        what="los eventos"
        :kind="problemKind(error)"
        :retrying="isFetching"
        @retry="refetch()"
      />

      <div
        v-else-if="isPending || showSkeletons"
        class="landing__row landing__row--loading"
        aria-busy="true"
        aria-label="Cargando eventos"
      >
        <template v-if="showSkeletons">
          <PublicEventCardSkeleton v-for="n in SKELETON_COUNT" :key="n" />
        </template>
      </div>

      <div v-else class="landing__row">
        <PublicEventCard v-for="event in recentEvents" :key="event.slug" :event="event" />
      </div>
    </section>

    <PriceBand class="landing__band" />

    <!-- House ad in its own band (demo seed 3); gone without a trace if it cannot be shown. -->
    <HouseSpot class="landing__band" format="AB" :seed="3" />

    <section class="landing__manifesto">
      <div class="landing__manifesto-inner">
        <span class="landing__eyebrow">11 años en los Andes</span>
        <p class="landing__manifesto-title">Poderosos dioses que gobiernan las montañas</p>
        <p class="landing__manifesto-text">
          De los Andes ecuatorianos, con sus caballos de acero. Fotografiamos cada competencia de
          downhill en alta calidad.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped src="./styles/landing-view.css" />
