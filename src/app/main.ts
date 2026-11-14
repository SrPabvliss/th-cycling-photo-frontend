import '@/assets/styles/base.css'
import '@/assets/styles/breakpoints.css'
import '@/assets/styles/phone-input.css'
import '@/assets/styles/modal-form.css'
import '@/core/theme/theme-vars.css'
import '@/core/theme/client/awana-tokens.css'
import '@/core/theme/client/layers.css'
import '@/assets/styles/payphone-box.css'
import '@/core/config/env'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

import { startOnlineState } from '@/core/network/use-online'
import { useColorSchemeStore } from '@/core/theme/color-scheme.store'
import { registerHouseSpotsLayoutSlots } from '@/features/house-spots/layout-slots'
import { registerCartLayoutSlots } from '@/features/cart/layout-slots'
import { registerCartPostLoginMerge } from '@/features/cart/post-login'
import { registerNotificationLayoutSlots } from '@/features/notifications/layout-slots'
import { registerPricingLayoutSlots } from '@/features/pricing/layout-slots'
import App from './App.vue'
import { queryClientConfig } from './providers'
import router from './router'

const app = createApp(App)
const queryClient = new QueryClient(queryClientConfig)
// vue-query hears from the device whether there is network before the first query runs.
startOnlineState()

const pinia = createPinia()

app.use(pinia)
// Reads the saved color scheme and keeps it on the root element from the first paint.
useColorSchemeStore(pinia)
app.use(router)
app.use(VueQueryPlugin, { queryClient })

registerCartPostLoginMerge(queryClient)
registerHouseSpotsLayoutSlots()
registerCartLayoutSlots()
registerNotificationLayoutSlots()
registerPricingLayoutSlots()

app.mount('#app')
