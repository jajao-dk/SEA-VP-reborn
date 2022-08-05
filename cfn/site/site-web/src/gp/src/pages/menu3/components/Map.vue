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

const { getToken } = useAuth()
// const token = await getToken()
// console.log(token)

const props = defineProps({
  customerId: { type: String, default: '' },
  simDatas: { type: Object, default: () => {} },
  // simUpdate: { type: String, default: '' },
  config: { type: Object, default: () => {} },
  pathParams: { type: Object, default: () => {} },
  mapFocusRoute: { type: String, default: () => {} },
  token: { type: String, default: '' }
})

const ready = ref(false)
// const layerList = createLayerList(props.config, props.customerId, getToken, token.value, props.pathParams, props.errmGeoJson)
const layerList = createLayerList(props.config, props.customerId, getToken, props.token, props.pathParams, props.legData)
const { simDatas, /* simUpdate, */ mapFocusRoute } = toRefs(props)

watch(simDatas, (newValue) => {
  console.log('map TAP Handler 3')
  console.log(newValue)
  layerList.TAP.content.displayRouteHandler(props.simDatas)
}, { deep: true })

watch(mapFocusRoute, (newValue) => {
  console.log('FOCUS ROUTE on MAP')
  console.log(newValue)
  layerList.TAP.content.routeColoring(newValue)
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
  await map.onPromise('load')
  registLayer(map, layerList, { colorMode: props.config.theme })

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
