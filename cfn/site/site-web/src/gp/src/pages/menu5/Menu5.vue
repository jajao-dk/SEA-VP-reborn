<template>
  <div
    id="app"
    class="allpane"
  >
    <div class="inputpane">
      <div class="inputplane">
        <div>
          Vessel name: &nbsp;
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
          </button><br><br><br>
        </div>

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
        @table-vessel-selected="tableVesselSelected"
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
import values from '../../SEA-MapWidget-Web/cfn/site/site-map/src/map/src/scripts/values'
// import axios from 'axios'
// import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'
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

// Create Info, Table, Map, Chart
const infos = ref([])
const vesselList = ref([])
const selectedVessel = ref('')
let legDatas = []
const legData = ref({})
const client = ref('')
let ciiTarget = []
const ciiData = ref({})

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

// Emit
const tableVesselSelected = selectedVessel => {
  console.log('emit! ' + selectedVessel)
  mapFocusVessel.value = selectedVessel
}

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

// Get LEG data
const getVoyComData = async () => {
  // initialize
  console.log(selectedVessel.value.ship_num)
  legData.value = undefined
  infos.value.length = 0

  // const urlVoyCom = 'https://tmax-b01.weathernews.com/T-Max/VoyageComparison/api/reborn_get_voy_comparison_data.cgi?wnishipnum=' + selectedVessel.value.wnishipnum + '&client=' + client.value
  const urlVoyCom = 'https://tmax-b01.weathernews.com/T-Max/VoyageComparison/api/reborn_get_voy_comparison_data.cgi?wnishipnum=' + selectedVessel.value.ship_num + '&client=' + client.value

  const resp = await fetch(urlVoyCom)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    legDatas = data.data.leg_infos

    legDatas.sort(function (a, b) { // reverse ofder
      if (a.dep_time > b.dep_time) return -1
      if (a.dep_time < b.dep_time) return 1
      return 0
    })
  }

  if (legDatas.length > 0) {
    console.log(legDatas)
    legData.value = legDatas[0]
    console.log(legData.value)

    // vesselListからIMO Numberを取得する
    let imoNumber = ''
    const wnishipnum = selectedVessel.value.ship_num
    for (let i = 0; i < vesselList.value.length; i++) {
      if (vesselList.value[i].ship_num === wnishipnum) {
        imoNumber = vesselList.value[i].imo_num
        break
      }
    }
    legData.value.imo_number = imoNumber

    if (legData.value !== undefined) {
      infos.value = legData.value.voyage_information
    }

    if (imoNumber !== '') {
      ciiData.value = ciiTarget[imoNumber]
    }
  } else {
    infos.value.push({ label: 'Voyage No', value: 'CANNOT FIND VOYAGE COMPARISON DATA' })
  }
  console.log(infos.value)
}

</script>

<style scoped>
.allpane {
  display: grid;
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

select {
  border: 2px solid blue;
  width: 100px;
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
  grid-column: 1/4;
  overflow-y: scroll;
  /* overflow-x: scroll; */
}
.chartpane {
  grid-row: 1;
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
