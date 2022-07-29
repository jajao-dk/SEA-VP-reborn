<template>
  <div
    id="app"
    class="allpane"
  >
    <div class="inputpane">
      <div class="head">
        <b>SIMULATION INPUT</b>
      </div><br><br>

      <b>Vessel info</b>
      <div class="basic-info">
        <div class="basic-info-box">
          Client code:&nbsp;
          <input
            v-model="client"
            type="text"
            placeholder=""
          >&nbsp;
          <button
            type="submit"
            @click="getVesselList"
          >
            Submit
          </button>
        </div>
        <div class="basic-info-box">
          &nbsp; Vessel name: &nbsp;
          <select v-model="selectedVessel">
            <option
              disalbled
              value=""
            >
              SELECT
            </option>
            <option
              v-for="vsl in vesselList"
              :key="vsl.wnishipnum"
              :value="vsl"
            >
              {{ vsl.ship_name }}
            </option>
          </select>
        </div>
      </div><br>

      <b>Speed info</b>
      <div class="spd-info">
        <!-- form novalidate @submit.prevent="onSubmit"-->
        <div class="spd-info-box">
          Speed/rpm/%MCR
          <select
            v-model="selectedKey"
            class="spdinput"
            @change="selected"
          >
            <option
              v-for="speed in speeds"
              :key="speed.key"
              :value="speed.key"
            >
              {{ speed.item }}
            </option>
          </select>
        </div>
        <div class="spd-info-box">
          &nbsp; Laden:
          <input
            v-model="ladSpeed"
            class="spdinput"
            type="text"
          >
        </div>
        <div class="spd-info-box">
          &nbsp; Ballast:
          <input
            v-model="balSpeed"
            class="spdinput"
            type="text"
          ><br><br>
        </div>
      </div>

      <b>Voyage plan</b>
      <div class="voy-plan">
        <div>
          ETD(UTC):&nbsp;
          <div class="dtp">
            <Datepicker
              v-model="date"
              :utc="false"
            />
          </div>
        </div><br>
        <table>
          <thead>
            <tr>
              <th>Port</th>
              <!--th>Arrival</th-->
              <th>Laden/Ballast</th>
              <!--th>Target ETA</th-->
              <th>Port days</th>
              <th>Add/Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for=" (plan, index) in plans"
              :key="plan.dep"
            >
              <td>
                <select v-model="plan.port">
                  <option
                    disalbled
                    value=""
                  >
                    SELECT
                  </option>
                  <option
                    v-for="port in portList"
                    :key="port"
                    :value="port"
                  >
                    {{ port }}
                  </option>
                </select>
              </td>
              <!--td>
                <select v-model="plan.arr">
                  <option
                    disalbled
                    value=""
                  >
                    SELECT
                  </option>
                  <option
                    v-for="port in portList"
                    :key="port"
                    :value="port"
                  >
                    {{ port }}
                  </option>
                </select>
              </td-->
              <td>
                <select
                  v-model="plan.lb"
                  class="spdinput"
                >
                  <option
                    v-for="option in options"
                    :key="option.id"
                    :value="option.value"
                  >
                    {{ option.text }}
                  </option>
                </select>
              </td>
              <!--td><input v-model="plan.eta"></td-->
              <td><input v-model="plan.port_days"></td>
              <td>
                <button
                  type="submit"
                  @click="addRaw(index)"
                >
                  Add
                </button>&nbsp;
                <button
                  type="submit"
                  @click="delRaw(index)"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div><br>

      <div class="simbtn-pane">
        <button
          class="simbtn"
          @click="simStartEventHandler"
        >
          Simulation
        </button>&nbsp;
        <!--button
          class="simbtn"
          @click="simClearEventHandler"
        >
          CLEAR ALL
        </button><br><br-->
      <!--div>
          <button class="simbtn" @click="tableRowsClearEventHandler">
            CLEAR Rows
          </button>
        </div>
        <div>
          <button class="simbtn" @click="perfEventHandler">
            Performance
          </button>
        </div-->
      </div>

    <!--div class="vessellist">
        <simple-type-ahead
          placeholder="Search vessels"
          :items="vesselList"
          :minInputLength="0"
          @selectItem="vesselSelectItemEventHandler"
        ></simple-type-ahead>
      </div-->
    <!--button
        class="perfbtn"
        type="submit"
        @click="getVoyComData"
      >
        Comparison
      </button-->
    </div>

    <div class="simpane">
      <div class="head">
        <b>SIMULATION RESULT</b><br>
      </div>
      <Table
        v-if="authorized"
        :customer-id="customerId"
        :sim-datas="simDatas"
        @table-route-selected="tableRouteSelected"
        @new-voyage-data="newVoyageData"
      />
    </div>

    <div class="mappane">
      <Map
        v-if="authorized"
        :customer-id="customerId"
        :sim-datas="simDatas"
        :config="config.value"
        :path-params="pathParams"
        :map-focus-route="mapFocusRoute"
        :token="token"
      />
    </div>

    <div class="tablepane">
      <div class="head">
        <b>
          VOYAGE ESTIMATE
        </b>
      </div>
      <VTable
        v-if="authorized"
        :customer-id="customerId"
        :voyage-data="voyageData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { loadMapConfig } from '../../scripts/mapConfig.js'
