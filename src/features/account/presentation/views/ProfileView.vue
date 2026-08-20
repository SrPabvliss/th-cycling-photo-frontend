<script setup lang="ts">
import { NButton, NResult, NSpin } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { useMyProfileQuery } from '../../composables/queries/use-my-profile'
import ProfileForm from '../components/ProfileForm/ProfileForm.vue'
import PhoneList from '../components/PhoneList/PhoneList.vue'

const { data: profile, isPending, isError, refetch } = useMyProfileQuery()
</script>

<template>
  <PublicLayout>
    <div class="profile-view">
      <h1 class="profile-view__title">Mi perfil</h1>

      <NSpin v-if="isPending" size="large" class="profile-view__spin" />

      <NResult
        v-else-if="isError"
        status="error"
        title="No pudimos cargar tu perfil"
        description="Intenta de nuevo en unos segundos."
      >
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <template v-else-if="profile">
        <ProfileForm :profile="profile" />
        <PhoneList />
      </template>
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/profile-view.css"></style>
