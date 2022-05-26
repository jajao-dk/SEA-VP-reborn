import mapboxgl, { Map } from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

/**
 * イベントをPromiseで返す
 *
 * @param {string} type イベントタイプ
 * @returns {Promise<*>} event
 */
Map.prototype.onPromise = function (type) {
  return new Promise(resolve => {
    this.once(type, event => { resolve(event) })
  })
}
