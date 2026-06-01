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

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.page-header__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.page-header__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
}

.page-header__back:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #111827;
}

.page-header__title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  line-height: 1.2;
}

.page-header__subtitle {
  font-size: 13px;
  color: #6b7280;
  margin: 2px 0 0;
}

.page-header__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Tablet: ligera compresión */
@media (max-width: 767px) {
  .page-header {
    margin-bottom: 12px;
    gap: 10px;
  }

  .page-header__title {
    font-size: 18px;
  }

  .page-header__subtitle {
    font-size: 12px;
  }
}

/* Mobile estricto: header en 1 sola fila compacta, sin subtítulo */
@media (max-width: 479px) {
  .page-header {
    margin-bottom: 8px;
    gap: 8px;
  }

  .page-header__left {
    gap: 8px;
  }

  .page-header__back {
    width: 32px;
    height: 32px;
  }

  .page-header__title {
    font-size: 16px;
    line-height: 1.25;
  }

  .page-header__subtitle {
    display: none;
  }
}
</style>
