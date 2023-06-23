import ImageViewer from './pages/ImageViewer.vue'
import Folders from './pages/Folders.vue'
import FeatureToggles from './pages/FeatureToggles.vue'
import ActionConfig from './pages/ActionConfig.vue'

import * as VueRouter from 'vue-router'

const routes = [
  { path: '/', component: Folders },
  { path: '/settings/feature-toggles', component: FeatureToggles },
  { path: '/settings/action-config', component: ActionConfig },
  { path: '/:folderPath(.*)', component: ImageViewer, props: true }
]

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
})

export default router
