<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NModal } from 'naive-ui'
import { CheckmarkCircleOutline, CloseOutline } from '@vicons/ionicons5'

const props = defineProps<{
  show: boolean
  createdMethods: string[]
}>()

const emit = defineEmits<{
  'update:show': [boolean]
  stay: []
  leave: []
}>()

const createdLine = computed(() => {
  const names = props.createdMethods
  if (names.length === 0) return ''
  const joined =
    names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`
  const verb = names.length === 1 ? 'ya quedó creado' : 'ya quedaron creados'
  return `${joined} ${verb} en tu cuenta`
})

function stay() {
  emit('update:show', false)
  emit('stay')
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="¿Salir sin crear el evento?"
    style="width: 460px; max-width: calc(100vw - 32px)"
    @update:show="emit('update:show', $event)"
  >
    <div class="ce-exit" data-test="exit-modal">
      <p class="ce-exit-sub">No guardamos lo que llevas: si sales, se pierde lo que escribiste.</p>

      <ul class="ce-loselist">
        <li class="bad" data-test="exit-lose">
          <NIcon :component="CloseOutline" :size="14" />
          <span>Se pierden la configuración y los detalles de este evento.</span>
        </li>
        <li v-if="createdMethods.length > 0" class="keep" data-test="exit-keep">
          <NIcon :component="CheckmarkCircleOutline" :size="14" />
          <span>
            <b>{{ createdLine }}</b> — eso sí se guardó y lo verás en tu perfil.
          </span>
        </li>
      </ul>
    </div>

    <template #footer>
      <div class="ce-exit-foot">
        <NButton data-test="exit-stay" @click="stay">Seguir aquí</NButton>
        <NButton type="error" data-test="exit-leave" @click="emit('leave')">
          Salir y perder los datos
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./exit-warning-modal.css" />
