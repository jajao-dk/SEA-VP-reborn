<template>
  <div
    id="app"
    class="allpane"
  >
    <div class="inputpane">
      <div class="inputplane">
        <div>
          <b>Vessel name:</b> &nbsp;
          <select v-model="selectedVessel">
            <option
              disalbled
              value=""
            >
              SELECT
            </option>
            <option
              v-for="vsl in vesselList"
              :key="vsl.ship_num"
              :value="vsl"
            >
              {{ vsl.ship_name }}
            </option>
          </select>&nbsp;
          <button
            class="perfbtn"
            type="submit"
            @click="getVoyComData"
          >
            Comparison
          </button><br><br>
          <div v-if="ytdAvailable">
            <b>Vessel type:</b> {{ ytdCII.using_ship_info.ship_type }}<br>
            <b>Capacity({{ ytdCII.using_ship_info.using_capacity_type }}):</b> {{ (ytdCII.using_ship_info.using_capacity).toLocaleString() }}<br>
            <b>YtD before departure</b><br>
            <b>&nbsp; &nbsp; Distance:</b> {{ (ytdCII.distance).toLocaleString() }}<br>
            <b>&nbsp; &nbsp; CO2:</b> {{ Math.round(ytdCII.co2).toLocaleString() }}<br>
            <b>&nbsp; &nbsp; CII rank:</b> {{ ytdCII.cii_rank }}<br>
            <div class="spd-info">
              <div class="spd-info-box">
                <b>FOC at arrival port: </b> &nbsp;
                <input
                  v-model="inPortFoc"
                  style="text-align:right"
                  type="number"
                >
                [MT] &nbsp;
                <button
                  class="perfbtn"
                  type="submit"
                  @click="calcPortFoc"
                >
                  Calculate
                </button><br>
              </div>
            </div>
          </div>
        </div><br>

        <table>
          <tbody>
            <tr
              v-for="info in infos"
              :key="info.label"
            >
              <th>{{ info.label }}</th>
              <td>{{ info.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mappane">
      <Map
        v-if="authorized"
        :customer-id="customerId"
        :leg-data="legData"
        :config="config.value"
        :path-params="pathParams"
        :map-focus-vessel="mapFocusVessel"
        :token="token"
      />
    </div>

    <div class="tablepane">
      <Table
        v-if="authorized"
        :customer-id="customerId"
        :leg-data="legData"
        :loading="loading"
        @table-plan-selected="tablePlanSelected"
      />
    </div>

    <div class="chartpane">
      <GChart
        v-if="authorized"
        :customer-id="customerId"
        :cii-data="ciiData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { loadMapConfig } from '../../scripts/mapConfig.js'
import Map from './components/Map.vue'
import Table from './components/Table.vue'
import GChart from './components/GChart.vue'
import { useAuth } from '../../plugins/auth'
import calcCII from '../calcCII.js'
import values from '../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/scripts/values'
import {
  set as gtagSet,
  pageview as gtagPageview,
  optIn as gtagOptin,
  event as gtagEvent,
  customMap as gtagCustomMap
} from 'vue-gtag'

// Common parameters
const { getUser, getToken } = useAuth()
const customerId = ref('')
const authorized = ref(false)
const config = reactive({})
const pathParams = ref({ shopName: 'vp' })
const mapFocusVessel = ref('')
const token = ref('')
const loading = ref(false)

// Create Info, Table, Map, Chart
const infos = ref([])
const vesselList = ref([])
const selectedVessel = ref('')
let legDatas = []
const legData = ref({ test: 0 }) // dummy data
const client = ref('')
let ciiTarget = []
const ciiData = ref({})
const ytdAvailable = ref(false)
const ytdCII = ref({})
const inPortFoc = ref(0)

const onMessage = (event) => {
  if (event.origin === location.origin && event.data) {
    switch (event.data.messageType) {
      case 'openWindow':
        window.open(event.data.url, event.data.windowName)
        break
    }
  }
}

window.addEventListener('message', onMessage, false)

onMounted(async () => {
  token.value = await getToken()
  const user = await getUser()
  customerId.value = user.customer_ids[0]
  console.log(user.customer_ids[0])

  const mapConfigUrl = './map_config_menu5.json'
  config.value = await loadMapConfig(mapConfigUrl, null)
  console.log(config.value)

  pathParams.value.client = user.customer_ids[0]
  pathParams.value.application = 'ssm'
  authorized.value = true

  getVesselList()

  gtagOptin() // gtag.js にて、プラグイン登録時にプラグイン無効化しているので、ここで有効化する
  // GA4用の記述
  gtagSet('user_id', user.email)
  gtagSet('user_properties', { login_id: user.email, customer_id: user.customer_ids?.[0] })
  // UA用の記述
  gtagCustomMap('dimension1', 'login_id')
  gtagCustomMap('dimension2', 'customer_id')
  gtagEvent('custom_dimension', { login_id: user.email, customer_id: user.customer_ids?.[0] })
  // pageview送信
  gtagPageview(location.href)
})

// Get vessel list
const getVesselList = async () => {
  console.log('getVesselList')
  console.log('Client code: ', client.value)
  client.value = customerId.value

  if (client.value === '') {
    return false
  }

  // Fetch list of vessels using OSR/OSR-L
  const osrVessels = await fetch(
      `${values.SECURE_DATA_URL}/${customerId.value}/errm/data/vessel/osr_vessels.json`
  ).then((res) => res.json())

  /*
  const osrVessels = await fetch(
      `${values.SECURE_DATA_URL}/${customerId.value}/errm/data/vessel/osr_vessels.json`,
      { headers: { Authorization: `Bearer ${token.value}` } }
  ).then((res) => res.json())
  */

  console.log(osrVessels)

  const list = osrVessels
  list.sort(function (a, b) {
    if (a.ship_name < b.ship_name) return -1
    if (a.ship_name > b.ship_name) return 1
    return 0
  })
  vesselList.value = list

  // Fetch CIM target data
  ciiTarget = await fetch(
      `${values.SECURE_DATA_URL}/${customerId.value}/errm/data/vessel/cii-target.json`
  ).then((res) => res.json())

  // ciiTarget = await fetch(
  //    `${values.SECURE_DATA_URL}/${customerId.value}/errm/data/vessel/cii-target.json`,
  //    { headers: { Authorization: `Bearer ${token.value}` } }
  // ).then((res) => res.json())

  console.log(ciiTarget)
}

// Get comparison data
const getVoyComData = async () => {
  // initialize
  console.log(selectedVessel.value.ship_num)
  console.log(selectedVessel.value.imo_num)
  const imoNumber = selectedVessel.value.imo_num
  ytdAvailable.value = false
  // legData.value = undefined
  for (const key in legData.value) {
    delete legData.value[key]
  }
  console.log(legData.value)
  ciiData.value = {}
  infos.value.length = 0
  inPortFoc.value = 0
  loading.value = true

  // Get YTD data
  const requestUrl = 'https://cii.seapln-osr.pt-aws.wni.com/v1/vdv/ytd/'
  const requestBody = { client_code: client.value, imo_no: [Number(imoNumber)] }
  const response = await fetch(requestUrl, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(requestBody)
  })
    .then((res) => res.json())
    .catch(console.error)
  console.log(response)

  // YTD CII calculation
  if (response.length !== 0) {
    // ytdAvailable.value = true
    const ytdCO2 =
    response[0].ytd_cons.grand_total_dogo * 3.206 +
    response[0].ytd_cons.grand_total_hfo * 3.114 +
    response[0].ytd_cons.grand_total_lfo * 3.151
    const ciiBody = [{
      co2: ytdCO2,
      distance: response[0].ytd_dist_depart_arr,
      imoNumber
    }]
    const tmpYtd = await calcCII(ciiBody)
    ytdCII.value = tmpYtd[0]
    ytdAvailable.value = true
    console.log(tmpYtd[0])
  } else {
    ytdAvailable.value = false
  }

  const urlVoyCom = 'https://tmax-b01.weathernews.com/T-Max/VoyageComparison/api/reborn_get_voy_comparison_data.cgi?wnishipnum=' + selectedVessel.value.ship_num + '&client=' + client.value

  const resp = await fetch(urlVoyCom)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    legDatas = data.data.leg_infos

    legDatas.sort(function (a, b) { // reverse order
      if (a.dep_time > b.dep_time) return -1
      if (a.dep_time < b.dep_time) return 1
      return 0
    })
  }

  if (legDatas.length > 0) {
    legDatas[0].imo_number = imoNumber
    legDatas[0].ytd_co2 = ytdCII.value.co2
    legDatas[0].ytd_distance = ytdCII.value.distance
    legDatas[0].inPortFoc = 0
    legData.value = legDatas[0]
    console.log(legData.value)

    if (legData.value !== undefined) {
      infos.value = legData.value.voyage_information
    }

    if (imoNumber !== '') {
      ciiTarget[imoNumber].ytd = ytdCII.value
      ciiData.value = ciiTarget[imoNumber]
    } else {
      console.log('CII target: No imo number is found.')
    }
  } else {
    infos.value.push({ label: 'Voyage No', value: 'CANNOT FIND VOYAGE COMPARISON DATA' })
    // legData.value = {}
    ciiData.value = {}
    console.log('no comparison data')
    console.log(legData.value)
  }
  loading.value = false
  console.log(infos.value)
}

