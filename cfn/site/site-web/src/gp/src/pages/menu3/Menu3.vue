<template>
  <div
    id="app"
    class="allpane"
  >


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
    <div class="inputpane">
      <div class="inputplane">
        <div class="head">
          <!-- <b>SIMULATION INPUT</b> -->
        </div>

        <b>Vessel info</b>
        <div class="basic-info">
          <div class="basic-info-box">
            &nbsp; Vessel name: <br>&nbsp;
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
        </div>

        <b>Simulation parameter</b>
        <div class="spd-info">
          <!-- form novalidate @submit.prevent="onSubmit"-->
          <div class="spd-info-box">
            &nbsp; Speed/rpm/%MCR: <br>
            &nbsp;
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
        </div>

        <b>In port FOC setting</b>
        <div class="spd-info">
          <!-- form novalidate @submit.prevent="onSubmit"-->
          <div class="spd-info-box">
            &nbsp; In port daily FOC:<br>
            &nbsp;
            <input
              v-model="inPortFoc"
              style="text-align:right"
              type="number"
            >
            &nbsp; [MT/day]
          </div>
        </div>
      </div>
    </div>

    <div class="voyplanpane">
      <b>Voyage plan</b>
      <div class="voy-plan">
        <div class="voy-plan-box">
          <table>
            <thead>
              <tr>
                <th>Port</th>
                <th>Laden/Ballast</th>
                <th>{{ selectedKey }} to next port</th>
                <th>In port days</th>
                <th>Up/Down</th>
                <th>ADD/DEL</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for=" (plan, index) in plans"
                :key="plan.port"
              >
                <td>
                  <select v-model="plan.port">
                    <option
                      disalbled
                      value=""
                    />
                    <option
                      v-for="port in portList"
                      :key="port"
                      :value="port"
                    >
                      {{ port }}
                    </option>
                  </select>
                </td>
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
                <td>
                  <input
                    v-model="plan.speed"
                    style="text-align:right"
                    type="number"
                  >
                </td>
                <td>
                  <input
                    v-model="plan.port_days"
                    style="text-align:right"
                    type="number"
                  >
                </td>
                <td>
                  <button
                    type="submit"
                    @click="upRaw(index)"
                  >
                    Up
                  </button>&nbsp;
                  <button
                    type="submit"
                    @click="downRaw(index)"
                  >
                    Down
                  </button>
                </td>
                <td>
                  <button
                    type="submit"
                    @click="addRaw(index)"
                  >
                    ADD
                  </button>&nbsp;
                  <button
                    type="submit"
                    @click="delRaw(index)"
                  >
                    DEL
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="voy-plan-box">
          ETD (LT):&nbsp;
          <div class="dtp">
            <Datepicker
              v-model="date"
              :utc="false"
            />
          </div>
        </div><br>
      </div>

      <div class="simbtn-pane">
        <button
          class="simbtn"
          @click="simStartEventHandler"
        >
          Simulation
        </button>&nbsp; <b class="errmsg">{{ msg }}</b>
      </div>
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



    <div class="tablepane">
      <div class="head">
        <b>SIMULATION RESULT</b><br>
      </div>
      <Table
        v-if="authorized"
        :customer-id="customerId"
        :sim-datas="simDatas"
        :loading="loading"
        @table-route-selected="tableRouteSelected"
        @new-voyage-data="newVoyageData"
      />
    </div>

    <div
      v-show="showPerf"
      class="perfpane"
    >
      <PerfChart
        :selected-vessel="selectedVessel"
        :customer-id="customerId"
      />
    </div>

    <div class="vtablepane">
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


<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
// import VueElementLoading from 'vue-element-loading'
import { loadMapConfig } from '../../scripts/mapConfig.js'
import Map from './components/Map.vue'
import Table from './components/Table.vue'
import VTable from './components/VTable.vue'
import PerfChart from './components/PerfChart.vue'
import { useAuth } from '../../plugins/auth'
// import SimpleTypeAhead from 'vue3-simple-typeahead'
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
const mapFocusRoute = ref('')
const token = ref('')
const date = ref()
const msg = ref('')
const loading = ref(false)
const showPerf = ref(false)

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

// Simulation input - basic info
const client = ref('')
const vesselList = ref([])
const portList = ref([])
const selectedVessel = ref('')
const inPortFoc = ref(0)

// Simulation input - speed info
const speeds = reactive([
  { id: 0, item: 'SELECT', key: '---', unit: '' },
  { id: 1, item: 'speed [kts]', key: 'speed', unit: 'kts' },
  { id: 2, item: 'RPM [rpm]', key: 'rpm', unit: 'rpm' },
  { id: 3, item: '%MCR [%]', key: 'mcr', unit: '%' }
])
const selectedKey = ref('---')
const ladSpeed = ref(0)
const balSpeed = ref(0)

