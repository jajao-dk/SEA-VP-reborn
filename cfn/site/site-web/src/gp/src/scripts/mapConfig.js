import axios from 'axios'

export async function loadMapConfig(configPath, token) {
  const customerConfig = await axios.get(configPath).then((res) => res.data)

  const mapStyle =
    customerConfig?.theme === 'dark'
      ? 'mapbox://styles/wni-sea-dev/ckzxx645p00gm15r4hqoazofd'
      : 'mapbox://styles/wni-sea-dev/ckzxx6j04005n14qm2ro5s9kl'

  customerConfig.map = {
    center: [135, 35],
    zoom: 9,
    style: mapStyle,
    ...customerConfig.map
  }
  console.log(customerConfig)

  return customerConfig
}
