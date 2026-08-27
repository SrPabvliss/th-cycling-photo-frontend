<script setup lang="ts">
import { ref, watch } from 'vue'
import { NCard, NCollapse, NCollapseItem } from 'naive-ui'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    defaultExpanded?: boolean
  }>(),
  { defaultExpanded: true },
)

const expandedNames = ref<string[]>(props.defaultExpanded ? ['content'] : [])

watch(
  () => props.defaultExpanded,
  (val) => {
    expandedNames.value = val ? ['content'] : []
  },
)
</script>

<template>
  <NCard
    class="collapsible-card"
    :content-style="{ padding: 0 }"
    :header-style="{ display: 'none' }"
  >
    <NCollapse v-model:expanded-names="expandedNames" :trigger-areas="['main', 'arrow']">
      <NCollapseItem name="content">
        <template #header>
          <div class="collapsible-card__header">
            <span class="collapsible-card__title">{{ title }}</span>
            <span v-if="subtitle" class="collapsible-card__subtitle">{{ subtitle }}</span>
          </div>
        </template>
        <slot />
      </NCollapseItem>
    </NCollapse>
  </NCard>
</template>

<style scoped src="./collapsible-card.css" />
