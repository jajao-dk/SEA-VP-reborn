import mapboxgl, { Map } from 'mapbox-gl'

// mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
mapboxgl.accessToken =
  'pk.eyJ1Ijoid25pLXNlYS1kZXYiLCJhIjoiY2t6bml6ZGkyMDA2djJ3bjBmNm8zbHl0aiJ9.jOXITKCaqn-DZ6d9dBUj5g'

/**
 * イベントをPromiseで返す
 *
 * @param {string} type イベントタイプ
 * @returns {Promise<*>} event
 */
Map.prototype.onPromise = function (type) {
  return new Promise((resolve) => {
    this.once(type, (event) => {
      resolve(event)
    })
  })
}
