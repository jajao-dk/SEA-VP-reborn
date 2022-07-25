import { Layer } from './Layer'
import { convertCross180Coordinates } from './Util'
import distance from '@turf/distance'
import along from '@turf/along'
import { point, lineString, featureCollection } from '@turf/helpers'
import values from '../../scripts/values'
// import X2JS from 'node-x2js'

export class VesselSimulationLayer extends Layer {
  async add() {
    super.add(...arguments)
    this.dataPath = `${values.SECURE_DATA_URL}/customer`
    this.highlightClearId = null
    this.tsunamiHighlightClearId = null
    this.jsonList = []
    this.vesselListGeoJSON = {}
    this.customerId = this.options?.customerId
    this.tmpVessels = [] // vessel-name list for vessel search
    this.portList = {}
    this.tmpPortList = []
    this.wniObjid = {} // match wnishipnum with Object-ID
    this.selectedVessel = ''
    this.arrPort = ''
    this.depPort = ''
    this.simRoutes = {
      'type': 'FeatureCollection',
      'features': []
    }

    this.map.addSource(this.source, {
      type: 'geojson',
      data: featureCollection([]),
      promoteId: 'object_id'
    })    

    // 航路
    /*
    this.map.addSource(`${this.source}simRoute`, {
      type: 'geojson',
      data: featureCollection([])
    })
    this.map.addLayer(
      {
        id: `${this.layer}simRoute`,
        source: `${this.source}simRoute`,
        type: 'line',
        layout: {
          visibility: this.visibility
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'routetype'],
            'actual',
            '#ccc', // original #0ff
            'future',
            '#0ff',
            'intention',
            '#ff0', // original #ddd
            'next_voyage',
            '#f00', // original #ddd
            '#fff'
          ], // 種別(GeoJSON の property値)によって色を分けている
          'line-opacity': 0.8,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            ['match', ['get', 'routetype'], 'actual', 2, 'future', 2, 2], // 種別とズームレベルによって、線の太さを変>えている
            10,
            ['match', ['get', 'routetype'], 'actual', 3, 'future', 3, 3]
          ],
          'line-dasharray': [
            'match',
            ['get', 'routetype'],
            'future',
            ['literal', [1]],
            'actual',
            ['literal', [1]],
            ['literal', [4, 2]]
          ] // 種別によって点>線にするかしないかを変えている
        },
        metadata: {
          group: this.group
        }
      } // ,
      // this.layer
    )

    this.map.addLayer(
      {
        id: `${this.layer}simGhost`,
        source: `${this.source}simRoute`,
        type: 'symbol',
        layout: {
          'icon-image': 'vesselSymbol', // アイコンは、先に読み込んで置く
          'icon-rotate': ['get', 'headings'],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 1, 0.4, 4, 0.8],
          'icon-pitch-alignment': 'map', // 3D表示や回転をしたときにも、地図に対して角度が保たれるように
          'icon-rotation-alignment': 'map', // 3D表示や回転をしたときにも、地図に対して角度が保たれるように
          visibility: this.visibility
        },
        paint: {
          'icon-opacity': [
            'match',
            ['get', 'routetype'],
            'future',
            0.7,
            'actual',
            0.7,
            0.2
          ]
        },
        metadata: {
          group: this.group
        }
        //filter:['==','routetype',['selected','option']]
      } // ,
      // this.layer
    )
    */

    // Voyage Comparison of T-max
    this.map.addSource(`${this.source}simVoycom`, {
      type: 'geojson',
      data: featureCollection([])
    })
    this.map.addLayer(
      {
        id: `${this.layer}simVoycom`,
        source: `${this.source}simVoycom`,
        type: 'line',
        layout: {
          visibility: this.visibility,
          'line-sort-key': ['match', ['get', 'routetype'], 'selected', 10, 'shortest', 5, 0]
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'routetype'],
            'past',
            '#ccc',
            'selected',
            '#00f',
            'shortest',
            '#f00',
            'options',
            '#ff0',
            '#00f'
          ], // 種別(GeoJSON の property値)によって色を分けている
          'line-opacity': 0.8,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            ['match', ['get', 'routetype'], 'actual', 2, 'future', 2, 3], // 種別とズームレベルによって、線の太さを変>えている
            10,
            ['match', ['get', 'routetype'], 'actual', 3, 'future', 3, 4]
          ],
          /*
          'line-dasharray': [
            'match',
            ['get', 'routetype'],
            'past',
            ['literal', [1]],
            ['literal', [4, 2]]
          ]*/  // 種別によって点>線にするかしないかを変えている
        },
        // filter: ['all',['==','routetype','selected'],['==','routetype','option']],
        // filter: ['in','routetype','option','selected'],
        metadata: {
          group: this.group
        }
      } // ,
      // this.layer
    )

    /*
    this.map.addLayer(
      {
        id: `${this.layer}simVoycomGhost`,
        source: `${this.source}simVoycom`,
        type: 'circle',
        layout: {
          'circle-sort-key': ['match', ['get', 'routetype'], 'selected', 10, 'option', 5, 0]
        },
        paint: {
          'circle-radius': {'base': 1, 'stops': [[2,4],[12,8]]},
          'circle-color': ['match', ['get','routetype'],'selected','#00f','option','#f00', '#00f']
        },
        // filter: ['in','routetype','option','selected'],
        //  filter: ['in','posttime', 1655694000],
        metadata: {
          group: this.group
        }
      } // ,
      // this.layer
    )
    */

    // ツールチップ設定
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'bottom'
    })

    // 要素にマウスが重なったらツールチップ表示
    this.map.on('mouseenter', this.layer, (e) => {
      // this.map.on('click', this.layer, (e) => {
      this.map.getCanvas().style.cursor = 'pointer'

      const coordinates = e.features[0].geometry.coordinates.slice()
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        // 180°越え対応
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      let h = ''
      // h += '<div>' + e.features[0].properties.vessel_name + '</div>'
      h += '<div>&nbsp' + e.features[0].properties.vessel_name + '&nbsp</div>'
      h +=
        '<small><div>&nbsp&nbsp' +
        e.features[0].properties.speed +
        ' [kts] / ' +
        e.features[0].properties.heading +
        ' [deg.]&nbsp</div></small>'
      // h += '<button class="openbtn" onclick="this.sidepanelTrigger()">SHOW</button>'
      // const description = makeDescriptionFunc(e) // 表示するテキストはそれぞれで異なるので、設定に任せる
      this.popup.setLngLat(coordinates).setHTML(h).addTo(this.map)
    })

    // 要素からマウスが離れたらツールチップ非表示
    this.map.on('mouseleave', this.layer, () => {
      this.map.getCanvas().style.cursor = ''
      // popup.remove()
    })

    this.map.on('click', () => {
      this.popup.remove()
    })

    // this.addClickEvent()
  }

  async init() {
    super.init()
    
    await Promise.all([
      this.loadIconImage('./images/ship_white.svg', 'vesselSymbol'),
      this.loadIconImage('./images/ship_red.svg', 'vesselSymbolRed'),
      this.loadIconImage('./images/ship_yellow.svg', 'vesselSymbolYellow')
    ])
    

    // initialize data list
    await this.fetchVesselList()

    // initialize vessel snap-shot
    await this.getByTm()
    const tmp = this.vesselListGeoJSON.features
    console.log('tmpvessels: ' + tmp.length)
    for (let i = 0; i < tmp.length; i++) {
      this.tmpVessels.push(tmp[i].properties.vessel_name)
      this.wniObjid[tmp[i].properties.wni] = tmp[i].properties.object_id
    }
    this.tmpVessels.sort()
    this.event.dispatchEvent(
      new CustomEvent('vesselList', {
        detail: { data: this.tmpVessels }
      })
    )

    // initialize port list
    await this.fetchPortList()
    for (let key in this.portList){
      this.tmpPortList.push(key)
    }
    this.event.dispatchEvent(
      new CustomEvent('portList', {
        detail: { data: this.tmpPortList }
      })
    )    

    // console.log('tmpvessels: ' + JSON.stringify(this.tmpVessels))
    // console.log('wni-objid: ' + JSON.stringify(this.wniObjid))
    // console.log('portlist: ' + JSON.stringify(this.portList))

    this.initialized = true
  }

  // 全船の位置
  async getByTm() {
    const dataUrl = `${this.dataPath}/${this.customerId}/ssm/data/vessel/${this.timeSeries.data.file}`
    this.map.getSource(this.source).setData(dataUrl)
    this.vesselListGeoJSON = await fetch(dataUrl).then((res) => res.json()) // 無駄だが検索のために、、、。TODO
    // this.searchVessel(this.selectedVessel?.properties?.object_id, true)
  }

  async fetchVesselList() {
    // index.json に、時系列でファイルリストが書いてある。今回はその1番上の要素を使用している
    const json = await fetch(
      `${this.dataPath}/${this.customerId}/ssm/data/vessel/index.json`
    ).then((res) => res.json())
    this.timeSeries.dataList = json.jsonlist
      .map((list) => {
        return { ...list, file: list.fn } // file という要素にfn を入れる（共通処理のため）
      })
      .reverse() // 新しいほうが後ろの配列
  }

  async fetchPortList() {
    // index.json に、時系列でファイルリストが書いてある。今回はその1番上の要素を使用している
    const json = await fetch(
      // `${this.dataPath}/${this.customerId}/ssm/data/port/GPF.json`
      `${values.DATA_STORAGE_URL}/okamaw-co2-simulation-test/GPF.json`
    ).then((res) => res.json())
    console.log(json)
    this.portList = json
  }

  // Draw simulation routes
  async startSimulationHandler() {
    console.log('start simulation!!!')
  }

  // Clear simulation routes
    async startSimulationHandler() {
      console.log('clear simulation!!!')
  }

  routeColoring(routes){
    console.log('route-coloring')
    const routeExpressions = ['match', ['get', 'routeid'], 'dummy', "#fff"]
    const zindexExpressions = ['match', ['get', 'routeid'], 'dummy', 0]
    routes.forEach((id)=>{
      routeExpressions.push(id, '#0ff')
      zindexExpressions.push(id, 5)
    })
    routeExpressions.push('#00f')
    zindexExpressions.push(0)
    console.log(routeExpressions)
    this.map.setPaintProperty(`${this.layer}simVoycom`, 'line-color', routeExpressions)
    this.map.setLayoutProperty(`${this.layer}simVoycom`, 'line-sort-key', zindexExpressions)
  }

  cancelRouteDisplay(objectId) {
    setTimeout(() => {
      this.map.once('click', () => {
        cancelAnimationFrame(this.highlightClearId)
        this.map.setFeatureState(
          {
            source: this.source,
            id: objectId
            // id: point[0].properties.objectId
            // id: this.selectedVessel.properties.object_id
          },
          { selected: false }
        )
        this.map.setPaintProperty(this.layer, 'icon-opacity', 1)
        this.selectedVessel = null
        this.map
          .getSource(`${this.source}Highlight`)
          .setData(featureCollection([])) // ハイライトするデータを設定
        this.map.getSource(`${this.source}Route`).setData(featureCollection([]))
        this.map.getSource(`${this.source}Voycom`).setData(featureCollection([]))        
      })
    }, 1500) // 禁断の、、、。
  }
}
