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
import TimeSlider from './TimeSlider.vue'
// import SidePanel from './Modules/SidePanel/index.vue'
import SimpleTypeAhead from 'vue3-simple-typeahead'
import LegendButton from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/Control/LegendButton'
import LegendPanel from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/LegendPanel.vue'

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
const isLegendDisplay = ref(false)
const timeSliderOn = ref(false)
const vesselList = ref([])

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
  for (let i = 0; i < newValue.length; i++) {
    const imo = newValue[i].imo_num
    const name = newValue[i].latest.vessel_name
    vesselList.value.push(name + '/' + imo)
  }
  vesselList.value.sort()
  console.log(vesselList.value)
  layerList.ERRM.content.updateMapHandler(props.errmVessels)
}, { deep: true })
// map focus event
watch(mapFocusVessel, (newValue) => {
  console.log('FOCUS VESSEL on MAP')
  console.log(newValue)
  layerList.ERRM.content.onClickTable(newValue)
  timeSliderOn.value = true
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
    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: false
  })

  map.addControl(new NavigationControl({ showCompass: false }))
  // map.addControl(new LegendButton(isLegendDisplay), 'top-right')

  await map.onPromise('load')
  registLayer(map, layerList, { colorMode: props.config.theme })
  // registSidePanel(map, layerList, sidePanel)

  layerList.ERRM.content.event.addEventListener('shipIconClick', (e) => {
    console.log('ship icon click')
    console.log(e)
    const imo = e.detail.data
    console.log(imo)
    emits('mapVesselSelected', imo)
    timeSliderOn.value = true
    console.log(timeSliderOn.value)
  })

  layerList.ERRM.content.event.addEventListener('cancelRoute', (e) => {
    console.log('cancel route')
    timeSliderOn.value = false
    console.log(timeSliderOn.value)
  })

  ready.value = true
})

const selectItemEventHandler = (item) => {
  const imo = item.split('/')[1]
  console.log('search vessel:' + imo)
  // props.vesselLayer.content.searchVessel(item)
  layerList.ERRM.content.onClickTable(imo)
  timeSliderOn.value = true
  emits('mapVesselSelected', imo)
  return false
}

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
  <TimeSlider
    v-if="ready"
    :layer-list="layerList"
    :back-hour="360"
    :futuer-hour="360"
    :color-mode="props.config.theme"
    :update-interval-second="0"
    :time-slider-on="timeSliderOn"
  />
  <div>
    <simple-type-ahead
      placeholder="Search vessels"
      :items="vesselList"
      :min-input-length="0"
      @selectItem="selectItemEventHandler"
    />
  </div>
  <!--SidePanel
    v-if="ready"
    :show="sidePanel.show"
    :type="sidePanel.type"
    :content="sidePanel.content"
  /-->
  <LegendPanel
    :layer-list="layerList"
    :is-legend-display="isLegendDisplay"
  />
</template>

<style scoped>
.map {
  z-index: 0;
  width: 100%;
  height: 100%;
  margin: 0;
}
</style>
<style>
/* search vessels */
.simple-typeahead {
  position: absolute;
  top: 10px;
  left: 80px;
  width: 200px;
  height: 25px;
  z-index: 5;
}
.simple-typeahead > input {
  font: 16px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica;
  padding: 5px;
  min-width: 200px;
  height: 25px;
  border-radius: 5px;
  font: 14px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica,
    sans-serif;
  border: solid 1px;
  border-color: #aaa;
  background-color: #eee;
}
.simple-typeahead .simple-typeahead-list {
  background-color: #ddd;
  min-width: 150px;
  width: 200px;
  border: none;
  max-height: 400px;
  overflow-y: auto;
  border: 0.1rem solid #d1d1d1;
  z-index: 9;
}
.simple-typeahead .simple-typeahead-list .simple-typeahead-list-item {
  font: 12px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica;
  height: 20px;
  cursor: pointer;
  background-color: #fafafa;
  padding: 0.3rem 0.3rem;
  border-top: 0.1rem solid #d1d1d1;
  border-bottom: 0.1rem solid #d1d1d1;
  border-left: 0.1rem solid #d1d1d1;
  border-right: 0.1rem solid #d1d1d1;
}
.simple-typeahead
  .simple-typeahead-list
  .simple-typeahead-list-item.simple-typeahead-list-item-active {
  background-color: #e1e1e1;
}
</style>