const calcPortFoc = async () => {
  if (inPortFoc.value !== 0) {
    console.log('calcPortFoc')
    legData.value.inPortFoc = inPortFoc.value
    ciiData.value.inPortFoc = inPortFoc.value
  }
}

// Emit
const tablePlanSelected = selectedPlan => {
  console.log('table emit!')
  console.log(selectedPlan)
  ciiData.value.selectedPlan = selectedPlan
  /*
  mapFocusVessel.value = ''
  mapFocusVessel.value = selectedVessel
  dashboard.setParameters({ IMO: [''] })
  dashboard.setParameters({ IMO: selectedVessel })
  */
}

</script>

<style scoped>
.allpane {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-rows: 60% 40%;
  grid-template-columns: 30% 40% 30%;
}

.inputpane {
  grid-row: 1;
  grid-column: 1;
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
  line-height: 20px;
  font-size: 14px;
  overflow: scroll;
}

input {
  border: 2px solid blue;
  width: 100px;
  margin-bottom: 10px;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

select {
  border: 2px solid blue;
  width: 150px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 2px 5px;
  /* margin: 3px 0; */
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

table {
  font-size: 12px;
}

th,td {
  border: solid 1px;
  padding: 5px;
}

.mappane {
  grid-row: 1;
  grid-column: 2;
}
.tablepane {
  grid-row: 2;
  grid-column: 1/3;
  overflow-y: scroll;
  /* overflow-x: scroll; */
}
.chartpane {
  grid-row: 1/3;
  grid-column: 3;
}

body {
  padding: 0;
  margin: 0;
}

#app {
  height: 100%;
}

/*
.operation-wrapper .operation-icon {
  width: 20px;
  cursor: pointer;
}
*/

.inputplane {
  width: 100%;
  height: 50vh;
}

</style>
