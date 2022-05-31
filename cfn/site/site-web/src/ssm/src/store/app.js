import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('app', () => {
  const loading = ref(false)

  return {
    loading,

    setLoading (value) { loading.value = value }
  }
})
