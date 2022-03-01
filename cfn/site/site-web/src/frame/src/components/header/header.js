import { watch, toRef, ref } from 'vue'
import { useRoute } from 'vue-router'

export function useHeader () {
  const route = useRoute()

  const menuOpen = ref(false)

  function setMenu (value) { menuOpen.value = value }
  function toggleMenu () { menuOpen.value = !menuOpen.value }

  watch(toRef(route, 'name'), () => { setMenu(false) })

  return { menuOpen, toggleMenu }
}
