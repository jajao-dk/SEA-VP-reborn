import { createRouter as baseCreateRouter, createWebHashHistory } from 'vue-router'
import { createAuthGuard } from '../plugins/auth'
import Home from '../pages/Home.vue'
import NotFound from '../pages/NotFound.vue'

function createRouter () {
  const routes = [
    {
      name: 'login',
      path: '/login',
      component: () => import('../pages/Login.vue')
    },
    { name: 'home', path: '/', component: Home },
    { name: 'not-found', path: '/:pathMatch(.*)*', component: NotFound }
  ]
  const ignoreRoutes = ['login', 'not-found']

  const guard = createAuthGuard()
  const router = baseCreateRouter({ routes, history: createWebHashHistory() })
  router.beforeEach(async (to) => {
    if (ignoreRoutes.includes(to.name)) return
    return guard()
  })

  return router
}

export const router = createRouter()
