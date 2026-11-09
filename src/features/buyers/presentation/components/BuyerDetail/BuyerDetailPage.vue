<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { ChevronBack } from '@vicons/ionicons5'

import { useBuyerDetailQuery } from '../../../composables/queries/use-buyer-detail'
import BuyerDetailBody from './BuyerDetailBody.vue'

const route = useRoute()
const router = useRouter()

const buyerId = computed(() => route.params.id as string)
const { data: buyer, isPending, isError, refetch } = useBuyerDetailQuery(buyerId)

function goBack() {
  router.back()
}
</script>

<template>
  <div class="bdp">
    <header class="bdp-head">
      <button type="button" class="bdp-back" @click="goBack">
        <NIcon :component="ChevronBack" :size="18" />
      </button>
      <span>Perfil del comprador</span>
    </header>

    <div class="bdp-scroll">
      <div v-if="isPending" class="bdp-loading">
        <NSpin size="large" />
      </div>

      <NResult v-else-if="isError" status="error" title="Error al cargar el comprador">
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <BuyerDetailBody v-else-if="buyer" :buyer="buyer" />
    </div>
  </div>
</template>

<style scoped src="./buyer-detail-page.css" />
