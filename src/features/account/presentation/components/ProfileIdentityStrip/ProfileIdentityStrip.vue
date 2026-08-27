<script setup lang="ts">
import { computed } from 'vue'
import { NAvatar, NIcon } from 'naive-ui'
import {
  AlertCircleOutline,
  CheckmarkCircleOutline,
  ChevronForwardOutline,
} from '@vicons/ionicons5'

import type {
  IProfilePendingItem,
  ProfilePendingSection,
} from '../../composables/use-profile-completeness'

const props = withDefaults(
  defineProps<{
    name: string
    email: string
    emailVerified: boolean
    pending: IProfilePendingItem[]
    reachableSections?: Set<ProfilePendingSection>
    compact?: boolean
  }>(),
  { compact: false },
)

const emit = defineEmits<{ (e: 'select', item: IProfilePendingItem): void }>()

const visiblePending = computed(() =>
  props.reachableSections
    ? props.pending.filter((item) => props.reachableSections?.has(item.section))
    : props.pending,
)

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase())
  return letters.join('') || props.email.charAt(0).toUpperCase()
})

const isComplete = computed(() => props.pending.length === 0)

const statusHeadline = computed(() => {
  if (props.compact) {
    return isComplete.value ? 'Tu perfil está completo' : 'Tu perfil está incompleto'
  }
  if (isComplete.value) return 'Tu perfil está completo'
  return props.pending.length === 1 ? 'Te falta 1 cosa' : `Te faltan ${props.pending.length} cosas`
})

const statusSub = computed(() =>
  isComplete.value ? 'Todo listo para publicar y cobrar.' : 'Toca cualquiera para resolverla.',
)
</script>

<template>
  <header
    class="profile-identity"
    :class="{ 'profile-identity--complete': isComplete, 'profile-identity--compact': compact }"
  >
    <div class="profile-identity__who">
      <NAvatar :size="compact ? 48 : 56" round class="profile-identity__avatar">{{
        initials
      }}</NAvatar>
      <div class="profile-identity__meta">
        <h1 class="profile-identity__name">{{ name }}</h1>
        <div class="profile-identity__contact">
          <span class="profile-identity__email">{{ email }}</span>
          <span v-if="!compact" class="profile-identity__dot" />
          <span class="profile-identity__verified" :class="emailVerified ? 'is-ok' : 'is-warn'">
            <NIcon
              :size="12"
              :component="emailVerified ? CheckmarkCircleOutline : AlertCircleOutline"
            />
            <span v-if="!compact">{{ emailVerified ? 'verificado' : 'sin verificar' }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="profile-identity__status" :class="{ 'is-ok': isComplete }">
      <div class="profile-identity__status-head">
        <span class="profile-identity__status-icon">
          <NIcon :size="15" :component="isComplete ? CheckmarkCircleOutline : AlertCircleOutline" />
        </span>
        <div>
          <b>{{ statusHeadline }}</b>
          <span v-if="!compact">{{ statusSub }}</span>
        </div>
      </div>

      <div v-if="!compact && visiblePending.length > 0" class="profile-identity__chips">
        <button
          v-for="item in visiblePending"
          :key="item.label"
          type="button"
          class="profile-identity__chip"
          :class="{ 'is-urgent': item.urgent }"
          @click="emit('select', item)"
        >
          {{ item.label }}
          <NIcon :size="11" :component="ChevronForwardOutline" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped src="./profile-identity-strip.css"></style>