import Map from './components/Map.vue'
import Table from './components/Table.vue'
import VTable from './components/VTable.vue'
import { useAuth } from '../../plugins/auth'
// import SimpleTypeAhead from 'vue3-simple-typeahead'

// Common parameters
const { getUser, getToken } = useAuth()
const customerId = ref('')
const authorized = ref(false)
const config = reactive({})
const pathParams = ref({ shopName: 'vp' })
const mapFocusRoute = ref('')
const token = ref('')
const date = ref()

// Simulation input - basic info
const client = ref('')
const vesselList = ref([])
const portList = ref([])
const selectedVessel = ref('')

// Simulation input - speed info
const speeds = reactive([
  { id: 0, item: 'SELECT', key: '', unit: '' },
  { id: 1, item: 'speed [kts]', key: 'speed', unit: 'kts' },
  { id: 2, item: 'RPM [rpm]', key: 'rpm', unit: 'rpm' },
  { id: 3, item: '%MCR [%]', key: 'mcr', unit: '%' }
])
const selectedKey = ref('')
const ladSpeed = ref(0)
const balSpeed = ref(0)

// Simulation input - voyage plans
const plans = ref([
  { port: '', port_days: 0, lb: '---', eta: '---' },
  { port: '', port_days: 0, lb: 'L', eta: '' }
])
const options = reactive([
  { text: '---', value: '---', id: '---' },
  { text: 'Laden', value: 'L', id: 'L' },
  { text: 'Ballast', value: 'B', id: 'B' }
])
const addRaw = (index) => {
  console.log('add button')
  console.log(index)
  // plans.value.push({ dep: '', dep_days: '', arr: '', arr_days: '', lb: 'L', eta: '' })
  plans.value.splice(index + 1, 0, { dep: '', arr: '', port_days: 0, lb: 'L', eta: '' })
}
const delRaw = (index) => {
  console.log('del button')
  console.log('index')
  plans.value.splice(index, 1)
}

// Simulation result (Table)
const simDatas = ref([])
// const simData = ref({})

// Voyage evaluation sheet (VTable)
const voyageData = ref({})

// Emit
const tableRouteSelected = selectedRoutes => {
  console.log('emit! table route selected')
  console.log(selectedRoutes)
  mapFocusRoute.value = selectedRoutes
}

const newVoyageData = newData => {
  console.log('emit! new voyage data')
  console.log(newData)
  voyageData.value = newData
}

onMounted(async () => {
  token.value = await getToken()
  const user = await getUser()
  customerId.value = user.customer_ids[0]
  console.log(user.customer_ids[0])

  const mapConfigUrl = './map_config_menu3.json'
  config.value = await loadMapConfig(mapConfigUrl, null)
  console.log(config.value)

  pathParams.value.client = user.customer_ids[0]
  pathParams.value.application = 'ssm'
  authorized.value = true

  // getVesselList()
  getPortList()
})

// Get vessel list
const getVesselList = async () => {
  console.log('getVesselList')
  console.log('Client code: ', client.value)

  if (client.value === '') {
    return false
  }

  // client.value = 'RIO'
  // const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_setting_for_enrouterisk.cgi?client=' + client.value
  // const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_vessel_list.cgi?client=' + client.value + '&search_type=menu_id&val=Tonnage'
  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_vessel_list.cgi?client=' + client.value + '&search_type=file_name&val=all'
  const resp = await fetch(urlSetting)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    const list = data.data
    list.sort(function (a, b) {
      if (a.ship_name < b.ship_name) return -1
      if (a.ship_name > b.ship_name) return 1
      return 0
    })

    vesselList.value = list
  }
  console.log(vesselList.value)
}

// Get port list
const getPortList = async () => {
  console.log('getPortList')
  // const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_port_list_all.cgi?client=' + client.value
  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_port_list_all.cgi?client=NYK'
  const resp = await fetch(urlSetting)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    portList.value = data.data
  }
  console.log(portList.value)
}

