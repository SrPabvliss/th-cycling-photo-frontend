<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NResult, NSpin } from 'naive-ui'
import { useMediaQuery } from '@vueuse/core'

import { useAuth } from '@/features/auth/composables/use-auth'
import { canOperate } from '@/core/auth/capabilities'
import { useMyProfileQuery } from '@/features/account/composables/queries/use-my-profile'
import { useTenantProfile } from '@/features/tenant-profile/composables/queries/use-tenant-profile'
import PageHeader from '@/shared/components/PageHeader/PageHeader.vue'
import ProfileOrganizerDesktop from '../components/ProfileOrganizerDesktop/ProfileOrganizerDesktop.vue'
import ProfileOrganizerMobile from '../components/ProfileOrganizerMobile/ProfileOrganizerMobile.vue'
import ProfileBuyerDesktop from '../components/ProfileBuyerDesktop/ProfileBuyerDesktop.vue'
import ProfileBuyerMobile from '../components/ProfileBuyerMobile/ProfileBuyerMobile.vue'

const { currentUser } = useAuth()
const permissions = computed(() => currentUser.value?.permissions ?? [])
const isOperator = computed(() => canOperate(permissions.value))

const {
  data: myProfile,
  isPending: isMyProfilePending,
  isError: isMyProfileError,
  refetch: refetchMyProfile,
} = useMyProfileQuery()
const { data: tenantProfile, isPending: isTenantProfilePending } = useTenantProfile(isOperator)

const isMobile = useMediaQuery('(max-width: 1023px)')

const pageSubtitle = computed(() =>
  isOperator.value ? 'Tu cuenta y los datos de tu negocio' : 'Tus datos y el acceso a tu cuenta',
)
</script>

<template>
  <div class="profile-content">
    <PageHeader title="Perfil" :subtitle="pageSubtitle" />

    <NSpin v-if="isMyProfilePending" size="large" class="profile-content__spin" />

    <NResult
      v-else-if="isMyProfileError"
      status="error"
      title="No pudimos cargar tu perfil"
      description="Intenta de nuevo en unos segundos."
    >
      <template #footer>
        <NButton @click="refetchMyProfile()">Reintentar</NButton>
      </template>
    </NResult>

    <template v-else-if="!isOperator">
      <NSpin v-if="!myProfile" size="large" />
      <ProfileBuyerMobile v-else-if="isMobile" :my-profile="myProfile" />
      <ProfileBuyerDesktop v-else :my-profile="myProfile" />
    </template>

    <NSpin v-else-if="isTenantProfilePending || !myProfile || !tenantProfile" size="large" />

    <ProfileOrganizerMobile
      v-else-if="isMobile"
      :my-profile="myProfile"
      :tenant-profile="tenantProfile"
    />

    <ProfileOrganizerDesktop v-else :my-profile="myProfile" :tenant-profile="tenantProfile" />
  </div>
</template>

<style scoped src="./profile-content.css"></style>
