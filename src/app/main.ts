import '@/assets/styles/base.css'
import '@/core/theme/theme-vars.css'
import '@/core/config/env'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import { queryClientConfig } from './providers'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClientConfig })

app.mount('#app')
