import Home from './pages/Home.vue'
import Folders from './pages/Folders.vue'
import Settings from './pages/Settings.vue'

import * as VueRouter from 'vue-router'

const routes = [
    { path: '/', component: Home },
    { path: '/folders', component: Folders },
    { path: '/settings', component: Settings },
    { path: '/:folderPath(.*)', component: Home, props: true },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})

export default router