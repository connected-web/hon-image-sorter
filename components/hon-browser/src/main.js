import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes.js'
import features from './features.js'

import FeatureToggle from './models/FeatureToggles'

const defaultFeatures = features

// Initialize the toggles using FeatureToggle class
FeatureToggle.initializeToggles(defaultFeatures)
FeatureToggle.defaultFeatures = defaultFeatures

const app = createApp(App)
app.use(router)
app.mount('#app')
