import { Layer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Layer'
import { convertCross180Coordinates } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Util'
// import distance from '@turf/distance'
// import along from '@turf/along'
import { point, lineString, featureCollection } from '@turf/helpers'
import mapboxgl from 'mapbox-gl'
import values from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/scripts/values'
// import X2JS from 'node-x2js'

export class VesselERRMLayer extends Layer {
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
    this.Routes = {
      type: 'FeatureCollection',
      features: []
    }
    this.ERRM = {}
    this.redVessels = []
    this.yellowVessels = []

    console.log('ERRM layer add started!!!')
    console.log(this.options.data)

    await Promise.all([
      this.loadIconImage('./images/ship_white.svg', 'vesselSymbol'),
      this.loadIconImage('./images/ship_red.svg', 'vesselSymbolRed'),
      this.loadIconImage('./images/ship_yellow.svg', 'vesselSymbolYellow')
    ])

    this.map.addSource(this.source, {
      type: 'geojson',
      data: featureCollection([]),
      promoteId: 'imo'
    })

    this.map.addLayer({
      id: this.layer,
      source: this.source,
      type: 'symbol',
      layout: {
        'icon-image': 'vesselSymbol', // アイコンは、先に読み込んで置く
        'icon-allow-overlap': true,
        'icon-rotate': ['get', 'heading'],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 1, 0.5, 4, 0.9],
        'icon-pitch-alignment': 'map', // 3D表示や回転をしたときにも、地図に対して角度が保たれるように
        'icon-rotation-alignment': 'map', // 3D表示や回転をしたときにも、地図に対して角度が保たれるように
        'icon-ignore-placement': true, // 他のアイコンを間引いてしまわないように
        'text-field': [
          'format',
          ['get', 'vessel_name'],
          { 'font-scale': 0.6 }
          // '\n',
          // {},
          // ['downcase', ['get', 'imo']],
          // { 'font-scale': 0.6 }
        ],
        'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
        // 'text-radial-offset': 0.9,
        'text-radial-offset': [
          'interpolate',
          ['linear'],
          ['zoom'],
          1,
          0.6,
          3,
          1.2
        ],
        'text-justify': 'auto',
        visibility: this.visibility
      },
      metadata: {
        group: this.group
      }
    })

    // 船のハイライト
    this.map.addSource(`${this.source}Highlight`, {
      type: 'geojson',
      data: featureCollection([])
    })
    this.map.addLayer(
      {
        id: `${this.layer}Highlight`,
        source: `${this.source}Highlight`,
        type: 'circle',
        layout: {
          visibility: this.visibility
        },
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 15, 4, 30],
          'circle-color': '#00f',
          'circle-blur': 1,
          'circle-opacity-transition': {
            duration: 0
          }
        },
        metadata: {
          group: this.group
        }
      },
      this.layer
    ) // ハイライトは、船のレイヤーより下に挿入

    // 航路
    this.map.addSource(`${this.source}Route`, {
      type: 'geojson',
      data: featureCollection([])
    })
    this.map.addLayer(
      {
        id: `${this.layer}Route`,
        source: `${this.source}Route`,
        type: 'line',
        layout: {
          visibility: this.visibility
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'routetype'],
            'actual',
            '#999', // original #0ff
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
            ['match', ['get', 'routetype'], 'actual', 4, 'future', 4, 2], // 種別とズームレベルによって、線の太さを変>えている
            10,
            ['match', ['get', 'routetype'], 'actual', 6, 'future', 6, 3]
          ]
        },
        metadata: {
          group: this.group
        }
      },
      this.layer
    )

    const tm = this.timeSeries.globalTime
    const posttime = Math.floor(tm / 3600000 / 12) * 3600 * 12
    this.map.addLayer({
      id: `${this.layer}Symbol`,
      source: `${this.source}Route`,
      type: 'circle',
      paint: {
        'circle-radius': {
          base: 1,
          stops: [
            [2, 8],
            [12, 16]
          ]
        },
        'circle-color': [
          'match',
          ['get', 'routetype'],
          'future_point',
          '#00f',
          'actual_point',
          '#666',
          '#fff'
        ]
      },
      metadata: {
        group: this.group
      },
      filter: ['in', 'posttime', posttime]
    })

    this.map.addLayer(
      {
        id: `${this.layer}Ghost`,
        source: `${this.source}Route`,
        type: 'circle',
        layout: {
          'circle-sort-key': [
            'match',
            ['get', 'routetype'],
            'future_point',
            10,
            'actual_point',
            5,
            0
          ]
        },
        paint: {
          'circle-radius': {
            base: 1,
            stops: [
              [2, 3],
              [12, 6]
            ]
          },
          'circle-color': [
            'match',
            ['get', 'routetype'],
            'future_point',
            '#00f',
            'actual_point',
            '#666',
            '#fff'
          ]
        },
        metadata: {
          group: this.group
        }
        // filter: ['==', 'routetype', ['future', 'past']]
      },
      this.layer
    )

    // Tool tip for vessel past positions  -----------------------
    // ツールチップ設定
    this.popupPast = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'bottom'
    })

    // 要素にマウスが重なったらツールチップ表示
    this.map.on('mouseenter', `${this.layer}Ghost`, (e) => {
      // this.map.on('click', this.layer, (e) => {
      this.map.getCanvas().style.cursor = 'pointer'

      const coordinates = e.features[0].geometry.coordinates.slice()
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        // 180°越え対応
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      let h = ''
      h += '<div>&nbsp' + e.features[0].properties.time + '&nbsp</div>'
      h +=
        '<div>&nbspM/E FOC: ' +
        e.features[0].properties.me_fo +
        ' [Mt]&nbsp</div>'
      h += '<div>&nbspSpeed: ' + e.features[0].properties.speed + ' [kts]<div>'
      h +=
        '<div>&nbspWind: BF' + e.features[0].properties.wni_wind_bf + ' <div>'
      h +=
        '<div>&nbspWave: ' +
        e.features[0].properties.wni_wave_height +
        ' [m]<div>'
      console.log(coordinates)
      this.popupPast.setLngLat(coordinates).setHTML(h).addTo(this.map)
    })

    // 要素からマウスが離れたらツールチップ非表示
    this.map.on('mouseleave', `${this.layer}Ghost`, () => {
      this.map.getCanvas().style.cursor = ''
      // this.popupPast.remove()
    })

    this.map.on('click', () => {
      this.popupPast.remove()
      // this.popup.remove()
    })

    // 船をクリックされたら、ルートを表示。ついでに、選択された船を「地図のセンターに移動し」「ハイライト表示」
    this.map.on('click', this.layer, async (e) => {
      this.onClickShipIcon(e)
    })

    this.map.on('click', (e) => {
      console.log('CANCEL_CLICK')
      if (
        this.map
          .queryRenderedFeatures(e.point)
          .find((feature) => feature.layer.id === this.layer) ||
        !this.selectedVessel?.properties?.imo
      ) {
        return
      }
      // クリックしたら戻るように
      this.cancelRouteDisplay(this.selectedVessel.properties.imo)
    })
  }

  async init() {
    super.init()
    console.log('INITIALIZE')
    this.initialized = true
  }

  async updateTimeSeriesIndex() {
    super.updateTimeSeriesIndex()
    console.log(this.timeSeries.globalTime)
    if (this.visibility === 'visible' && this.timeSeries.globalTime) {
      console.log('TIME SERIES')

      // Time slider update (including periodic update)
      const tm = this.timeSeries.globalTime
      const posttime = Math.floor(tm / 3600000 / 12) * 3600 * 12
      console.log(posttime)

      if (this.errmGeoJSON !== undefined) {
        this.map.getSource(this.source).setData(this.errmGeoJSON.latest)
        // this.map.getSource(`${this.source}Voycom`).setData(this.errmGeoJSON)
        // this.map.flyTo({ center: this.latestPos })
      }

      this.map.setFilter(`${this.layer}Symbol`, ['in', 'posttime', posttime])
    }
    console.log('vessel layer update by timeseries-index!!!')
  }

  onClickShipIcon(e, isFromOnMessage) {
    if (this.selectedVessel) {
      console.log('CLICK')
      // this.map.getSource(`${this.source}Route`).setData(featureCollection([]))
      this.map.setFeatureState(
        {
          source: this.source,
          id: this.selectedVessel.properties.imo
        },
        { selected: false }
      )
    }
    this.selectedVessel = e.features[0]
    console.log(this.selectedVessel)
    this.map.setFeatureState(
      {
        source: this.source,
        id: this.selectedVessel.properties.imo
      },
      { selected: true }
    )
    console.log(this.source)
    this.map.setPaintProperty(this.layer, 'icon-opacity', [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      1,
      0.3
    ])

    // this.map.getSource(`${this.source}Highlight`).setData(this.selectedVessel) // ハイライトするデータを設定
    // this.blinkHighlightLayer() // 点滅開始

    if (location.href.match(/3d/)) {
      this.map.flyTo({
        center: this.selectedVessel.geometry.coordinates,
        pitch: 40,
        bearing: this.selectedVessel.properties.heading
      }) // その船が地図のセンターになるように移動
    } else {
      this.map.flyTo({
        center: this.selectedVessel.geometry.coordinates
        // zoom: 9
      }) // その船が地図のセンターになるように移動
    }

    // ルートデータを取得して、描画(setData)
    const tmpRoute = this.errmGeoJSON[this.selectedVessel.properties.imo]
    console.log(tmpRoute)
    tmpRoute.features.forEach((feature) => {
      convertCross180Coordinates(feature.geometry.coordinates)
    })
    this.map.getSource(`${this.source}Route`).setData(tmpRoute)

    // Side panel
    // this.sidepanelTrigger(e, 0)
    // this.popup.remove();

    // event to Table/QS
    this.event.dispatchEvent(
      new CustomEvent('shipIconClick', {
        detail: { data: this.selectedVessel.properties.imo }
      })
    )
  }

  onClickTable(imo) {
    if (this.selectedVessel) {
      console.log('CLICK-TABLE')
      // this.map.getSource(`${this.source}Route`).setData(featureCollection([]))
      this.map.setFeatureState(
        {
          source: this.source,
          id: this.selectedVessel.properties.imo
        },
        { selected: false }
      )
    }
    const tmp = this.errmGeoJSON.latest.features
    console.log('tmpvessels: ' + tmp.length)
    for (let i = 0; i < tmp.length; i++) {
      if (tmp[i].properties.imo === imo) {
        this.selectedVessel = tmp[i]
      }
      // this.tmpVessels.push(tmp[i].properties.vessel_name)
      // this.IMOs[tmp[i].properties.imo] = tmp[i].properties.vessel_name
    }
    // this.selectedVessel = e.features[0]
    console.log(this.selectedVessel)
    this.map.setFeatureState(
      {
        source: this.source,
        id: imo
      },
      { selected: true }
    )
    console.log(this.source)
    this.map.setPaintProperty(this.layer, 'icon-opacity', [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      1,
      0.3
    ])

    if (this.visibility === 'visible' && this.errmGeoJSON !== undefined) {
      // this.map.getSource(`${this.source}Highlight`).setData(this.selectedVessel) // ハイライトするデータを設定
      // this.blinkHighlightLayer() // 点滅開始

      if (location.href.match(/3d/)) {
        this.map.flyTo({
          center: this.selectedVessel.geometry.coordinates,
          pitch: 40,
          bearing: this.selectedVessel.properties.heading
        }) // その船が地図のセンターになるように移動
      } else {
        this.map.flyTo({
          center: this.selectedVessel.geometry.coordinates
          // zoom: 9
        }) // その船が地図のセンターになるように移動
      }

      // ルートデータを取得して、描画(setData)
      const tmpRoute = this.errmGeoJSON[this.selectedVessel.properties.imo]
      console.log(tmpRoute)
      tmpRoute.features.forEach((feature) => {
        convertCross180Coordinates(feature.geometry.coordinates)
      })
      this.map.getSource(`${this.source}Route`).setData(tmpRoute)
    }

    // Side panel
    // this.sidepanelTrigger(e, 0)
    // this.popup.remove();
  }

  // 180°またぎ対応を入れたいために、このようにしている。本来データ側で整形すべき
  /*
  async getRouteGeoJSON(imo) {
    console.log(imo)
    return new Promise((resolve) => {
      fetch(
        `${this.dataPath}/${this.customerId}/errm/errm_route/${imo}.json`,
        this.corsOptions
      )
        .then((res) => res.json())
        .then((json) => {
          json.features.forEach((feature) => {
            convertCross180Coordinates(feature.geometry.coordinates)
          })
          resolve(json)
        })
    })
  }
  */

  // 要素の点滅（ややエイヤだが、まあ十分か？）
  // 一定間隔で、opacity を 0/1 で切り替えている。
  blinkHighlightLayer() {
    const layerName = `${this.layer}Highlight`
    let opacity = 1
    this.map.setPaintProperty(layerName, 'circle-opacity', opacity)
    let start = new Date().getTime()
    if (this.highlightClearId) cancelAnimationFrame(this.highlightClearId)
    const blink = () => {
      const progress = new Date().getTime() - start
      if (progress > 700) {
        // console.log(progress)
        opacity = opacity === 0 ? 1 : 0
        this.map.setPaintProperty(layerName, 'circle-opacity', opacity)
        start = new Date().getTime()
      }
      this.highlightClearId = requestAnimationFrame(blink)
    }
    this.highlightClearId = requestAnimationFrame(blink)
  }

  cancelRouteDisplay(imo) {
    this.map.once('click', () => {
      console.log('CANCEL')
      cancelAnimationFrame(this.highlightClearId)
      this.map.setFeatureState(
        {
          source: this.source,
          id: imo
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

      // event to Table/QS
      this.event.dispatchEvent(
        new CustomEvent('cancelRoute', {
          detail: {}
        })
      )
    })
  }

  updateMapHandler(errmVessels) {
    console.log('ERRM update handler!!!')
    console.log(this.options.data)
    console.log(errmVessels)
    this.errmVessels = errmVessels
    this.errmGeoJSON = {}
    this.redVessels.length = 0
    this.yellowVessels.length = 0

    this.latestJSON = { type: 'FeatureCollection', features: [] }
    this.makeGeoJSON(this.errmVessels)
    this.errmGeoJSON.latest = this.latestJSON

    console.log(this.errmGeoJSON)

    this.map.getSource(this.source).setData(this.errmGeoJSON.latest)
    const tmp = this.errmGeoJSON.latest.features
    console.log('tmpvessels: ' + tmp.length)
    const tmpIMO = tmp[0].properties.imo
    for (let i = 0; i < tmp.length; i++) {
      this.tmpVessels.push(tmp[i].properties.vessel_name)
      // this.IMOs[tmp[i].properties.imo] = tmp[i].properties.vessel_name
    }
    this.tmpVessels.sort()
    console.log(this.tmpVessels)

    // Another dark art
    const selected = this.errmGeoJSON.latest.features[0]
    this.map.getSource(`${this.source}Highlight`).setData(selected)
    this.map.getSource(`${this.source}Highlight`).setData(featureCollection([]))
  }

  makeGeoJSON(errmVessels) {
    for (let i = 0; i < errmVessels.length; i++) {
      const latest = errmVessels[i].latest
      const vesselName = latest.vessel_name
      const imoNum = errmVessels[i].imo_num
      const wnishipNum = errmVessels[i].wnishipnum
      const routeJSON = { type: 'FeatureCollection', features: [] }
      // console.log(vesselName)

      // Check alert
      const riskSpdLevel = this.checkSpdAlert(errmVessels[i])
      const riskRpmLevel = this.checkRpmAlert(errmVessels[i])
      const riskFocLevel = this.checkFocAlert(errmVessels[i])

      const alertLevel = riskSpdLevel + riskRpmLevel + riskFocLevel
      if (alertLevel >= 10) {
        this.redVessels.push(imoNum)
      } else if (alertLevel > 0) {
        this.yellowVessels.push(imoNum)
      }

      this.paintVessels()

      // Latest positions
      const latestLat = this.checkLatLon('lat', latest)
      const latestLon = this.checkLatLon('lon', latest)
      const latestHeading = this.checkHeading('heading', latest)
      const latestDate = this.checkTime('date', latest)
      const latestPostdate = this.checkUnixtime('date', latest)
      const latestPoint = {
        type: 'Feature',
        properties: {
          vessel_name: vesselName,
          imo: imoNum,
          wni: wnishipNum,
          routetype: 'latest',
          time: latestDate,
          posttime: latestPostdate,
          heading: latestHeading
        },
        geometry: {
          coordinates: [latestLon, latestLat],
          type: 'Point'
        }
      }
      this.latestJSON.features.push(latestPoint)

      // Future route
      if ('waypoint' in errmVessels[i]) {
        const tmpFutureRoute = []
        const futurePoints = errmVessels[i].waypoint
        for (let j = 0; j < futurePoints.length; j++) {
          const wp = futurePoints[j]
          const tmpPoint = {
            type: 'Feature',
            properties: {
              vessel_name: vesselName,
              imo: imoNum,
              wni: wnishipNum,
              routetype: 'future_point'
            },
            geometry: {
              coordinates: [],
              type: 'Point'
            }
          }
          tmpPoint.properties.me_fo = this.checkString('me_fo', wp.info)
          tmpPoint.properties.speed = this.checkString('speed', wp.info)
          tmpPoint.properties.nav = this.checkString('nav', wp)
          tmpPoint.properties.wni_wave_height = this.checkString(
            'wni_wave_height',
            wp.info
          )
          tmpPoint.properties.wni_wind_spd = this.checkString(
            'wni_wind_spd',
            wp.info
          )
          tmpPoint.properties.wni_wind_bf = this.checkFloat(
            'wni_wind_bf',
            wp.info
          )
          tmpPoint.properties.wni_wind_dir = this.checkFloat(
            'wni_wind_dir',
            wp.info
          )
          tmpPoint.properties.time = this.checkTime('time', wp.info)
          tmpPoint.properties.posttime = this.checkUnixtime('time', wp.info)
          const lat = this.checkLatLon('lat', wp)
          const lon = this.checkLatLon('lon', wp)
          tmpPoint.geometry.coordinates = [lon, lat]
          if (!(lat === null && lon === null) && !(lat === 0 && lon === 0)) {
            routeJSON.features.push(tmpPoint)
            tmpFutureRoute.push([lon, lat])
          }
        }
        const futureRoute = {
          type: 'Feature',
          properties: {
            vessel_name: vesselName,
            imo: imoNum,
            wni: wnishipNum,
            routetype: 'future'
          },
          geometry: {
            coordinates: tmpFutureRoute,
            type: 'LineString'
          }
        }
        routeJSON.features.push(futureRoute)
      }

      // Past route
      if ('past_waypoint' in errmVessels[i]) {
        const tmpPastRoute = []
        const pastPoints = errmVessels[i].past_waypoint
        for (let j = 0; j < pastPoints.length; j++) {
          const wp = pastPoints[j]
          const tmpPoint = {
            type: 'Feature',
            properties: {
              vessel_name: vesselName,
              imo: imoNum,
              wni: wnishipNum,
              routetype: 'actual_point'
            },
            geometry: {
              coordinates: [],
              type: 'Point'
            }
          }
          tmpPoint.properties.me_fo = this.checkString('me_fo', wp.info)
          tmpPoint.properties.speed = this.checkString('speed', wp.info)
          tmpPoint.properties.nav = this.checkString('nav', wp)
          tmpPoint.properties.wni_wave_height = this.checkString(
            'wni_wave_height',
            wp.info
          )
          tmpPoint.properties.wni_wind_spd = this.checkString(
            'wni_wind_spd',
            wp.info
          )
          tmpPoint.properties.wni_wind_bf = this.checkFloat(
            'wni_wind_bf',
            wp.info
          )
          tmpPoint.properties.wni_wind_dir = this.checkFloat(
            'wni_wind_dir',
            wp.info
          )
          tmpPoint.properties.time = this.checkTime('time', wp.info)
          tmpPoint.properties.posttime = this.checkUnixtime('time', wp.info)
          const lat = this.checkLatLon('lat', wp)
          const lon = this.checkLatLon('lon', wp)
          tmpPoint.geometry.coordinates = [lon, lat]
          if (!(lat === null && lon === null) && !(lat === 0 && lon === 0)) {
            routeJSON.features.push(tmpPoint)
            tmpPastRoute.push([lon, lat])
          }
        }
        const pastRoute = {
          type: 'Feature',
          properties: {
            vessel_name: vesselName,
            imo: imoNum,
            wni: wnishipNum,
            routetype: 'actual'
          },
          geometry: {
            coordinates: tmpPastRoute,
            type: 'LineString'
          }
        }
        routeJSON.features.push(pastRoute)
      }
      this.errmGeoJSON[imoNum] = routeJSON
    }
  }

  checkString(text, dict) {
    let value = ''
    if (text in dict) {
      value = String(dict[text])
    }
    return value
  }

  checkFloat(number, dict) {
    let value = null
    if (number in dict && dict[number] !== '' && dict[number] != null) {
      value = parseFloat(dict[number])
    }
    return value
  }

  checkLatLon(latlon, dict) {
    let value = null
    if (latlon in dict && dict[latlon] !== '' && dict[latlon] !== '---') {
      value = parseFloat(dict[latlon]) / 60
    }
    return value
  }

  checkHeading(heading, dict) {
    let value = 0
    if (heading in dict && dict[heading] !== '' && dict[heading] != null) {
      value = parseFloat(dict[heading])
    }
    return value
  }

  checkTime(time, dict) {
    let value = ''
    if (time in dict) {
      const tmpTime = dict[time]
      if (tmpTime.slice(4, 5) === '/') {
        value = tmpTime.replace(/\//g, '-') + 'Z'
      } else if (tmpTime.slice(4, 5) === '-') {
        value = tmpTime
      }
      if (value.slice(-1) !== 'Z') {
        value = tmpTime + 'Z'
      }
    }
    return value
  }

  checkUnixtime(time, dict) {
    let value = ''
    if (time in dict) {
      const tmpTime = dict[time]
      if (tmpTime.slice(4, 5) === '/') {
        value = tmpTime.replace(/\//g, '-') + 'Z'
      } else if (tmpTime.slice(4, 5) === '-') {
        value = tmpTime
      }
      if (value.slice(-1) !== 'Z') {
        value = tmpTime + 'Z'
      }
    }
    return Date.parse(value) / 1000
  }

  checkSpdAlert = (vessel) => {
    // Check Speed alert
    const spd = Number(vessel.latest.average_speed)
    const orderSpd = Number(vessel.latest.ordered_speed)
    const toleSpd = Number(vessel.tolerance_range.speed)
    if (orderSpd > 0 && toleSpd > 0) {
      if (spd < orderSpd - toleSpd) {
        return 10
      } else if (spd < orderSpd && spd >= orderSpd - toleSpd) {
        return 1
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  checkFocAlert = (vessel) => {
    // Check FOC alert
    const foc = Number(vessel.latest.total_foc)
    const orderFoc = Number(vessel.latest.ordered_foc)
    const toleFoc = Number(vessel.tolerance_range.consumption)
    if (orderFoc > 0 && toleFoc > 0) {
      if (foc > orderFoc + toleFoc) {
        return 10
      } else if (foc > orderFoc && foc <= orderFoc + toleFoc) {
        return 1
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  checkRpmAlert = (vessel) => {
    // Check RPM alert
    const rpm = Number(vessel.latest.average_rpm)
    const orderRpm = Number(vessel.latest.suggested_rpm)
    const toleRpm = Number(vessel.tolerance_range.rpm)
    if (orderRpm > 0 && toleRpm > 0) {
      if (rpm > orderRpm + toleRpm || rpm < orderRpm - toleRpm) {
        return 10
      } else if (
        (rpm > orderRpm && rpm <= orderRpm + toleRpm) ||
        (rpm < orderRpm && rpm >= orderRpm - toleRpm)
      ) {
        return 1
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  paintVessels() {
    // Modefy vessel layer properties
    const vesseltypeExpressions = [
      'match',
      ['get', 'imo'],
      'dummy',
      'vesselSymbolRed'
    ]
    const zindexExpressions = ['match', ['get', 'imo'], 'dummy', 0]

    this.redVessels.forEach((vessel) => {
      vesseltypeExpressions.push(vessel, 'vesselSymbolRed')
      zindexExpressions.push(vessel, 10)
    })
    this.yellowVessels.forEach((vessel) => {
      vesseltypeExpressions.push(vessel, 'vesselSymbolYellow')
      zindexExpressions.push(vessel, 5)
    })

    vesseltypeExpressions.push('vesselSymbol')
    zindexExpressions.push(0)
    // console.log('VTE: ' + vesseltypeExpressions)
    // console.log('ZIE: ' + zindexExpressions)

    this.map.setLayoutProperty(this.layer, 'icon-image', vesseltypeExpressions)
    this.map.setLayoutProperty(this.layer, 'symbol-sort-key', zindexExpressions)
  }
}
