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

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>
  export default component
}
