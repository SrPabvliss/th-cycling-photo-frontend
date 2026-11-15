<script setup lang="ts">
import { ref } from 'vue'
import {
  NButton,
  NCard,
  NDrawer,
  NDrawerContent,
  NInput,
  NModal,
  NPopover,
  NTag,
  useMessage,
} from 'naive-ui'

import { useColorSchemeStore } from '@/core/theme/color-scheme.store'
import { message as discreteMessage } from '@/core/ui/discrete-api'
import {
  BusyNote,
  ErrorState,
  LoadBoundary,
  ProgressCount,
  TtSkeleton,
} from '@/shared/components/loading'

// Development only (see standalone-routes.ts): every shared piece of the client area in its
// states, to check the client theme in light and dark without going through a real screen.

type BoundaryStatus = 'pending' | 'error' | 'success'

const schemeStore = useColorSchemeStore()
const message = useMessage()

const status = ref<BoundaryStatus>('success')
const isEmpty = ref(false)
const isRefreshing = ref(false)
const done = ref(3)
const total = 8

const showModal = ref(false)
const showDrawer = ref(false)
const text = ref('')

const statuses: BoundaryStatus[] = ['pending', 'error', 'success']

function advance() {
  done.value = done.value >= total ? 0 : done.value + 1
}
</script>

