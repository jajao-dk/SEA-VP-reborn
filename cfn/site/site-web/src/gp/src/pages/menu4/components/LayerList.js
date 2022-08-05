import { CycloneLayer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/CycloneLayer'
import { GraticuleLayer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/GraticuleLayer'
import { WindGridLayer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/WindGridLayer'
import { CurrentGridLayer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/CurrentGridLayer'
import { WxChartLayer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/WxChartLayer'
import { WaveHeightLayer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/WaveHeightLayer'
import { EcaAreaLayer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/EcaAreaLayer'
import { VesselERRMLayer } from './VesselERRMLayer'
// import { NauticalChartLayer } from '../components/Layers/NauticalChartLayer'
// import { VesselRouteLayer } from '../components/Layers/VesselRouteLayer'
// import { PortLayer } from '../components/Layers/PortLayer'
// import { IcebergLayer } from '../components/Layers/IcebergLayer'
// import { IceconcentrationLayer } from '../components/Layers/IceconcentrationLayer'
// import { SeaVisibilityLayer } from '../components/Layers/SeaVisibilityLayer'
// import { SurfaceTemperatureLayer } from '../components/Layers/SurfaceTemperatureLayer'
// import { SprayIcingLayer } from '../components/Layers/SprayIcingLayer'
// import { event as gtagEvent } from 'vue-gtag'

import { reactive, watch } from 'vue'
import Cookies from 'js-cookie'
import values from '../../../scripts/values'

// 設定ファイルとモジュールとの紐付け
const modules = {
  Cyclone: CycloneLayer,
  Graticule: GraticuleLayer,
  Wind: WindGridLayer,
  Current: CurrentGridLayer,
  WxChart: WxChartLayer,
  Wave: WaveHeightLayer,
  EcaArea: EcaAreaLayer,
  ERRM: VesselERRMLayer
  // NauticalChart: NauticalChartLayer,
  // Vessel: VesselRouteLayer,
  // Port: PortLayer,
  // SeaVisibility: SeaVisibilityLayer,
  // SurfaceTemperature: SurfaceTemperatureLayer,
  // SprayIcing: SprayIcingLayer,
  // Ice: { Iceconcentration: IceconcentrationLayer, Iceberg: IcebergLayer },
}

const hideMenuItem = {
  Tsunami: true
}

// サイドパネルイベントを定義
/*
const sidePanelEvents = {
  Cyclone: [{ eventName: 'CycloneSymbolClick', panelType: 'cyclone' }],
  DepictedItem: [
    { eventName: 'depictedItemSymbolClick', panelType: 'depictedItem' }
  ],
  DepictedItemOE: [
    { eventName: 'depictedItemSymbolClick', panelType: 'depictedItem' }
  ],
  Vessel: [{ eventName: 'vesselSymbolClick', panelType: 'vessel' }],
  Port: [{ eventName: 'portSymbolClick', panelType: 'port' }],
  Piracy: [{ eventName: 'piracySymbolClick', panelType: 'piracy' }]
}
*/

// 凡例の有無を定義
/*
const hasLegend = {
  Wave: true,
  Current: true,
  Liden: true,
  Entln: true,
  Cyclone: true
}
*/

/**
 * 設定ファイル情報からレイヤーリストを生成する
 * @param {object} layerConfig
 * @param {string} customerId
 * @returns {array}
 */

export function createLayerList(
  config,
  customerId,
  getToken,
  token,
  pathParams,
  data
) {
  const layerConfig = config.layer
  const layerList = reactive({})
  const setLayerInfos = (
    layer,
    layerName,
    layerModule,
    menuGroupName,
    isHideMenuItem = false
  ) => {
    layerList[layerName] = {
      name: layerName,
      originName: layer.name,
      isHideMenuItem,
      title: layer.title || layerName,
      zIndex: layer.zIndex,
      // sidePanelEvents: sidePanelEvents[layer.name],
      // hasLegend: hasLegend[layer.name],
      visible: !!Cookies.get(
        `${values.COOKIE_NAME_SPACE}_${layer.name}Visible`
      ),
      getToken: layer.useBusinessData ? getToken : null,
      Module: layerModule,
      content: null,
      options: {
        config,
        customerId,
        token,
        pathParams,
        data,
        ...layer.options
      }
    }
    if (menuGroupName) {
      layerList[layerName].options.menugroupname = menuGroupName
    }
  }
  layerConfig.forEach((layer) => {
    if (!modules[layer.name]) {
      console.warn(`${layer.name} not defined in LayerList.js`)
    }
    const layerModule = modules[layer.name]
    if (layerModule && isObject(layerModule)) {
      Object.keys(layerModule).forEach((key, idx) => {
        // idx > 0 のmenuitemを非表示する
        setLayerInfos(layer, key, layerModule[key], layer.name, idx > 0)
      })
    } else {
      setLayerInfos(
        layer,
        layer.name,
        layerModule,
        layer.name,
        hideMenuItem[layer.name]
      )
    }
  })

  return layerList
}

/**
 * 地図にレイヤーを追加する
 * @param {Map} map
 * @param {object} layerList
 * @param {object} commonOptions
 */
export function registLayer(map, layerList, commonOptions) {
  const sortedLayerList = Object.entries(layerList).sort((a, b) => {
    const aZIndex = a[1].zIndex || 0
    const bZIndex = b[1].zIndex || 0
    if (aZIndex > bZIndex) return 1
    else if (aZIndex < bZIndex) return -1
    else return 0
  })

  // レイヤー表示ON/OFFの切り替えを、全レイヤーに登録
  for (const layer of Object.values(layerList)) {
    console.log(layer)
    if (layer.name === "EcaArea" || layer.name === "Cyclone" || layer.name === "Wave" || layer.name === "ERRM"){
      layer.visible = true
    }
    watch(
      () => layer.visible,
      (newValue) => {
        const menugroupname = layer.options.menugroupname
        if (menugroupname) {
          // 同じmapmenugroupを探す
          const glayers = Object.values(layerList).filter(
            (l) => l?.options?.menugroupname === menugroupname
          )
          if (glayers && glayers.length) {
            glayers.forEach((gl) => {
              gl.content.setVisibility(newValue ? 'visible' : 'none')
            })
          }
        } else {
          layer.content.setVisibility(newValue ? 'visible' : 'none')
        }
        const visibilityKey = menugroupname || layer.name
        if (newValue) {
          Cookies.set(
            `${values.COOKIE_NAME_SPACE}_${visibilityKey}Visible`,
            'true',
            { expires: 1 }
          )
          /*
          gtagEvent('visible', {
            event_category: 'map',
            event_label: 'layer',
            value: visibilityKey
          })
          */
        } else {
          Cookies.remove(`${values.COOKIE_NAME_SPACE}_${visibilityKey}Visible`)
        }
      }
    )
  }

  for (const [, layer] of sortedLayerList) {
    layer.content = new layer.Module(map, layer.name, {
      ...commonOptions,
      ...layer.options
    }) // call constructor for each layer
    layer.content.add(layer.visible ? 'visible' : 'none') // call add() for each layer
  }
}

function isObject(val) {
  if (val !== null && typeof val === 'object' && val.constructor === Object) {
    return true
  }
  return false
}
