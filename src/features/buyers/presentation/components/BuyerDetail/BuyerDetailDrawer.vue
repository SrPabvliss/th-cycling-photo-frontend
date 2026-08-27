<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NDrawer, NDrawerContent, NResult, NSpin } from 'naive-ui'

import { useBuyerDetailQuery } from '../../../composables/queries/use-buyer-detail'
import BuyerDetailBody from './BuyerDetailBody.vue'

const props = defineProps<{
  show: boolean
  buyerId: string | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const id = computed(() => props.buyerId ?? '')
const { data: buyer, isPending, isError, refetch } = useBuyerDetailQuery(id)

function close() {
  emit('update:show', false)
}
</script>

<template>
  <NDrawer :show="show" :width="520" placement="right" @update:show="close">
    <NDrawerContent title="Perfil del comprador" closable class="bdd-content">
      <div v-if="isPending" class="bdd-loading">
        <NSpin size="large" />
      </div>

      <NResult v-else-if="isError" status="error" title="Error al cargar el comprador">
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <BuyerDetailBody v-else-if="buyer" :buyer="buyer" />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped src="./buyer-detail-drawer.css" />
