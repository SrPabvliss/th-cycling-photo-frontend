<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NResult, NSpin } from 'naive-ui'

import DetailDrawer from '@/shared/components/DetailDrawer/DetailDrawer.vue'

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
  <DetailDrawer :show="show" title="Perfil del comprador" @close="close">
    <div v-if="isPending" class="bdd-loading">
      <NSpin size="large" />
    </div>

    <NResult v-else-if="isError" status="error" title="Error al cargar el comprador">
      <template #footer>
        <NButton @click="refetch()">Reintentar</NButton>
      </template>
    </NResult>

    <BuyerDetailBody v-else-if="buyer" :buyer="buyer" />
  </DetailDrawer>
</template>

<style scoped src="./buyer-detail-drawer.css" />
