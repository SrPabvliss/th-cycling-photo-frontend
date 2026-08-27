import '@/assets/styles/base.css'
import '@/assets/styles/breakpoints.css'
import '@/assets/styles/phone-input.css'
import '@/core/theme/theme-vars.css'
import '@/assets/styles/payphone-box.css'
import '@/core/config/env'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

import { registerCartLayoutSlots } from '@/features/cart/layout-slots'
import { registerCartPostLoginMerge } from '@/features/cart/post-login'
import { registerNotificationLayoutSlots } from '@/features/notifications/layout-slots'
import App from './App.vue'
import { queryClientConfig } from './providers'
import router from './router'

const app = createApp(App)
const queryClient = new QueryClient(queryClientConfig)

app.use(createPinia())
app.use(router)
app.use(VueQueryPlugin, { queryClient })

registerCartPostLoginMerge(queryClient)
registerCartLayoutSlots()
registerNotificationLayoutSlots()

app.mount('#app')