// Simulation input - voyage plans
const plans = ref([
  { port: '', port_days: 0, speed: 0, lb: 'L', eta: '' },
  { port: '', port_days: 0, speed: 0, lb: 'B', eta: '' }
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
  plans.value.splice(index + 1, 0, { port: '', port_days: 0, speed: 0, lb: 'B', eta: '' })
  plans.value[plans.value.length - 1].port_days = 0
  plans.value[plans.value.length - 1].lb = 'B'
}
const delRaw = (index) => {
  console.log('del button')
  console.log('index')
  plans.value.splice(index, 1)
  plans.value[plans.value.length - 1].port_days = 0
  plans.value[plans.value.length - 1].lb = 'B'
}

const upRaw = (index) => {
  if (index > 0) {
    plans.value.splice(index - 1, 2, plans.value[index], plans.value[index - 1])
  }
  console.log(plans.value)
}

const downRaw = (index) => {
  if (index < plans.value.length - 1) {
    plans.value.splice(index, 2, plans.value[index + 1], plans.value[index])
  }
  console.log(plans.value)
}

// Simulation result (Table)
const simDatas = ref({ data: [] })
// const simData = ref({})

// Voyage evaluation sheet (VTable)
const voyageData = ref({})

// Watch
watch(selectedVessel, (newValue) => {
  console.log('WATCH')
  if (newValue !== '') {
    showPerf.value = true
  } else {
    showPerf.value = false
  }
})

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

  getVesselList()
  getPortList()

  gtagOptin() // gtag.js ?????????????????????????????????????????????????????????????????????????????????????????????????????????
  // GA4????????????
  gtagSet('user_id', user.email)
  gtagSet('user_properties', { login_id: user.email, customer_id: user.customer_ids?.[0] })
  // UA????????????
  gtagCustomMap('dimension1', 'login_id')
  gtagCustomMap('dimension2', 'customer_id')
  gtagEvent('custom_dimension', { login_id: user.email, customer_id: user.customer_ids?.[0] })
  // pageview??????
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
  console.log(selectedVessel.value)
  console.log(date.value)
  console.log(inPortFoc.value)
  msg.value = ''

  // validation
  if (selectedVessel.value === '') {
    console.log('Vessel name is missing.')
    msg.value = 'Input vessel name.'
    return false
  }
  if (date.value === undefined || date.value === null) {
    console.log('ETD is missing.')
    msg.value = 'Input ETD(LT).'
    return false
  }
  if (inPortFoc.value === undefined || inPortFoc.value === null || inPortFoc.value === 0) {
    console.log('In port FOC is missing.')
    msg.value = 'Input in-port-FOC.'
    return false
  }

  const dt = new Date(date.value)
  console.log(dt.toISOString())
  const Y = dt.getFullYear()
  const M = dt.getMonth()
  const D = dt.getDate()
  const h = dt.getHours()
  const m = dt.getMinutes()

  const ETD = String(Y) + '/' + String(M + 1) + '/' + String(D) + ' ' + String(h) + ':' + String(m)
  console.log(ETD)

  simDatas.value.data.length = 0

  // Create port rotation
  const portCodes = []
  let portDetail = {}
  for (let i = 0; i < plans.value.length; i++) {
    const tmpPort = plans.value[i].port
    console.log(tmpPort)

    // validation
    if (tmpPort === '' || tmpPort === undefined) {
      console.log('ports is missing.')
      msg.value = ('Input port name.')
      return false
    }

    const portCode = tmpPort.split(' / ')
    portCodes.push(portCode[2])
  }

  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_port_info.cgi?client=' + client.value + '&port_codes=' + JSON.stringify(portCodes)
  const resp = await fetch(urlSetting)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    portDetail = data.data
  }

  const legInfos = []
  let nextETD = ETD
  for (let i = 0; i < plans.value.length - 1; i++) {
    // validation
    if (selectedKey.value === '---' || plans.value[i].speed === 0) {
      console.log('Speed Unit and/or SPD to next port is missing.')
      msg.value = 'Input Speed unit or SPD to next port.'
      return false
    }

    // Create POST data
    const param = {}
    param.PLAN = {
      name: 'plan',
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
      etd: nextETD,
      routeing_condition: {
        type: selectedKey.value,
        laden: String(plans.value[i].speed),
        ballast: String(plans.value[i].speed)
      },
      cost: {
        hire: parseFloat(100),
        ifo: parseFloat(200),
        lsdogo: parseFloat(300)
      },
      port_rotation: []
    }

    // Set dep and arr port for i-th leg
    for (let j = 0; j < 2; j++) {
      const tmpDetail = portDetail[portCodes[i + j]]

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

      // Insert loading condition and port days excluding the final port
      if (i < portCodes.length - 1) {
        // Validation
        console.log(plans.value[i + j].lb)
        if (plans.value[i + j].lb !== 'L' && plans.value[i + j].lb !== 'B') {
          console.log('loading condition is missing.')
          msg.value = 'Input Laden or Ballast'
          return false
        }

        console.log(plans.value[i + j].port_days)
        if (plans.value[i + j].port_days === '') {
          console.log('invalid port days.')
          msg.value = 'Input correct port days'
          return false
        }

        tmpJSON.loading_condition = plans.value[i + j].lb
        tmpJSON.port_days = plans.value[i + j].port_days
      }

      param.PLAN.port_rotation.push(tmpJSON)
    }
    // }
    console.log(param)

    loading.value = true
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
      simJson.data.PLAN.leg_infos[0].leg_id = 'leg-' + String(i)
      legInfos.push(simJson.data.PLAN.leg_infos[0])
    }
    loading.value = false

    nextETD = simJson.data.PLAN.leg_infos[0].route_infos[0].simulation_result.eta
  }

  const tmpSimDatas = { data: [] }
  tmpSimDatas.data = legInfos
  tmpSimDatas.imo_no = selectedVessel.value.imo_num
  tmpSimDatas.inPortFoc = inPortFoc.value
  tmpSimDatas.inPortDaysLast = plans.value[plans.value.length - 1].port_days
  tmpSimDatas.clientCode = client.value
  /*
  legInfos.imo_no = selectedVessel.value.imo_num
  legInfos.inPortFoc = inPortFoc.value
  legInfos.inPortDaysLast = plans.value[plans.value.length - 1].port_days
  legInfos.clientCode = client.value
  */
  simDatas.value = tmpSimDatas

  console.log(simDatas.value)
  return false

}



