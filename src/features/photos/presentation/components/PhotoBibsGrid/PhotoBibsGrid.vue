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
    <div v-for="bib in bibs" :key="bib.id" class="photo-bibs-grid__card">
      <AttributeCropImage
        class="photo-bibs-grid__crop"
        :crop-url="bib.cropUrl"
        :alt="`Placa ${bib.digits}`"
      />
      <div class="photo-bibs-grid__meta">
        <span class="photo-bibs-grid__digits">{{ bib.digits }}</span>
        <NTag :type="CONFIDENCE_TAG_TYPE[confidenceLevel(bib.confidence)]" size="small" round>
          {{ CONFIDENCE_LABELS[confidenceLevel(bib.confidence)] }}
        </NTag>
        <span v-if="bib.source === 'reviewer'" class="photo-bibs-grid__manual">manual</span>
      </div>
    </div>
  </div>
</template>
