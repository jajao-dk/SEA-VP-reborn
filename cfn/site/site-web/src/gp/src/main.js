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
import { gtagConfig } from './scripts/gtag'
import VueGtag from 'vue-gtag'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import DrawerLayout from 'vue-drawer-layout'


const app = createApp(App)
app.use(createPinia())
app.use(auth)
app.use(router)
app.use(VueGtag, gtagConfig)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')
app.component('EasyDataTable', Vue3EasyDataTable)
Vue.use(DrawerLayout);