<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'
import { useEventListener } from '@vueuse/core'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    show: boolean
    title: string
    padded?: boolean
  }>(),
  { padded: true },
)

const emit = defineEmits<{
  close: []
}>()

useEventListener(document, 'keydown', (event: KeyboardEvent) => {
  if (props.show && event.key === 'Escape') emit('close')
})
</script>

<template>
  <div v-if="show" class="detail-drawer">
    <div class="detail-drawer__scrim" @click="emit('close')" />
    <aside class="detail-drawer__panel" v-bind="$attrs">
      <div class="detail-drawer__head">
        <span>{{ title }}</span>
        <button
          type="button"
          class="detail-drawer__close"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <NIcon :component="CloseOutline" :size="15" />
        </button>
      </div>
      <div class="detail-drawer__body" :class="{ 'detail-drawer__body--padded': padded }">
        <slot />
      </div>
    </aside>
  </div>
</template>

<style scoped src="./detail-drawer.css" />
