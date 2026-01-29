/// <reference types="@dcloudio/types" />

import { DefineComponent } from 'vue'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    type?: string
  }
}

declare module '@vue/runtime-core' {
  interface AllowedComponentProps {
    type?: string
  }
}

export {}
