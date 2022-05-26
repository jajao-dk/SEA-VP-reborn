import { inject, computed, ref } from 'vue'
import { createAuth0Proxy, createCustomProxy } from './proxy'

const key = 'auth'
const injectKey = Symbol(key)

function createAuth0Plugin () {
  const isInitialized = ref(false)
  const auth0 = createAuth0Proxy()
  const custom = createCustomProxy()

  const user = computed(() => ({ ...(custom.user.value ?? {}), ...(auth0.user.value ?? {}) }))

  return {
    isLoading: computed(() => auth0.isLoading.value || custom.isLoading.value),
    isAuthenticated: auth0.isAuthenticated,
    user,

    async login () { await auth0.login() },
    async handleLoginCallback () {
      await auth0.handleLoginCallback()

      const token = await auth0.getToken()
      await Promise.all([auth0.getUser(), custom.login(token)])
      isInitialized.value = true
    },
    async checkLogin () {
      if (!isInitialized.value) {
        const token = await auth0.getToken().catch(() => null)
        if (!token) {
          isInitialized.value = true
          return false
        }

        const loggedIn = await Promise.all([auth0.getUser(), custom.login(token)]).then(() => true).catch(() => false)
        isInitialized.value = true
        return loggedIn
      }
      return await auth0.checkLogin()
    },
    async logout () { await Promise.all([custom.logout(), auth0.logout()]) },
    async getToken () { return await auth0.getToken() },
    async getUser () {
      await Promise.all([auth0.getUser(), custom.getUser()])
      return user.value
    },

    install (app, options) {
      app.config.globalProperties[key] = this
      app.provide(injectKey, this)
    }
  }
}

export const auth = createAuth0Plugin()
export function useAuth () { return inject(injectKey) }
