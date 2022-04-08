import { ref, watch } from 'vue'
import axios from 'axios'
import { createCache } from './cache'
import { call } from './utils'

export function createCustomProxy () {
  const isLoading = ref(false)
  const user = ref(null)
  const error = ref(null)
  const cache = createCache()

  function createCacheKey () {
    return `wni.${import.meta.env.VITE_AUTH0_CLIENT_ID}.${import.meta.env.VITE_AUTH0_IDENTIFIER}`
  }

  function reset () {
    user.value = null
    error.value = null
  }

  watch(user, (value) => {
    const key = createCacheKey()
    if (value != null) cache.set(key, value)
    else cache.remove(key)
  })

  return {
    isLoading,
    user,
    error,

    async login (token) {
      return await call(
        async () => {
          const res = await axios.get('/api/v1/auth/login', { headers: { Authorization: `Bearer ${token}` } })
          return res.data
        },
        { prop: user, isLoading, error }
      )
    },

    async getUser () {
      return await call(() => cache.get(createCacheKey()), { prop: user })
    },

    async logout () {
      await call(() => axios.get('/api/v1/auth/logout'), { final: () => reset })
    }
  }
}
