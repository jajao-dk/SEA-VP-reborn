import { Layer } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Layer'
import { convertCross180Coordinates } from '../../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/components/Layers/Util'
import { featureCollection } from '@turf/helpers'
import values from '../../../scripts/values'
import mapboxgl from 'mapbox-gl'
// import X2JS from 'node-x2js'

export class VesselVoyComLayer extends Layer {
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

    // Voyage Comparison of T-max (vessel route)
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
            20,
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
            ['literal', [2, 1]]
          ] // 種別によって点>線にするかしないかを変えている
        },
        // filter: ['in', 'routetype', 'option', 'selected'],
        metadata: {
          group: this.group
        }
      }
      // this.layer
    )

    // Voyage Comparison of T-max (vessel position)
    this.map.addLayer(
      {
        id: `${this.layer}VoycomGhost`,
        source: `${this.source}Voycom`,
        type: 'circle',
        layout: {
          'circle-sort-key': [
            'match',
            ['get', 'selected'],
            'option',
            10,
            'selected',
            20,
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
  }

  async init() {
    super.init()

    if (this.voycomGeoJSON !== undefined) {
      this.map.getSource(`${this.source}Voycom`).setData(this.voycomGeoJSON)
      this.map.flyTo({ center: this.latestPos })
    }

    this.initialized = true
  }

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
        // this.map.flyTo({ center: this.latestPos })
      }

      this.map.setFilter(`${this.layer}VoycomGhost`, [
        'in',
        'posttime',
        posttime
      ])
    }
    console.log('vessel layer update by timeseries-index!!!')
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
    console.log(this.voycomGeoJSON)

    if (this.visibility === 'visible' && this.voycomGeoJSON !== undefined) {
      this.map.getSource(`${this.source}Voycom`).setData(this.voycomGeoJSON)
      this.map.flyTo({ center: latestPos })
    }
  }

  makeGeoJSON(legData) {
    console.log('MAKE GEOJSON')

    const vesselName = legData.service_info.ship_name
    const routeJSON = { type: 'FeatureCollection', features: [] }

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