const simStartEventHandler = async (item) => {
  console.log('simulation start')
  console.log(plans.value)
  console.log(selectedKey.value)
  console.log(ladSpeed.value)
  console.log(balSpeed.value)
  console.log(selectedVessel.value)
  console.log(date.value)

  const dt = new Date(date.value)
  console.log(dt.toISOString())
  const Y = dt.getFullYear()
  const M = dt.getMonth()
  const D = dt.getDate()
  const h = dt.getHours()
  const m = dt.getMinutes()

  /*
  dt.setUTCFullYear(Y)
  dt.setUTCMonth(M)
  dt.setUTCDate(D)
  dt.setUTCHours(h)
  dt.setUTCMinutes(m)
  console.log(dt.toISOString())
  */

  const ETD = String(Y) + '/' + String(M + 1) + '/' + String(D) + ' ' + String(h) + ':' + String(m)
  console.log(ETD)

  simDatas.value.length = 0

  // validation
  if (selectedVessel.value === undefined) {
    console.log('Vessel name is missing.')
    return false
  }
  if (ladSpeed.value === 0 || balSpeed.value === 0) {
    console.log('Speed values are missing.')
    return false
  }

  // Create post data
  const planName = 'plan'
  console.log(planName)
  const param = {}
  param.PLAN = {
    name: planName,
    ship_info: {
      wnishipnum: selectedVessel.value.ship_num,
      shipname: selectedVessel.value.ship_name,
      callsign: selectedVessel.value.call_sign,
      imo_num: selectedVessel.value.imo_num,
      shiptype: selectedVessel.value.ship_type,
      dwt: {
        min: selectedVessel.value.dwt,
        max: selectedVessel.value.dwt
      }
    },
    etd: ETD, // '2022/03/27 21:45', // ETD
    routeing_condition: {
      type: selectedKey.value,
      laden: String(ladSpeed.value),
      ballast: String(balSpeed.value)
    },
    cost: {
      hire: parseFloat(100),
      ifo: parseFloat(200),
      lsdogo: parseFloat(300)
    },
    port_rotation: []
  }

  // Create port rotation
  const portCodes = []
  let portDetail = {}
  for (let i = 0; i < plans.value.length; i++) {
    const tmpPort = plans.value[i].port
    const portCode = tmpPort.split(' / ')
    portCodes.push(portCode[2])

    // validation
    if (portCode === '' || portCode === undefined) {
      console.log('ports is missing.')
      return false
    }
  }

  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_port_info.cgi?client=' + client.value + '&port_codes=' + JSON.stringify(portCodes)
  const resp = await fetch(urlSetting)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    portDetail = data.data
  }

  for (let i = 0; i < portCodes.length; i++) {
    const tmpDetail = portDetail[portCodes[i]]

    const tmpJSON = {
      portcode: tmpDetail.AREA,
      portname: tmpDetail.ENAME,
      country: tmpDetail.CNTRY,
      point: {
        lat: tmpDetail.LATD,
        lon: tmpDetail.LOND,
        name: tmpDetail.ENAME,
        timezone: tmpDetail.TZ,
        country: tmpDetail.CNTRY
      },
      passage_days: '',
      time_window: true,
      target_eta: {
        from: '',
        to: ''
      },
      timezone: tmpDetail.TZ,
      passage_portcode: ''
    }

    // Validation
    if (plans.value[i].lb === '' || plans.value[i].lb === undefined) {
      console.log('loading condition is missing.')
      return false
    }

    if (i < portCodes.length - 1) {
      tmpJSON.loading_condition = plans.value[i + 1].lb
    }

    param.PLAN.port_rotation.push(tmpJSON)
  }
  console.log(param)

  // const url = 'https://tmax.seapln-osr.pt-aws.wni.com/T-Max/TonnageAllocation/api/okamaw-test.cgi'
  const url = 'https://tmax-b01.weathernews.com/T-Max/TonnageAllocation/api/reborn_get_result_analysis_for_tonnageAllocation.cgi'
  const simType = 'plan'
  const body1 = [simType, client.value, JSON.stringify(param)]
  const simJson = await fetch(url, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body1)
  })
    .then(res => res.json())
    .catch(console.error)

  console.log(simJson)
  if (simJson.result === 'OK') {
    simDatas.value = simJson.data.PLAN.leg_infos
  }

  console.log(simDatas.value)
  return false
}

