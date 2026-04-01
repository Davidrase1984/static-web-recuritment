import { createRouter, createWebHistory } from 'vue-router'
import HRAdminPage from '../views/HRAdminPage.vue'
import HiringManagerPage from '../views/HiringManagerPage.vue'
import DirectorPage from '../views/DirectorPage.vue'

const routes = [
  { path: '/', redirect: '/hr-admin' },
  { path: '/hr-admin', name: 'HRAdmin', component: HRAdminPage },
  { path: '/hiring-manager', name: 'HiringManager', component: HiringManagerPage },
  { path: '/director', name: 'Director', component: DirectorPage }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