<template>
  <main class="ui-sample">
    <header class="ui-sample__header">
      <h1 class="ui-sample__title">Muestra de la base de cliente</h1>
      <p class="ui-sample__lead">
        Esquema: {{ schemeStore.scheme }} (preferencia: {{ schemeStore.preference }})
      </p>
      <div class="ui-sample__row">
        <NButton type="primary" data-test="toggle-scheme" @click="schemeStore.toggle()">
          Cambiar a {{ schemeStore.scheme === 'light' ? 'oscuro' : 'claro' }}
        </NButton>
        <NButton @click="schemeStore.setPreference('system')">Seguir al sistema</NButton>
        <RouterLink to="/">Ir a Inicio</RouterLink>
        <RouterLink to="/gallery">Ir a Eventos</RouterLink>
        <RouterLink to="/events">Ir al panel</RouterLink>
      </div>
    </header>

    <section class="ui-sample__section">
      <h2 class="ui-sample__heading">Naive con el tema de cliente</h2>
      <div class="ui-sample__row">
        <NButton type="primary">Primario</NButton>
        <NButton>Por defecto</NButton>
        <NButton type="error">Peligro</NButton>
        <NButton type="primary" loading>Cargando</NButton>
        <NButton disabled>Deshabilitado</NButton>
        <NButton text type="primary">Texto</NButton>
      </div>
      <div class="ui-sample__row">
        <NButton type="primary" size="small">Pequeño</NButton>
        <NButton type="primary" size="large">Grande</NButton>
      </div>
      <div class="ui-sample__row">
        <NInput v-model:value="text" placeholder="Escribe algo" class="ui-sample__input" />
        <NTag>Etiqueta</NTag>
        <NTag type="success">Pagado</NTag>
        <NTag type="warning">Pendiente</NTag>
        <NTag type="error">Rechazado</NTag>
      </div>
      <NCard title="Tarjeta">Contenido de una tarjeta con el tema de cliente.</NCard>
    </section>

    <section class="ui-sample__section">
      <h2 class="ui-sample__heading">Capas fuera de la app</h2>
      <div class="ui-sample__row">
        <NButton data-test="open-modal" @click="showModal = true">Abrir modal</NButton>
        <NButton data-test="open-drawer" @click="showDrawer = true">Abrir drawer</NButton>
        <NPopover trigger="click">
          <template #trigger>
            <NButton data-test="open-popover">Abrir popover</NButton>
          </template>
          Contenido del popover
        </NPopover>
        <NButton data-test="open-message" @click="message.success('Aviso del proveedor')">
          Aviso
        </NButton>
        <NButton
          data-test="open-discrete-message"
          @click="discreteMessage.success('Aviso de la api discreta')"
        >
          Aviso (api discreta)
        </NButton>
      </div>
    </section>

    <section class="ui-sample__section">
      <h2 class="ui-sample__heading">LoadBoundary</h2>
      <div class="ui-sample__row">
        <NButton
          v-for="option in statuses"
          :key="option"
          :type="status === option ? 'primary' : 'default'"
          size="small"
          @click="status = option"
        >
          {{ option }}
        </NButton>
        <NButton size="small" :type="isEmpty ? 'primary' : 'default'" @click="isEmpty = !isEmpty">
          empty
        </NButton>
        <NButton
          size="small"
          :type="isRefreshing ? 'primary' : 'default'"
          @click="isRefreshing = !isRefreshing"
        >
          refreshing
        </NButton>
      </div>
      <LoadBoundary
        :status="status"
        what="los eventos"
        :empty="isEmpty"
        :refreshing="isRefreshing"
        @retry="status = 'pending'"
      >
        <template #skeleton>
          <div class="ui-sample__stack">
            <TtSkeleton height="var(--tt-space-8)" radius="l" />
            <TtSkeleton width="60%" radius="text" />
            <TtSkeleton width="40%" radius="text" />
          </div>
        </template>
        <template #empty>
          <p class="ui-sample__lead">Todavía no hay nada aquí.</p>
        </template>
        <NCard title="Contenido cargado">Esto es lo que la carga trajo.</NCard>
      </LoadBoundary>
    </section>

    <section class="ui-sample__section">
      <h2 class="ui-sample__heading">TtSkeleton</h2>
      <div class="ui-sample__stack">
        <TtSkeleton radius="text" />
        <TtSkeleton width="50%" radius="s" />
        <TtSkeleton height="var(--tt-control-m)" radius="m" />
        <TtSkeleton height="var(--tt-space-8)" radius="l" />
        <TtSkeleton width="var(--tt-space-8)" height="var(--tt-control-s)" radius="pill" />
      </div>
    </section>

    <section class="ui-sample__section">
      <h2 class="ui-sample__heading">ErrorState</h2>
      <ErrorState what="los eventos" />
      <ErrorState what="los eventos" kind="server" retrying />
      <ErrorState what="los eventos" kind="timeout" />
      <ErrorState what="los eventos" kind="offline" />
      <ErrorState what="tus compras" text="Tus fotos están a salvo." stacked />
    </section>

    <section class="ui-sample__section">
      <h2 class="ui-sample__heading">BusyNote</h2>
      <BusyNote text="Confirmando tu pago" />
      <BusyNote text="Abriendo la pasarela" size="s" />
    </section>

    <section class="ui-sample__section">
      <h2 class="ui-sample__heading">ProgressCount</h2>
      <ProgressCount :done="done" :total="total" label="Descargando">
        <template #action>
          <NButton size="small" @click="advance">Avanzar</NButton>
        </template>
      </ProgressCount>
    </section>

    <NModal v-model:show="showModal" preset="card" title="Modal" class="ui-sample__modal">
      Un modal se pinta fuera de la app, en el body.
      <template #footer>
        <NButton type="primary" @click="showModal = false">Entendido</NButton>
      </template>
    </NModal>

    <NDrawer v-model:show="showDrawer" placement="right" width="var(--tt-drawer-width)">
      <NDrawerContent title="Drawer" closable>
        Un drawer también se pinta fuera de la app.
      </NDrawerContent>
    </NDrawer>
  </main>
</template>

<style>
.ui-sample__modal {
  max-inline-size: var(--tt-drawer-width);
}
</style>

<style scoped>
.ui-sample {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-6);
  max-inline-size: var(--tt-container-max);
  margin-inline: auto;
  padding: var(--tt-space-5) var(--tt-space-4) var(--tt-space-8);
  color: var(--tt-ink);
  font-family: var(--tt-font-sans);
}

.ui-sample__header,
.ui-sample__section,
.ui-sample__stack {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
}

.ui-sample__title {
  font-family: var(--tt-type-display-s-family);
  font-size: var(--tt-type-display-s-size);
  line-height: var(--tt-type-display-s-line);
  font-weight: var(--tt-type-display-s-weight);
}

.ui-sample__heading {
  font-family: var(--tt-type-title-family);
  font-size: var(--tt-type-title-size);
  line-height: var(--tt-type-title-line);
  font-weight: var(--tt-type-title-weight);
}

.ui-sample__lead {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-size);
  line-height: var(--tt-type-body-line);
}

.ui-sample__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tt-space-3);
}

.ui-sample__row a {
  color: var(--tt-primary-ink);
}

.ui-sample__input {
  max-inline-size: var(--tt-sidebar-width);
}
</style>
