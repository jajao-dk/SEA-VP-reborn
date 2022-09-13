<script setup>
import { reactive } from 'vue'
import { useStore } from './store'
import { useAppItems } from './appItems'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import DrawerMenu from './components/DrawerMenu.vue'

const store = useStore()
const routes = useRouter().getRoutes()
// const home = routes.find(route => route.name === 'home')
const emd = reactive(routes.find(route => route.name === 'menu1'))
const gpvcs = reactive(routes.find(route => route.name === 'menu2'))
const gptap = reactive(routes.find(route => route.name === 'menu3'))
const gperrm = reactive(routes.find(route => route.name === 'menu4'))
const gpvc = reactive(routes.find(route => route.name === 'menu5'))
const gppe = reactive(routes.find(route => route.name === 'menu6'))
const cimrd = reactive(routes.find(route => route.name === 'menu7'))

const { getAppItems } = useAppItems()

onMounted(async () => {
  const appItems = await getAppItems()

  emd.meta.isEnabled = appItems.emd.isEnabled
  gpvcs.meta.isEnabled = appItems.gpvcs.isEnabled
  gptap.meta.isEnabled = appItems.gptap.isEnabled
  gperrm.meta.isEnabled = appItems.gperrm.isEnabled
  gpvc.meta.isEnabled = appItems.gpvc.isEnabled
  gppe.meta.isEnabled = appItems.gppe.isEnabled
  cimrd.meta.isEnabled = appItems.cimrd.isEnabled
})
</script>

<template>
  <div
    class="absolute inset-y-0 w-72 z-50 bg-gray-100/60 backdrop-blur-md shadow-2xl border-r-2 border-gray-200 transform duration-500 ease-in-out"
    :class="{ 'left-0': store.drawerOpen, '-left-72': !store.drawerOpen }"
  >
    <div class="flex py-2 flex-col text-gray-800">
      <b class="py-2 self-center">Planning</b>
      <DrawerMenu :menu="gpvcs" />
      <DrawerMenu :menu="gptap" />
      <b class="py-2 self-center">Underway</b>
      <DrawerMenu :menu="gperrm" />
      <DrawerMenu :menu="gpvc" />
      <b class="py-2 self-center">Analysis</b>
      <DrawerMenu :menu="cimrd" />
      <DrawerMenu :menu="emd" />
      <DrawerMenu :menu="gppe" />
    </div>
  </div>
</template>
