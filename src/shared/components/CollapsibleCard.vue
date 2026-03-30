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

<style scoped>
/* Remove NCollapse item default top border */
.collapsible-card :deep(.n-collapse-item) {
  border-top: none !important;
}

/* Header: use exact same value top and bottom */
.collapsible-card :deep(.n-collapse-item__header) {
  padding: 14px 16px !important;
}

/* Separator line between header and content when expanded */
.collapsible-card :deep(.n-collapse-item--active .n-collapse-item__header) {
  border-bottom: 1px solid #ebebeb;
}

/* Content area: match header horizontal padding */
.collapsible-card :deep(.n-collapse-item__content-inner) {
  padding: 14px 16px !important;
}

.collapsible-card__header {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.collapsible-card__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.collapsible-card__subtitle {
  font-size: 12px;
  color: var(--tt-neutral-mid);
  font-weight: 400;
  line-height: 1.3;
}
</style>
