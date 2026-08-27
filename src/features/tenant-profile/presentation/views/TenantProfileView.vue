<script setup lang="ts">
import { NFlex, NSpin } from 'naive-ui'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useTenantProfile } from '../../composables/queries/use-tenant-profile'
import BrandSection from '../sections/BrandSection.vue'
import ContactSection from '../sections/ContactSection.vue'
import ContractsSection from '../sections/ContractsSection.vue'
import PayoutSection from '../sections/PayoutSection.vue'

const { data: profile, isLoading } = useTenantProfile()
</script>

<template>
  <div class="page-view">
    <div class="page-view__content profile-content">
      <PageHeader title="Mi perfil" subtitle="Marca, contacto, contratos y métodos de cobro" />

      <div v-if="isLoading" style="text-align: center; padding: 40px">
        <NSpin size="large" />
      </div>

      <NFlex v-else-if="profile" vertical :size="16">
        <BrandSection :profile="profile" />
        <ContactSection :profile="profile" />
        <ContractsSection />
        <PayoutSection :whatsapp-number="profile.whatsappNumber" />
      </NFlex>
    </div>
  </div>
</template>

<style scoped>
.profile-content {
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  max-width: 720px;
}
</style>
