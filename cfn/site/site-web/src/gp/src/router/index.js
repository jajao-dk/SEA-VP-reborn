import {
  createRouter as baseCreateRouter,
  createWebHashHistory
} from 'vue-router'
import { createAuthGuard } from '../plugins/auth'
import Dashboard from '../pages/dashboard/Dashboard.vue'
import Home from '../pages/Home.vue'
import Profile from '../pages/Profile.vue'
import NotFound from '../pages/NotFound.vue'

function createRouter() {
  const routes = [
    {
      name: 'login',
      path: '/login',
      component: () => import('../pages/Login.vue')
    },
    {
      path: '/',
      component: Dashboard,
      children: [
        { name: 'home', path: '', component: Home },
        { name: 'profile', path: 'profile', component: Profile },
        {
          name: 'menu1',
          path: 'menu1',
          component: () => import('../pages/menu1/Menu1.vue')
        },
        {
          name: 'menu2',
          path: 'menu2',
          component: () => import('../pages/menu2/Menu2.vue')
        },
        {
          name: 'menu3',
          path: 'menu3',
          component: () => import('../pages/menu3/Menu3.vue')
        },
        {
          name: 'menu4',
          path: 'menu4',
          component: () => import('../pages/menu4/Menu4.vue')
        },
        {
          name: 'menu5',
          path: 'menu5',
          component: () => import('../pages/menu5/Menu5.vue')
        },
        {
          name: 'menu6',
          path: 'menu6',
          component: () => import('../pages/menu6/Menu6.vue')
        }
      ]
    },
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