</script>

<style scoped>

/* page layout */
.allpane {
  display: grid;
  height: 30vh;
  grid-template-rows: 35% 25% 20% 15%;
  grid-template-columns: 15% 60% 25%;
}

.inputpane {
  grid-row: 2;
  grid-column: 1;
  border-radius: 5px;
  /* background-color: #f2f2f2; */
  padding: 20px;
  line-height: 15px;
  font-size: 14px;
  overflow: scroll;
}

.inputplane{
  width: 100%;
  height: 2vh;
  /* overflow: scroll; */
}

.voyplanpane{
  grid-row: 2;
  grid-column: 2/3;
  border-radius: 5px;
  /* background-color: #f2f2f2; */
  padding: 20px;
  line-height: 15px;
  font-size: 14px;
  overflow: scroll;
}

.mappane {
  grid-row: 1;
  grid-column: 1/4;
}

.tablepane {
  grid-row: 3;
  grid-column: 1/4;
  /* background-color: #f0fff0; */
  padding: 20px;
  overflow: scroll;
}

.perfpane {
  /* display: flex;  <comentario original> */
  grid-row: 2;
  grid-column: 3;
  /* background-color: #f2f2f2; */
  padding: 5px;
  /* justify-content: center; <comentario original>*/
  /* align-items: center; <comentario original>*/
  overflow: hidden;
  /* overflow-x: scroll; <comentario original>*/
}

.vtablepane {
  grid-row: 4;
  grid-column: 1;
  background-color: #fffaf0;
  padding: 20px;
  overflow: scroll;
  /* overflow-x: scroll; <comentario original>*/
}

/* component style */

.dtp {
  width: 200px;
  font-size: 12pt;
}

.head{
  font-size: 18px;
  /* font-family: Arial; */
  margin-bottom: 10px;
}

.errmsg{
  font-size: 18px;
  color: red;
}

.basic-info{
  /* display: flex; */
  font-size: 12px;
  margin-bottom: 10px;
}

.spd-info{
  /* display: flex; */
  font-size: 12px;
  margin-bottom: 10px;
}

.spd-info input{
  /* border: 2px solid blue; */
  width: 100px;
  /* margin-top: 5px; */
  margin-bottom: 10px;
}

input {
  /* border: 2px solid blue; */
  width: 100px;
  margin-bottom: 10px;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

select {
  /* border: 2px solid blue; */
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

.voy-plan{
  display: flex;
}

.voy-plan-box{
  margin-left: 10px;
  font-size: 14px;
}

.voy-plan table{
  font-size: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
}

.voy-plan tr, td {
  border: solid 1px;
  padding-left: 3px;
  padding-right: 3px;
}

.voy-plan select{
  /* border: 2px solid blue; */
  width: 100px;
}

.voy-plan input {
  /* border: 2px solid blue; */
  width: 85px;
}

.voy-plan button {
  /* background-color: #4CAF50; */
  color: white;
  /* padding: 2px 5px; */
  /* margin: 1px 0; */
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.simbtn {
  font-size: 12px;
  border: none;
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
.mapboxgl-ctrl {
  display: none;
}
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
  background-color: rgb(146, 16, 16);
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
