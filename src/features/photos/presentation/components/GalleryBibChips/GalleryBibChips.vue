<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CheckmarkOutline, WarningOutline } from '@vicons/ionicons5'

import type { IPhotoBib } from '@/features/photos/types/responses/photo-list.response'

const props = defineProps<{
  bibs: IPhotoBib[]
  large?: boolean
}>()

function isFromPerson(bib: IPhotoBib): boolean {
  return bib.source === 'reviewer' || bib.corrected
}

function isDoubtful(bib: IPhotoBib): boolean {
  return bib.status === 'abstained' && bib.source === 'ai' && !bib.corrected
}

function titleFor(bib: IPhotoBib): string {
  if (isFromPerson(bib) || bib.confidence === null) return 'Corregido por una persona'
  const pct = Math.round(bib.confidence * 100)
  return isDoubtful(bib) ? `Confianza ${pct}%` : `Leído por la IA · ${pct}%`
}

</script>

<template>
  <div class="gp-bibs">
    <span v-if="props.bibs.length === 0" class="gp-bib none" :class="{ big: props.large }">
      Sin dorsal
    </span>
    <span
      v-for="(bib, index) in props.bibs"
      v-else
      :key="`${bib.digits}-${index}`"
      class="gp-bib"
      :class="{ big: props.large, dud: isDoubtful(bib) }"
      :title="titleFor(bib)"
    >
      <NIcon
        v-if="isFromPerson(bib)"
        :component="CheckmarkOutline"
        :size="11"
        data-test="bib-person-icon"
      />
      <NIcon
        v-else-if="isDoubtful(bib)"
        :component="WarningOutline"
        :size="11"
        data-test="bib-doubtful-icon"
      />
      {{ bib.digits }}
    </span>
  </div>
</template>

<style scoped src="./gallery-bib-chips.css" />
