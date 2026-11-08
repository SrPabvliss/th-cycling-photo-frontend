<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { LockClosedOutline } from '@vicons/ionicons5'

import type { PayoutItemId } from '../../../types/configuration-item.types'
import { lockedPayoutCopy } from '../../../utils/locked-payout.utils'
import SourceChoice from './SourceChoice.vue'

const props = defineProps<{
  itemId: PayoutItemId
  hasProfileValue: boolean
  profileLabel: string
  useProfile: boolean
  /** False when the viewer may only use the profile's method or keep the event's own. */
  allowsNewData: boolean
  currentLabel: string | null
}>()

const emit = defineEmits<{
  'update:use-profile': [boolean]
}>()

const locked = computed(() =>
  props.allowsNewData
    ? null
    : lockedPayoutCopy(props.itemId, props.hasProfileValue, props.currentLabel),
)
</script>

<template>
  <SourceChoice
    v-if="hasProfileValue && !locked"
    :profile-label="profileLabel"
    :use-profile="useProfile"
    @update:use-profile="emit('update:use-profile', $event)"
  />

  <template v-else-if="locked">
    <SourceChoice
      v-if="hasProfileValue"
      :profile-label="profileLabel"
      :use-profile="useProfile"
      :profile-title="locked.profileTitle"
      :other-title="locked.otherTitle"
      :other-hint="locked.otherHint"
      @update:use-profile="emit('update:use-profile', $event)"
    />
    <p class="ce-locked" data-test="payout-locked-note">
      <NIcon :component="LockClosedOutline" :size="14" />
      {{ locked.note }}
    </p>
  </template>
</template>

<style scoped src="./payout-source-choice.css" />
