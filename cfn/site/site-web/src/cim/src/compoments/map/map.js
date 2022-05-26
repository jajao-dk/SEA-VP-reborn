/* eslint-disable no-unused-vars */
import * as vue from 'vue'
import { ref, onMounted } from 'vue'
import { Map, LngLat } from 'mapbox-gl'
/* eslint-enable */

export function useMap () {
  /** @type {vue.Ref<HTMLElement>} */
  const container = ref(null)
  /** @type {vue.Ref<LngLat>} */
  const point = ref(null)

  onMounted(async () => {
    const map = new Map({
      container: container.value,
      style: 'mapbox://styles/wni-with/ckvlpa1by14oq14nl44exkxwo',
      center: { lng: 139.4574888475846, lat: 35.57129105820117 },
      zoom: 7
    })
    await map.onPromise('load')

    map.on('click', ({ lngLat }) => { point.value = lngLat })
  })

  return { container, point }
}
