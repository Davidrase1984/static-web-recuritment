import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './style.css'

const API_URL = import.meta.env.VITE_API_URL || ''

const originalFetch = window.fetch
window.fetch = async function(url, options = {}) {
  if (API_URL && typeof url === 'string' && url.startsWith('/api')) {
    url = API_URL + url
  }
  return originalFetch(url, options)
}

const app = createApp(App)
app.use(router)
app.mount('#app')
