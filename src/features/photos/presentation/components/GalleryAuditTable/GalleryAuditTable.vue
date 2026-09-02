<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  CartOutline,
  CheckmarkOutline,
  SparklesOutline,
  TrashOutline,
  WarningOutline,
} from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type {
  IPhotoBib,
  IPhotoListItem,
} from '@/features/photos/types/responses/photo-list.response'
import GalleryBibChips from '../GalleryBibChips/GalleryBibChips.vue'

const props = defineProps<{
  photos: IPhotoListItem[]
  selectedIds: string[]
  deletable?: boolean
}>()

const emit = defineEmits<{
  open: [slug: string]
  toggle: [id: string]
  delete: [id: string]
}>()

type ReadingTone = 'red' | 'ok' | 'amber' | 'ai'

interface IReading {
  tone: ReadingTone
  text: string
}

function isFromPerson(bib: IPhotoBib): boolean {
  return bib.source === 'reviewer' || bib.corrected
}

function isDoubtful(bib: IPhotoBib): boolean {
  return bib.status === 'abstained' && bib.source === 'ai' && !bib.corrected
}

function pctText(bib: IPhotoBib | undefined): string {
  return bib && bib.confidence !== null ? `${Math.round(bib.confidence * 100)}%` : ''
}

function readingFor(photo: IPhotoListItem): IReading {
  if (photo.bibs.length === 0) return { tone: 'red', text: 'No leído' }
  if (photo.bibs.some(isFromPerson)) return { tone: 'ok', text: 'Persona' }
  const firstBib = photo.bibs[0]
  if (firstBib && isDoubtful(firstBib)) return { tone: 'amber', text: pctText(firstBib) }
  return { tone: 'ai', text: pctText(firstBib) }
}

const rows = computed(() =>
  props.photos.map((photo) => ({
    photo,
    reading: readingFor(photo),
  })),
)

function isSelected(id: string): boolean {
  return props.selectedIds.includes(id)
}
</script>

<template>
  <div class="gp-tablewrap">
    <table class="gp-table">
      <thead>
        <tr>
          <th class="c-chk"></th>
          <th class="c-th"></th>
          <th class="c-bib">Dorsal</th>
          <th class="c-src">Lectura</th>
          <th class="c-cat">Categoría</th>
          <th class="c-sold">Venta</th>
          <th class="c-file">Archivo</th>
          <th class="c-time">Subida</th>
          <th class="c-act"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="{ photo, reading } in rows"
          :key="photo.id"
          :class="{ sel: isSelected(photo.id) }"
          @click="emit('open', photo.publicSlug)"
        >
          <td class="c-chk">
            <button
              type="button"
              class="gp-chk-btn"
              title="Seleccionar"
              @click.stop="emit('toggle', photo.id)"
            >
              <span class="gp-chk" :class="{ on: isSelected(photo.id) }">
                <svg
                  v-if="isSelected(photo.id)"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="white"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
            </button>
          </td>
          <td class="c-th">
            <img :src="photo.thumbnailUrl" :alt="photo.filename" loading="lazy" decoding="async" />
          </td>
          <td class="c-bib">
            <GalleryBibChips :bibs="photo.bibs" :status="photo.status" />
          </td>
          <td class="c-src">
            <span
              class="gp-src"
              :class="{
                ok: reading.tone === 'ok',
                amber: reading.tone === 'amber',
                red: reading.tone === 'red',
              }"
            >
              <NIcon v-if="reading.tone === 'ok'" :component="CheckmarkOutline" :size="11" />
              <NIcon v-else-if="reading.tone === 'amber'" :component="WarningOutline" :size="11" />
              <NIcon v-else-if="reading.tone === 'ai'" :component="SparklesOutline" :size="11" />
              {{ reading.text }}
            </span>
          </td>
          <td class="c-cat">
            <span v-if="photo.photoCategoryName">{{ photo.photoCategoryName }}</span>
            <i v-else>Sin categoría</i>
          </td>
          <td class="c-sold">
            <span v-if="photo.sold" class="gp-src ok">
              <NIcon :component="CartOutline" :size="11" />
              Vendida
            </span>
          </td>
          <td class="c-file">{{ photo.filename }}</td>
          <td class="c-time">{{ formatRelativeTime(photo.uploadedAt) }}</td>
          <td class="c-act">
            <button
              v-if="deletable"
              type="button"
              class="gp-audit-del"
              title="Eliminar foto"
              @click.stop="emit('delete', photo.id)"
            >
              <NIcon :component="TrashOutline" :size="14" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped src="./gallery-audit-table.css" />
