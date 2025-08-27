import { createApp } from 'vue'
import { createPinia } from 'pinia'

// UnoCSS
import 'virtual:uno.css'
import '@unocss/reset/tailwind.css'

// Vuetify
import vuetify from './plugins/vuetify'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
