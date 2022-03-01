import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import { auth } from './plugins/auth'
import { router } from './router'
import 'tailwindcss/tailwind.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import './scripts/mapbox'
import './assets/font'

const app = createApp(App)
app.use(createPinia())
app.use(auth)
app.use(router)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')
