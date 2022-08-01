<template>
  <div
    id="app"
    class="allpane"
  >
    <div class="inputpane">
      <!--div>
        Client code:
        <input
          v-model="client"
          class="perfin"
          type="text"
          placeholder=""
        >&nbsp;
        <button
          class="perfbtn"
          type="submit"
          @click="getVesselList"
        >
          Submit
        </button><br>
      </div-->
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

    <!--div class="qspane">
      <div
        ref="container"
        class="h-full"
      />
    </div-->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { loadMapConfig } from '../../scripts/mapConfig.js'
import Map from './components/Map.vue'
import Table from './components/Table.vue'
import { useAuth } from '../../plugins/auth'
// import axios from 'axios'
// import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'

// Common parameters
const { getUser, getToken } = useAuth()
const customerId = ref('')
const authorized = ref(false)
const config = reactive({})
const pathParams = ref({ shopName: 'vp' })
const mapFocusVessel = ref('')
const token = ref('')

// Create Info, Table and Map
const infos = ref([])
const vesselList = ref([])
const selectedVessel = ref('')
let legDatas = []
const legData = ref({})
const client = ref('')

// QS
// const container = ref(null)

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
  // console.log(pathParams.value)
  authorized.value = true
  // console.log(authorized.value)

  /*
  const options = {
    url: 'https://ap-northeast-1.quicksight.aws.amazon.com/sn/embed/share/accounts/716990209761/dashboards/1cca6f7c-2ee4-4c0d-91d1-42cbe40d995c?directory_alias=sea-analytics',
    container: container.value,
    iframeResizeOnSheetChange: true,
    printEnabled: true,
    scrolling: 'auto',
    width: '100%',
    height: '100%',
    locale: 'en-US'
  }
  */
  // QuickSightEmbedding.embedDashboard(options)

  getVesselList()
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

  // client.value = 'RIO'
  // const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_setting_for_enrouterisk.cgi?client=' + client.value
  // const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_vessel_list.cgi?client=' + client.value + '&search_type=menu_id&val=Tonnage'
  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_vessel_list.cgi?client=' + client.value + '&search_type=file_name&val=fam_vessel_list'
  const resp = await fetch(urlSetting)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    // vesselList.value = data.data

    /*
    const list = data.data.vessel_list
    list.sort(function (a, b) {
      if (a.vessel_name < b.vessel_name) return -1
      if (a.vessel_name > b.vessel_name) return 1
      return 0
    })
    */

    const list = data.data
    list.sort(function (a, b) {
      if (a.ship_name < b.ship_name) return -1
      if (a.ship_name > b.ship_name) return 1
      return 0
    })

    // vesselList.value = checkVesselList(list)
    // checkVesselList(list)
    vesselList.value = list
  }

  /*
  const allVessels = []
  const allIMOs = []
  vesselList.value.map(ship => {
    allVessels.push(ship.ship_name)
    allIMOs.push(ship.imo_num)
    return false
  }) */
  console.log(vesselList.value)
  // console.log(allVessels)
  // console.log(allIMOs)
}

/*
const checkVesselList = async (list) => {
  const tmpList = []
  const promises = []
  for (let i = 0; i < list.length; i++) {
    const wni = list[i].wnishipnum
    const urlVoyCom = 'https://tmax-b01.weathernews.com/T-Max/VoyageComparison/api/reborn_get_voy_comparison_data.cgi?wnishipnum=' + wni + '&client=' + client.value
    promises.push(
      axios.get(urlVoyCom)
        .then(function (resp) {
          console.log(urlVoyCom)
          console.log(i)
          console.log(resp.data.leg_infos)
          const legs = resp.data
          if (legs.result === 'OK') {
            if (legs.data.leg_infos.length >= 0) {
              console.log(wni)
              tmpList.push({
                vessel_name: list[i].vessel_name,
                wnishipnum: wni
              })
            }
          }
        })
    )
  }
  Promise.all(promises).then(() => {
    console.log(tmpList)
    return tmpList
  })
  // return tmpList
}
*/

/*
const checkVesselList = async (list) => {
  const tmpList = []
  for (let i = 0; i < list.length; i++) {
    const wni = list[i].wnishipnum
    const urlVoyCom = 'https://tmax-b01.weathernews.com/T-Max/VoyageComparison/api/reborn_get_voy_comparison_data.cgi?wnishipnum=' + wni + '&client=' + client.value
    const resp = await fetch(urlVoyCom)
    const data = await resp.json()
    if (data.result === 'OK') {
      console.log(data.data.leg_infos)
      if (data.data.leg_infos.length > 0) {
        console.log(wni)
        tmpList.push({
          vessel_name: list[i].vessel_name,
          wnishipnum: wni
        })
      }
    }
  }
  console.log(tmpList)
  // return tmpList
}
*/

// Get LEG data
const getVoyComData = async () => {
  // console.log(selectedVessel.value.wnishipnum)
  console.log(selectedVessel.value.ship_num)
  // const urlVoyCom = 'https://tmax-b01.weathernews.com/T-Max/VoyageComparison/api/reborn_get_voy_comparison_data.cgi?wnishipnum=' + selectedVessel.value.wnishipnum + '&client=' + client.value
  const urlVoyCom = 'https://tmax-b01.weathernews.com/T-Max/VoyageComparison/api/reborn_get_voy_comparison_data.cgi?wnishipnum=' + selectedVessel.value.ship_num + '&client=' + client.value
  // const urlLatest = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_latest_enrouterisk.cgi'
  // const body = ['TEST', JSON.stringify({ ships: allVessels, group: '', client: client.value })]

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

  infos.value.length = 0
  if (legData.value !== undefined) {
    infos.value = legData.value.voyage_information
  }
}

</script>

<style scoped>
.allpane {
  display: grid;
  height: 100%;
  grid-template-rows: 60% 40%;
  grid-template-columns: 40% 60%;
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
  grid-column: 1/3;
  overflow-y: scroll;
  /* overflow-x: scroll; */
}
.qspane {
  grid-row: 1/4;
  grid-column: 2;
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

</style>
