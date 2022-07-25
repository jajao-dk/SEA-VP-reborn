import { Layer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Layer'
import { convertCross180Coordinates } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Util'
import { featureCollection } from '@turf/helpers'
import values from '../../../scripts/values'
import mapboxgl from 'mapbox-gl'
// import X2JS from 'node-x2js'

export class VesselTAPLayer extends Layer {
  async add() {
    super.add(...arguments)
    this.dataPath = `${values.SECURE_DATA_URL}`
    this.dataPathTsunami = `${values.DATA_STORAGE_URL}/tsunami`
    this.highlightClearId = null
    this.tsunamiHighlightClearId = null
    this.jsonList = []
    this.vesselListGeoJSON = {}
    this.customerId = this.options?.customerId
    this.config = this.options?.config
    this.token = this.options?.token
    this.tmpVessels = [] // vessel-name list for vessel search
    this.wniObjid = {} // match wnishipnum with Object-ID
    this.tsunamiVessels = []
    this.latestPos = []

    this.map.addSource(this.source, {
      type: 'geojson',
      data: featureCollection([]),
      promoteId: 'object_id'
    })

    /*
    this.map.addLayer({
      id: this.layer,
      source: this.source,
      type: 'symbol',
      layout: {
        'icon-image': 'vesselSymbol', // アイコンは、先に読み込んで置く
        'icon-allow-overlap': true,
        'icon-rotate': ['get', 'heading'],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 1, 0.5, 4, 1],
        'icon-pitch-alignment': 'map', // 3D表示や回転をしたときにも、地図に対して角度が保たれるように
        'icon-rotation-alignment': 'map', // 3D表示や回転をしたときにも、地図に対して角度が保たれるように
        'icon-ignore-placement': true, // 他のアイコンを間引いてしまわないように
        visibility: this.visibility
      },
      metadata: {
        group: this.group
      }
    })
    */

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
          'circle-color': '#0ff',
          'circle-blur': 1,
          'circle-opacity-transition': {
            duration: 0
          }
        },
        metadata: {
          group: this.group
        }
      }
      // this.layer
    ) // ハイライトは、船のレイヤーより下に挿入

    // 航路
    /*
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
      },
      this.layer
    )
    */

    // Voyage Comparison of T-max
    this.map.addSource(`${this.source}Voycom`, {
      type: 'geojson',
      data: featureCollection([])
    })
    this.map.addLayer(
      {
        id: `${this.layer}Voycom`,
        source: `${this.source}Voycom`,
        type: 'line',
        layout: {
          visibility: this.visibility,
          'line-sort-key': [
            'match',
            ['get', 'selected'],
            'selected',
            10,
            'option',
            5,
            0
          ]
        },
        paint: {
          'line-color': [
            'match',
            ['get', 'selected'],
            'past',
            '#000',
            'selected',
            '#00f',
            'option',
            '#f00',
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
            'actual',
            ['literal', [1]],
            ['literal', [4, 2]]
          ] // 種別によって点>線にするかしないかを変えている
        },
        // filter: ['in', 'routetype', 'option', 'selected'],
        metadata: {
          group: this.group
        }
      }
      // this.layer
    )

    this.map.addLayer(
      {
        id: `${this.layer}VoycomGhost`,
        source: `${this.source}Voycom`,
        type: 'circle',
        layout: {
          'circle-sort-key': [
            'match',
            ['get', 'selected'],
            'selected',
            10,
            'option',
            5,
            0
          ]
        },
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
            ['get', 'selected'],
            'selected',
            '#00f',
            'option',
            '#f00',
            '#000'
          ]
        },
        metadata: {
          group: this.group
        }
      }
      // this.layer
    )

    // ツールチップ設定
    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: 'bottom'
    })

    // 要素にマウスが重なったらツールチップ表示
    this.map.on('mouseenter', this.layer, (e) => {
      this.map.getCanvas().style.cursor = 'pointer'

      const coordinates = e.features[0].geometry.coordinates.slice()
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        // 180°越え対応
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      let h = ''
      h += '<div class="vessel-popup">'
      h += '<div>&nbsp' + e.features[0].properties.vessel_name + '&nbsp</div>'
      h +=
        '<small><div>&nbsp&nbsp' +
        e.features[0].properties.speed +
        ' [kts] / ' +
        e.features[0].properties.heading +
        ' [deg.]&nbsp</div></small>'
      h += '</div>'
      this.popup.setLngLat(coordinates).setHTML(h).addTo(this.map)
      this.popup.addClassName('vessel')
    })

    // 要素からマウスが離れたらツールチップ非表示
    this.map.on('mouseleave', this.layer, () => {
      this.map.getCanvas().style.cursor = ''
    })

    this.map.on('click', () => {
      this.popup.remove()
    })

    // 船をクリックされたら、ルートを表示。ついでに、選択された船を「地図のセンターに移動し」「ハイライト表示」
    this.map.on('click', this.layer, async (e) => {
      this.onClickShipIcon(e)
    })

    this.map.on('click', (e) => {
      if (
        this.map
          .queryRenderedFeatures(e.point)
          .find((feature) => feature.layer.id === this.layer) ||
        !this.selectedVessel?.properties?.object_id
      )
        return
      // クリックしたら戻るように
      this.cancelRouteDisplay(this.selectedVessel.properties.object_id)
    })
  }

  async init() {
    super.init()

    await Promise.all([
      this.loadIconImage('./images/ship_white.svg', 'vesselSymbol'),
      this.loadIconImage('./images/ship_red.svg', 'vesselSymbolRed'),
      this.loadIconImage('./images/ship_yellow.svg', 'vesselSymbolYellow')
    ])

    if (this.voycomGeoJSON !== undefined) {
      this.map.getSource(`${this.source}Voycom`).setData(this.voycomGeoJSON)
      this.map.flyTo({ center: this.latestPos })
    }

    this.initialized = true
  }

  /*
  visibilityHandler() {
    // vessel layer on/off switch
    super.visibilityHandler(...arguments)
  }
  */

  /*
  async timeSeriesIndexHandler() {
    super.timeSeriesIndexHandler()
    console.log('TIME SERIES')
    if (this.visibility === 'visible' && this.timeSeries.data) {
      // Time slider update (including periodic update)
      const tm = this.timeSeries.data.tm
      const posttime = Math.floor(tm / 3600 / 3) * 3600 * 3
      console.log(posttime)

      this.map.setFilter(`${this.layer}VoycomGhost`, [
        'in',
        'posttime',
        posttime
      ])
    }
    console.log('vessel layer update by timeseries-index!!!')
  }
  */

  async updateTimeSeriesIndex() {
    super.updateTimeSeriesIndex()
    console.log(this.timeSeries.globalTime)
    if (this.visibility === 'visible' && this.timeSeries.globalTime) {
      console.log('TIME SERIES')
      // Time slider update (including periodic update)
      const tm = this.timeSeries.globalTime
      const posttime = Math.floor(tm / 3600000 / 3) * 3600 * 3
      console.log(posttime)

      if (this.voycomGeoJSON !== undefined) {
        this.map.getSource(`${this.source}Voycom`).setData(this.voycomGeoJSON)
        this.map.flyTo({ center: this.latestPos })
      }

      this.map.setFilter(`${this.layer}VoycomGhost`, [
        'in',
        'posttime',
        posttime
      ])
    }
    console.log('vessel layer update by timeseries-index!!!')
  }

  onClickShipIcon(e, isFromOnMessage) {
    // 船をクリックされたら、ルートを表示。ついでに、選択された船を「地図のセンターに移動し」「ハイライト表示」
    if (this.selectedVessel) {
      this.map.setFeatureState(
        { source: this.source, id: this.selectedVessel.properties.object_id },
        { selected: false }
      )
    }
    this.selectedVessel = e.features[0]
    this.map.setFeatureState(
      { source: this.source, id: this.selectedVessel.properties.object_id },
      { selected: true }
    )
    // これはaddLayerでいいのでは？
    this.map.setPaintProperty(this.layer, 'icon-opacity', [
      'case',
      ['boolean', ['feature-state', 'selected'], false],
      1,
      0.5
    ])
    this.map.getSource(`${this.source}Highlight`).setData(this.selectedVessel) // ハイライトするデータを設定
    this.blinkHighlightLayer() // 点滅開始

    // ルートデータを取得して、描画(setData)
    this.getRouteGeoJSON(this.selectedVessel.properties.object_id).then(
      (data) => {
        this.map.getSource(`${this.source}Route`).setData(data)
        // 黒魔術 to QuickSight QS側に問題があるため、未実装。
        // if (!isFromOnMessage) {
        //   const vesselName = e.features[0].properties.vessel_name
        //   window.top.postMessage({ messageType: 'selectVesselFromMapToQs', vesselName: [vesselName] })
        // }
      }
    )
  }

  // 180°またぎ対応を入れたいために、このようにしている。本来データ側で整形すべき
  async getRouteGeoJSON(objectId) {
    return new Promise((resolve) => {
      fetch(
        `${this.dataPath}/${this.customerId}/ssm/data/vessel/byid/${objectId}.geojson`,
        { headers: { Authorization: `Bearer ${this.token}` } }
        // this.corsOptions
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

  cancelRouteDisplay(objectId) {
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
    })
  }

  updateRouteHandler(legData) {
    console.log('VoyCom update handler!!!')

    console.log(legData)
    if (legData === undefined) {
      this.map.getSource(`${this.source}Voycom`).setData({
        type: 'FeatureCollection',
        features: []
      })
      return false
    }
    console.log(this.options.data)
    console.log(legData)
    this.legData = legData
    this.voycomGeoJSON = {}

    const latestPos = [
      parseFloat(legData.latest_position.lon) / 60,
      parseFloat(legData.latest_position.lat) / 60
    ]
    this.latestPos = latestPos
    this.makeGeoJSON(this.legData)
    // this.voycomGeoJSON.latest = this.latestJSON
    console.log(this.voycomGeoJSON)

    // this.map.getSource(this.source).setData(this.voycomGeoJSON.latest)

    if (this.visibility === 'visible' && this.voycomGeoJSON !== undefined) {
      this.map.getSource(`${this.source}Voycom`).setData(this.voycomGeoJSON)
      this.map.flyTo({ center: latestPos })
    }
    // const tmp = this.voycomGeoJSON.latest.features
    // console.log('tmpvessels: ' + tmp.length)
  }

  makeGeoJSON(legData) {
    console.log('MAKE GEOJSON')

    // const latest = legData.latest_position
    const vesselName = legData.service_info.ship_name
    // const legId = legData.service_info.service_id
    // const legRev = legData.service_info.voyagexml_revision
    // const imoNum = errmVessels[i].imo_num
    // const wnishipNum = errmVessels[i].wnishipnum
    const routeJSON = { type: 'FeatureCollection', features: [] }
    // console.log(vesselName)

    /*
    // Check alert
    const alert = this.checkAlert(errmVessels[i])
    if (alert === 'red') {
      this.redVessels.push(imoNum)
    } else if (alert === 'yellow') {
      this.yellowVessels.push(imoNum)
    }
    this.paintVessels()
    */

    /*
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
    */

    // Future route
    if ('waypoint' in legData) {
      const futureRoutes = legData.waypoint
      for (let i = 0; i < futureRoutes.length; i++) {
        const tmpFutureRoute = []
        const futurePoints = futureRoutes[i].points
        let ifSelected = ''
        if (futureRoutes[i].selected) {
          ifSelected = 'selected'
        } else {
          ifSelected = 'option'
        }
        const routeName = futureRoutes[i].route_name
        for (let j = 0; j < futurePoints.length; j++) {
          const wp = futurePoints[j]
          const tmpPoint = {
            type: 'Feature',
            properties: {
              vessel_name: vesselName,
              selected: ifSelected,
              route_name: routeName,
              // imo: imoNum,
              // wni: wnishipNum,
              routetype: 'future_point'
            },
            geometry: {
              coordinates: [],
              type: 'Point'
            }
          }
          tmpPoint.properties.nav = this.checkString('nav', wp)
          tmpPoint.properties.time = this.checkTime('time', wp)
          tmpPoint.properties.posttime = this.checkUnixtime('time', wp)
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
            selected: ifSelected,
            route_name: routeName,
            // imo: imoNum,
            // wni: wnishipNum,
            routetype: 'future'
          },
          geometry: {
            coordinates: tmpFutureRoute,
            type: 'LineString'
          }
        }
        convertCross180Coordinates(futureRoute.geometry.coordinates)
        routeJSON.features.push(futureRoute)
      }
    }

    // Past route
    if ('past_waypoint' in legData) {
      const tmpPastRoute = []
      const pastPoints = legData.past_waypoint
      for (let j = 0; j < pastPoints.length; j++) {
        const wp = pastPoints[j]
        const tmpPoint = {
          type: 'Feature',
          properties: {
            vessel_name: vesselName,
            selected: 'past',
            // imo: imoNum,
            // wni: wnishipNum,
            routetype: 'actual_point'
          },
          geometry: {
            coordinates: [],
            type: 'Point'
          }
        }
        tmpPoint.properties.nav = this.checkString('nav', wp)
        tmpPoint.properties.time = this.checkTime('time', wp)
        tmpPoint.properties.posttime = this.checkUnixtime('time', wp)
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
          selected: 'past',
          // imo: imoNum,
          // wni: wnishipNum,
          routetype: 'actual'
        },
        geometry: {
          coordinates: tmpPastRoute,
          type: 'LineString'
        }
      }
      convertCross180Coordinates(pastRoute.geometry.coordinates)
      routeJSON.features.push(pastRoute)

      this.voycomGeoJSON = routeJSON
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
        value = tmpTime.replace(/\//g, '-')
      } else if (tmpTime.slice(4, 5) === '-') {
        value = tmpTime
      }
    }
    return Date.parse(value) / 1000
  }
}
