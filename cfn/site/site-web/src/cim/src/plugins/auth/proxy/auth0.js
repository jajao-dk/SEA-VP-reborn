import { ref } from 'vue'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { createCache } from './cache'
import { call } from './utils'

const uriBase = `${document.location.origin}${import.meta.env.BASE_URL ?? '/'}index.html`

export function createAuth0Proxy () {
  const isLoading = ref(false)
  const isAuthenticated = ref(false)
  const user = ref(null)
  const error = ref(null)

  const client = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    client_id: import.meta.env.VITE_AUTH0_CLIENT_ID,
    audience: import.meta.env.VITE_AUTH0_IDENTIFIER,
    redirect_uri: uriBase,
    useRefreshTokens: true,
    cache: createCache()
  })

  function reset () {
    user.value = null
    error.value = null
  }

  return {
    isLoading,
    isAuthenticated,
    user,
    error,

    async login () {
      await call(() => client.loginWithRedirect(), { error })
    },

    async handleLoginCallback () {
      await call(
        async () => {
          await client.handleRedirectCallback()
          return true
        },
        { prop: isAuthenticated, isLoading, error }
      )
    },
    async getUser () {
      return await call(
        async () => {
          await client.getTokenSilently()
          return await client.getUser()
        },
        { prop: user, isLoading, error }
      )
    },

    async checkLogin () {
      return await call(
        () => client.getTokenSilently().then(() => true).catch(() => false),
        { prop: isAuthenticated, isLoading }
      )
    },

    async logout () {
      await call(() => client.logout({ returnTo: uriBase }), { final: reset })
    },

    async getToken () {
      return await call(() => client.getTokenSilently(), { isLoading, error })
    }
  }
}
