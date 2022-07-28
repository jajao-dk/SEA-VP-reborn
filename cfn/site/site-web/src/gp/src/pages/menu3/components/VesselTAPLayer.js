import { Layer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Layer'
import { convertCross180Coordinates } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Util'
import { point, lineString, featureCollection } from '@turf/helpers'
import distance from '@turf/distance'
import along from '@turf/along'
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
    this.tapGeoJSON = {
      type: 'FeatureCollection',
      features: []
    }

    this.map.addSource(this.source, {
      type: 'geojson',
      data: featureCollection([]),
      promoteId: 'object_id'
    })

    // Voyage Comparison of T-max
    this.map.addSource(`${this.source}TAP`, {
      type: 'geojson',
      data: featureCollection([])
    })
    this.map.addLayer(
      {
        id: `${this.layer}TAP`,
        source: `${this.source}TAP`,
        type: 'line',
        layout: {
          visibility: this.visibility,
          'line-sort-key': ['match', ['get', 'legid'], 'dummy', 10, 0]
        },
        paint: {
          'line-color': ['match', ['get', 'legid'], 'dummy', '#fff', '#fff'], // 種別(GeoJSON の property値)によって色を分けている
          'line-opacity': 0.8,
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            4,
            ['match', ['get', 'legid'], 'dummy', 2, 2], // 種別とズームレベルによって、線の太さを変>えている
            10,
            ['match', ['get', 'legid'], 'dummy', 3, 3]
          ]
        },
        // filter: ['in', 'routetype', 'option', 'selected'],
        metadata: {
          group: this.group
        }
      }
      // this.layer
    )
  }

  async init() {
    super.init()

    await Promise.all([
      this.loadIconImage('./images/ship_white.svg', 'vesselSymbol'),
      this.loadIconImage('./images/ship_red.svg', 'vesselSymbolRed'),
      this.loadIconImage('./images/ship_yellow.svg', 'vesselSymbolYellow')
    ])

    if (this.tapGeoJSON !== undefined) {
      this.map.getSource(`${this.source}TAP`).setData(this.tapGeoJSON)
      // this.map.flyTo({ center: this.latestPos })
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

  /*
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
  */
  routeColoring(focusRoutes) {
    console.log('route-coloring')
    const routes = []
    for (let i = 0; i < focusRoutes.length; i++) {
      routes.push(focusRoutes[i].id)
    }
    const routeExpressions = ['match', ['get', 'legid'], 'dummy', '#fff']
    const zindexExpressions = ['match', ['get', 'legid'], 'dummy', 0]
    routes.forEach((id) => {
      routeExpressions.push(id, '#00f')
      zindexExpressions.push(id, 10)
    })
    routeExpressions.push('#fff')
    zindexExpressions.push(0)
    console.log(routeExpressions)
    this.map.setPaintProperty(
      `${this.layer}TAP`,
      'line-color',
      routeExpressions
    )
    this.map.setLayoutProperty(
      `${this.layer}TAP`,
      'line-sort-key',
      zindexExpressions
    )
  }

  displayRouteHandler(simDatas) {
    console.log('TAP route display handler!!!')
    console.log(simDatas)

    this.tapGeoJSON.features.length = 0 // reset geojson
    for (let i = 0; i < simDatas.length; i++) {
      console.log(i)
      const legInfo = simDatas[i]
      const routeInfos = simDatas[i].route_infos

      for (let j = 0; j < routeInfos.length; j++) {
        const route = routeInfos[j].waypoints

        // const route = tapRoutes[i].route_infos[j].waypoints
        const latlon = []
        for (let k = 0; k < route.length; k++) {
          const tmplatlon = [route[k].lon, route[k].lat]
          latlon.push(tmplatlon)
        }
        convertCross180Coordinates(latlon)
        let tmpDist = 0
        for (let k = 0; k < latlon.length - 1; k++) {
          const from = point(latlon[k])
          const to = point(latlon[k + 1])
          const options = { units: 'kilometers' }
          const dist = distance(from, to, options)
          tmpDist = tmpDist + dist
        }
        console.log(tmpDist)
        const arc = []
        const tmpLine = lineString(latlon)
        for (let k = 0; k < tmpDist; k += 100) {
          // 200km/6hours
          const options = { units: 'kilometers' }
          const segment = along(tmpLine, k, options)
          arc.push(segment.geometry.coordinates)
        }

        // const simResult = routeInfos[j].simulation_result
        const legId = legInfo.leg_id + '-' + routeInfos[j].route_id
        console.log(legId)
        const tmpRoute = {
          geometry: {
            coordinates: arc,
            type: 'LineString'
          },
          type: 'Feature',
          properties: {
            legid: legId
            // vessel_type: '',
            // ETA: simResult.eta,
            // ETD: simResult.etd,
            // distance: simResult.distance, // shortestDist*0.539956803
            // hsfo: simResult.hsfo,
            // lsdogo: simResult.lsdogo,
            // current_f: simResult.current_factor,
            // weather_f: simResult.weather_factor
          }
        }

        this.tapGeoJSON.features.push(tmpRoute)
      }
    }
    if (this.visibility === 'visible' && this.tapGeoJSON !== undefined) {
      this.map.getSource(`${this.source}TAP`).setData(this.tapGeoJSON)
      // this.map.flyTo({ center: latestPos })
    }
  }
}
