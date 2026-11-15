<script setup lang="ts">
import helmetUrl from '@/assets/brand/titan-helmet.webp'
import emblemUrl from '@/assets/brand/titan-helmet-tv.webp'
import fullUrl from '@/assets/brand/titan-logo-full.webp'

export type TitanLogoVariant = 'helmet' | 'emblem' | 'full'

const props = withDefaults(
  defineProps<{
    size?: number
    variant?: TitanLogoVariant
  }>(),
  { size: 48, variant: 'helmet' },
)

const SOURCES: Record<TitanLogoVariant, string> = {
  helmet: helmetUrl,
  emblem: emblemUrl,
  full: fullUrl,
}

const ASPECT: Record<TitanLogoVariant, number> = {
  helmet: 1280 / 1262,
  emblem: 1280 / 1262,
  full: 2222 / 2831,
}

const ALT: Record<TitanLogoVariant, string> = {
  helmet: 'Titan TV',
  emblem: 'Titan TV',
  full: 'Titan TV',
}

const src = SOURCES[props.variant]
const width = props.variant === 'full' ? Math.round(props.size * ASPECT.full) : props.size
const height = props.variant === 'full' ? props.size : Math.round(props.size / ASPECT.helmet)
</script>

<template>
  <img
    :src="src"
    :alt="ALT[variant]"
    :width="width"
    :height="height"
    class="titan-logo"
    decoding="async"
    draggable="false"
  />
</template>

<style scoped>
.titan-logo {
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}
</style>