const simClearEventHandler = (item) => {
  console.log('simulation clear')
  /*
  const vesSimLayer = props.vesselsimLayer.content
  vesSimLayer.simRoutes = {
    type: 'FeatureCollection',
    features: []
  }
  table.rows = [{ id: 1, name: 'aaa' }, { id: 2, name: 'aaa' }]
  tableCheckedRows = []
  // props.vesselsimLayer.content.arrPort === ''
  // props.vesselsimLayer.content.depPort === ''
  vesSimLayer.map.getSource(`${vesSimLayer.source}simVoycom`).setData(vesSimLayer.simRoutes)
  // props.vesselsimLayer.content.clearSimulationHandler()
  */
  return false
}

const tableRowsClearEventHandler = () => {
  console.log('table raw clear')
  /*
  const tmpary = []
  for (let i = 0; i < table.rows.length; i++) {
    tmpary.push(String(table.rows[i].id))
  }
  console.log(tableCheckedRows)
  const newary = tmpary.filter(i => tableCheckedRows.indexOf(i) == -1)
  console.log(tmpary)
  console.log(tableCheckedRows)
  console.log(newary)
  for (let i = 0; i < newary.length; i++) {
    // remove rows from table
    for (let j = 0; j < table.rows.length; j++) {
      if (String(table.rows[j].id) === newary[i]) {
        table.rows.splice(j, 1)
        // delete table.rows[j]
      }
    }
    // remover routes from map
    const vesSimLayer = props.vesselsimLayer.content
    const features = vesSimLayer.simRoutes.features
    for (let j = 0; j < features.length; j++) {
      if (String(features[j].properties.routeid) === newary[i]) {
        features.splice(j, 1)
      }
    }
    vesSimLayer.map.getSource(`${vesSimLayer.source}simVoycom`).setData(vesSimLayer.simRoutes)
  }
  // tableCheckedRows = []
  // const newTableRows = _.cloneDeep(table.rows)
  // table.rows = []
  // table.rows = newTableRows

  //for (let j=0; j<table.rows.length; j++){
  //  table.rows[j].id = ++maxId
  //}

  updateCheckedRows(tableCheckedRows)
  console.log(table.rows)
  console.log(tableCheckedRows)
  */
  return false
}

</script>

<style scoped>
.dtp {
  width: 200px;
}
.allpane {
  display: grid;
  height: 100%;
  grid-template-rows: 30% 20% 50%;
  grid-template-columns: 55% 45%;
}

.inputpane {
  grid-row: 1/3;
  grid-column: 1;
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
  line-height: 15px;
  font-size: 14px;
  overflow: scroll;
}

.head{
  font-size: 20px;
  font-family: Arial;
}

.basic-info{
  display: flex;
  font-size: 12px;
}

.spd-info{
  display: flex;
  font-size: 12px;
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

.voy-plan table{
  font-size: 12px;
}

.voy-plan tr, td {
  border: solid 1px;
  padding: 5px;
}

.simbtn {
  font-size: 12px;
  border: none;
}

.mappane {
  grid-row: 1;
  grid-column: 2;
}

.tablepane {
  grid-row: 2/4;
  grid-column: 2;
  background-color: #fffaf0;
  padding: 20px;
  overflow: scroll;
  /* overflow-x: scroll; */
}
.simpane {
  grid-row: 3;
  grid-column: 1;
  background-color: #f0fff0;
  padding: 20px;
  overflow: auto;
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
<style>
.simple-typeahead > input {
  /* position: relative; */
  font: 14px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica;
  padding: 5px;
  min-width: 170px;
  height: 30px;
  border-radius: 5px;
  font: 14px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica,
    sans-serif;
  border: solid 1px;
  border-color: #aaa;
  background-color: #eee;
}
.simple-typeahead .simple-typeahead-list {
  background-color: #ddd;
  min-width: 170px;
  width: 170px;
  border: none;
  max-height: 400px;
  overflow-y: auto;
  border: 0.1rem solid #d1d1d1; /* border: 0.1rem solid #d1d1d1;*/
  z-index: 9;
}
.simple-typeahead .simple-typeahead-list .simple-typeahead-list-item {
  font: 12px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica;
  height: 25px;
  cursor: pointer;
  background-color: #fafafa;
  padding: 0.3rem 0.3rem; /*padding: 0.6rem 1rem;*/
  border-top: 0.1rem solid #d1d1d1;
  border-bottom: 0.1rem solid #d1d1d1;
  border-left: 0.1rem solid #d1d1d1;
  border-right: 0.1rem solid #d1d1d1;
}
.simple-typeahead
  .simple-typeahead-list
  .simple-typeahead-list-item.simple-typeahead-list-item-active {
  background-color: #e1e1e1;
  z-index: 9;
}
</style>
