/// <reference types="vite/client" />

declare module 'intl-tel-input/styles' {
  const content: string
  export default content
}

declare module 'intl-tel-input/vueWithUtils' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
