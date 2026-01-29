import App from './App.vue'

// #ifndef VUE3
// @ts-ignore
import * as Vue from 'vue'
import './uni.promisify.adaptor'
// @ts-ignore
Vue.config.productionTip = false
App.mpType = 'app'
// @ts-ignore
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
