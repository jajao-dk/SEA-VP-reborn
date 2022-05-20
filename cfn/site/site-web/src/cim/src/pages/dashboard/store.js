import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('dashboard', () => {
  const drawerOpen = ref(false)
  const menuOpen = ref(false)

  return {
    drawerOpen,
    menuOpen,

    setDrawer (value) { drawerOpen.value = value },
    toggleDrawer () { drawerOpen.value = !drawerOpen.value },
    setMenu (value) { menuOpen.value = value },
    toggleMenu () { menuOpen.value = !menuOpen.value },
    close () {
      drawerOpen.value = false
      menuOpen.value = false
    }
  }
})
