<script setup>
import { ref, onMounted, defineProps, watch, toRefs } from 'vue'
import { computed } from '@vue/reactivity'
import { Map, NavigationControl } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '../../../scripts/mapbox' // import mapbox access-token
import { createLayerList, registLayer } from './LayerList'
import LayerListPanel from './LayerListPanel.vue'
import { useAuth } from '../../../plugins/auth'
// import '/src/assets/styles/app.css'

// import from SEA-MapWidget-Web
import { sidePanel, registSidePanel } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/composables/SidePanel'
import LegendButton from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/Control/LegendButton.js'
import LegendPanel from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/LegendPanel.vue'
import TimeSlider from './TimeSlider.vue'
// import TimeSlider from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/TimeSlider.vue'
import SidePanel from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/SidePanel/index.vue'
// import VesselAlertList from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/VesselAlertList.vue'
// import VesselSectionList from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/VesselSectionList.vue'
// import VesselSearchVessel from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Modules/VesselSearch.vue'

const { getToken } = useAuth()
// const token = await getToken()
// console.log(token)

const props = defineProps({
  customerId: { type: String, default: '' },
  legData: { type: Object, default: () => {} },
  config: { type: Object, default: () => {} },
  pathParams: { type: Object, default: () => {} },
  // errmVessels: { type: Object, default: () => {} },
  mapFocusVessel: { type: String, default: '' },
  token: { type: String, default: '' }
})

const ready = ref(false)
const layerList = createLayerList(props.config, props.customerId, getToken, props.token, props.pathParams, props.legData)
const isLegendDisplay = ref(false)

// const test = ref(props.customerId)
const { legData } = toRefs(props)

watch(legData, (newValue) => {
  console.log('voycom Handler 2')
  console.log(newValue)
  console.log(props.legData)
  layerList.VoyCom.content.updateRouteHandler(props.legData)
}, { deep: true })

const mapMenuLayerList = computed(() => {
  const filteredList = {}
  for (const layerName in layerList) {
    if (!layerList[layerName].isHideMenuItem) {
      filteredList[layerName] = layerList[layerName]
    }
  }
  return filteredList
})

onMounted(async () => {
  console.log(props.config.map)
  console.log(props.customerId)
  console.log(props.pathParams)
  console.log(props.legData)

  const token = await getToken()
  console.log(token)

  const map = new Map({
    ...props.config.map,
    container: 'map',
    // container: container.value,
    dragRotate: false,
    pitchWithRotate: false,
    touchZoomRotate: false,
    transformRequest: (path, resourceType) => {
      const url = new URL(path, location.origin)
      if (resourceType === 'Source' && url.pathname.startsWith('/customer/')) {
        return {
          url: path,
          headers: { Authorization: `Bearer ${token.value}` },
          credentials: 'include'
        }
      }
    }
  })

  map.addControl(new NavigationControl({ showCompass: false }))
  // map.addControl(new LegendButton(isLegendDisplay), 'top-right')

  await map.onPromise('load')
  registLayer(map, layerList, { colorMode: props.config.theme })
  registSidePanel(map, layerList, sidePanel)

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
  <TimeSlider
    v-if="ready"
    :layer-list="layerList"
    :back-hour="360"
    :futuer-hour="360"
    :color-mode="props.config.theme"
    :update-interval-second="0"
  />
  <SidePanel
    v-if="ready"
    :show="sidePanel.show"
    :type="sidePanel.type"
    :content="sidePanel.content"
  />
  <LegendPanel
    :layer-list="layerList"
    :is-legend-display="isLegendDisplay"
  />
</template>

<!-- style src="/src/assets/styles/app.css" scoped-->
<style>

.map {
  z-index: 0;
  width: 100%;
  height: 100%;
  margin: 0;
}
.vessel .mapboxgl-popup-content {
  font-family: 'Helvetica Neue', Helvetica, Arial, Verdana;
  padding-top: 4px;
  padding-left: 5px;
  padding-right: 5px;
  padding-bottom: 2px;
  line-height: 140%;
  background: #eee;
}
</style>
<style scoped>
* {
  font-family: 'HelveticaNeue-CondensedBold', 'Helvetica Neue', 'Helvetica',
    Arial, 'M PLUS 1p', 'ヒラギノ角ゴ Pro W6', 'ヒラギノ角ゴ W6 JIS2004',
    'ヒラギノ角ゴ ProN W6', 'HiraKakuProN-W6', 'Hiragino Kaku Gothic ProN W6',
    'Hiragino Kaku Gothic W6 JIS2004', 'Noto Sans JP', 'メイリオ', Meiryo,
    'ＭＳ Ｐゴシック', sans-serif;
}
</style>
