<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import { ArrowBack } from '@vicons/ionicons5'

const props = defineProps<{
  title: string
  subtitle?: string
  backTo?: string
}>()

const router = useRouter()

function handleBack() {
  if (props.backTo) {
    router.push(props.backTo)
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="page-header">
    <div class="page-header__left">
      <button v-if="backTo !== undefined" class="page-header__back" @click="handleBack">
        <NIcon :component="ArrowBack" :size="20" />
      </button>
      <div>
        <h1 class="page-header__title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="page-header__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped src="./page-header.css" />
