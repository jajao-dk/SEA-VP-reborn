import { createApp } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import { auth } from '../../plugins/auth'
import 'tailwindcss/tailwind.css'
import '../../assets/font'

const app = createApp(App)
app.use(auth)
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.mount('#app')
