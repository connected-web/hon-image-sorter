import Home from './pages/Home.vue'
import Settings from './pages/Settings.vue'

import * as VueRouter from 'vue-router'

const routes = [
    { path: '/', component: Home },
    { path: '/settings', component: Settings }
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})

export default router