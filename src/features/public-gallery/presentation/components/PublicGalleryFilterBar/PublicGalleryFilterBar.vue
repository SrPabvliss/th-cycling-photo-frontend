<script setup lang="ts">
import { NIcon, NInput, NRadioButton, NRadioGroup } from 'naive-ui'
import { Search } from '@vicons/ionicons5'

type IBibMatch = 'exact' | 'starts' | 'contains'

interface ICategoryOption {
  id: number
  name: string
  count?: number
}

defineProps<{
  categories: ICategoryOption[]
  selectedCategoryId: number | null
  bibNumber: string
  bibMatch: IBibMatch
}>()

const emit = defineEmits<{
  'update:selectedCategoryId': [id: number | null]
  'update:bibNumber': [value: string]
  'update:bibMatch': [mode: IBibMatch]
}>()
</script>

<template>
  <div class="pgfb">
    <div v-if="categories.length > 0" class="pgfb__row pgfb__row--chips">
      <button
        type="button"
        class="pgfb__chip"
        :class="{ 'pgfb__chip--active': selectedCategoryId === null }"
        @click="emit('update:selectedCategoryId', null)"
      >
        Todas
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        type="button"
        class="pgfb__chip"
        :class="{ 'pgfb__chip--active': selectedCategoryId === cat.id }"
        @click="emit('update:selectedCategoryId', cat.id)"
      >
        {{ cat.name }}
        <span v-if="cat.count !== undefined" class="pgfb__chip-count">{{ cat.count }}</span>
      </button>
    </div>

    <div class="pgfb__row pgfb__row--search">
      <NInput
        :value="bibNumber"
        placeholder="Buscar por número de placa"
        clearable
        size="medium"
        class="pgfb__input"
        @update:value="(v: string) => emit('update:bibNumber', v)"
      >
        <template #prefix>
          <NIcon :component="Search" />
        </template>
      </NInput>
      <NRadioGroup
        :value="bibMatch"
        size="small"
        class="pgfb__match"
        @update:value="(v: IBibMatch) => emit('update:bibMatch', v)"
      >
        <NRadioButton value="exact">Exacto</NRadioButton>
        <NRadioButton value="starts">Empieza con</NRadioButton>
        <NRadioButton value="contains">Contiene</NRadioButton>
      </NRadioGroup>
    </div>
  </div>
</template>

<style scoped src="./public-gallery-filter-bar.css" />
