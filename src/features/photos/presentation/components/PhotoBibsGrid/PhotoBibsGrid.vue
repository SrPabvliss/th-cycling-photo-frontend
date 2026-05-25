<script setup lang="ts">
import { NTag } from 'naive-ui'
import type { IBibAttribute } from '@/features/photos/types/responses/photo-detail.response'
import { CONFIDENCE_LABELS, CONFIDENCE_TAG_TYPE, confidenceLevel } from '@/shared/types/photo-enums'
import AttributeCropImage from '../AttributeCropImage/AttributeCropImage.vue'
import './photo-bibs-grid.css'

defineProps<{ bibs: IBibAttribute[] }>()
</script>

<template>
  <div class="photo-bibs-grid">
    <article
      v-for="bib in bibs"
      :key="bib.id"
      class="photo-bib-card"
      :class="{ 'photo-bib-card--manual': bib.source === 'reviewer' }"
    >
      <AttributeCropImage
        class="photo-bib-card__crop"
        :crop-url="bib.cropUrl"
        :alt="`Placa ${bib.digits}`"
      />
      <div class="photo-bib-card__body">
        <span class="photo-bib-card__digits">{{ bib.digits }}</span>
        <div class="photo-bib-card__meta">
          <NTag :type="CONFIDENCE_TAG_TYPE[confidenceLevel(bib.confidence)]" size="small" round>
            {{ CONFIDENCE_LABELS[confidenceLevel(bib.confidence)] }}
          </NTag>
          <span v-if="bib.source === 'reviewer'" class="photo-bib-card__tag">manual</span>
        </div>
      </div>
    </article>
  </div>
</template>
