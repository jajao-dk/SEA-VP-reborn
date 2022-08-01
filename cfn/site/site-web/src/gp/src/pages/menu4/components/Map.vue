<script setup>
import { ref, onMounted, defineProps, watch, toRefs } from 'vue'
import { computed } from '@vue/reactivity'
import { Map, NavigationControl } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../../../scripts/mapbox' // import mapbox access-token
import { createLayerList, registLayer } from './LayerList'
import LayerListPanel from './LayerListPanel.vue'
// import { useAuth } from '../../../plugins/auth'
// import { sidePanel, registSidePanel } from '../composables/SidePanel'
// import LegendButton from './Modules/Control/LegendButton.js'
// import LegendPanel from './Modules/LegendPanel.vue'
// import SidePanel from './Modules/SidePanel/index.vue'

// const { getToken, token } = useAuth()
// console.log(token)

const props = defineProps({
  customerId: { type: String, default: '' },
  config: { type: Object, default: () => {} },
  pathParams: { type: Object, default: () => {} },
  errmVessels: { type: Object, default: () => {} },
  mapFocusVessel: { type: String, default: '' }
})

// initialize
const ready = ref(false)
const layerList = createLayerList(props.config, props.customerId, null, null, props.pathParams, props.errmGeoJson)
const mapMenuLayerList = computed(() => {
  const filteredList = {}
  for (const layerName in layerList) {
    if (!layerList[layerName].isHideMenuItem) {
      filteredList[layerName] = layerList[layerName]
    }
  }
  return filteredList
})

// watch props to check the eventfrom Menu4.vue
const { errmVessels, mapFocusVessel } = toRefs(props)
// new data event
watch(errmVessels, (newValue) => {
  console.log('ERRM Handler 2')
  console.log(newValue)
  console.log(props.errmVessels)
  layerList.ERRM.content.updateMapHandler(props.errmVessels)
}, { deep: true })
// map focus event
watch(mapFocusVessel, (newValue) => {
  console.log('FOCUS VESSEL on MAP')
  console.log(newValue)
  layerList.ERRM.content.onClickTable(newValue)
})

// Emits to trigger event to Menu4.vue
const emits = defineEmits(['mapVesselSelected'])

onMounted(async () => {
  console.log(props.config.map)
  console.log(props.customerId)
  console.log(props.pathParams)
  console.log(props.errmGeoJson)
  const map = new Map({
    ...props.config.map,
    container: 'map',
    // container: container.value,
    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: false
  })

  map.addControl(new NavigationControl({ showCompass: false }))
  // map.addControl(new LegendButton(isLegendDisplay), 'top-right')

  await map.onPromise('load')
  registLayer(map, layerList, { colorMode: props.config.theme })
  // registSidePanel(map, layerList, sidePanel)

  /*
  watch(layerList.ERRM.content.selectedIMO, (newValue) => {
    console.log('VESSEL ICON is CLICKED.')
    console.log(newValue)
  })
  */

  layerList.ERRM.content.event.addEventListener('shipIconClick', (e) => {
    console.log('ship icon click')
    console.log(e)
    const imo = e.detail.data
    console.log(imo)
    emits('mapVesselSelected', imo)
  })

  ready.value = true
})

</script>

<template>
  <div
    id="map"
    class="map"
  />
  <LayerListPanel
    v-if="ready"
    :layer-list="mapMenuLayerList"
  />
  <!--SidePanel
    v-if="ready"
    :show="sidePanel.show"
    :type="sidePanel.type"
    :content="sidePanel.content"
  /-->
  <!--LegendPanel
    :layer-list="layerList"
    :is-legend-display="isLegendDisplay"
  /-->
</template>

<style scoped>
.map {
  z-index: 0;
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
