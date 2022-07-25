<template>
  <div
    id="app"
    class="allpane"
  >
    <div class="inputpane">
      <font size="5">
        <b>SIMULATION INPUT</b>
      </font><br><br>

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
              :value="speed.item"
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

      <b>VOYAGE PLAN</b>
      <div class="voy-plan">
        <table>
          <thead>
            <tr>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Port days</th>
              <th>Laden/Ballast</th>
              <th>Target ETA</th>
              <th>Add/Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for=" (plan, index) in plans"
              :key="plan.dep"
            >
              <td>
                <select v-model="plan.dep">
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
              <td>
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
              </td>
              <td><input v-model="plan.port_days"></td>
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
              <td><input v-model="plan.eta"></td>

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
          CO2 simulation
        </button>&nbsp;
        <button
          class="simbtn"
          @click="simClearEventHandler"
        >
          CLEAR ALL
        </button><br><br>
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
      <font size="5">
        <b>SIMULATION RESULT</b><br>
      </font>
    </div>

    <div class="mappane">
      <Map
        v-if="authorized"
        :customer-id="customerId"
        :sim-datas="simDatas"
        :config="config.value"
        :path-params="pathParams"
        :map-focus-vessel="mapFocusVessel"
        :token="token"
      />
    </div>

    <div class="tablepane">
      <VTable
        v-if="authorized"
        :customer-id="customerId"
        :sim-datas="simDatas"
        @table-vessel-selected="tableVesselSelected"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { loadMapConfig } from '../../scripts/mapConfig.js'
import Map from './components/Map.vue'
import VTable from './components/VTable.vue'
import { useAuth } from '../../plugins/auth'
// import SimpleTypeAhead from 'vue3-simple-typeahead'

// Common parameters
const { getUser, getToken } = useAuth()
const customerId = ref('')
const authorized = ref(false)
const config = reactive({})
const pathParams = ref({ shopName: 'vp' })
const mapFocusVessel = ref('')
const token = ref('')

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
const plans = ref([{
  dep: '',
  arr: '',
  port_days: 0,
  lb: 'L',
  eta: ''
}])
const options = reactive([
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

// Simulation result
const simDatas = []
// const simData = ref({})

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
  // console.log(pathParams.value)
  authorized.value = true
  // console.log(authorized.value)

  // getVesselList()
  getPortList()
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

  if (client.value === '') {
    return false
  }

  // client.value = 'RIO'
  // const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_setting_for_enrouterisk.cgi?client=' + client.value
  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_vessel_list.cgi?client=' + client.value + '&search_type=menu_id&val=Tonnage'
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

// Get port list
const getPortList = async () => {
  console.log('getPortList')
  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_port_list.cgi?client=' + client.value
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
  /*
  if (props.vesselsimLayer.content.arrPort === '' || props.vesselsimLayer.content.depPort === '') {
    console.log('Arr and/or Dep ports are missing.')
    return false
  }

  // console.log(props.vesselsimLayer.content.depPort)
  // console.log(props.vesselsimLayer.content.arrPort)
  const vesSimLayer = props.vesselsimLayer.content
  const dep = vesSimLayer.portList[vesSimLayer.depPort].code
  const arr = vesSimLayer.portList[vesSimLayer.arrPort].code
  const depLat = vesSimLayer.portList[vesSimLayer.depPort].lat
  const depLon = vesSimLayer.portList[vesSimLayer.depPort].lon
  const arrLat = vesSimLayer.portList[vesSimLayer.arrPort].lat
  const arrLon = vesSimLayer.portList[vesSimLayer.arrPort].lon
  console.log(dep, arr)
  console.log(selectedKey.value.id, ladSpeed.value, balSpeed.value)
  console.log(hireCost.value, ifoCost.value, lsdogoCost.value)
  console.log(etd.value, lorb.value)
  */

  for (let i = 0; i < plans.value.length; i++) {
    simulateLeg()
  }

  /* conversion to GeoJSON along with the Greater Circle
  vesSimLayer.tapResult = simJson
  const tapRoutes = simJson.data['plan-c'].leg_infos
  console.log(tapRoutes)

  const tmpRows = table.rows.filter(function (item) {
    return item.name !== 'aaa'
  })
  table.rows = tmpRows
  for (let i = 0; i < tapRoutes.length; i++) {
    // const route = tapRoutes[i].route_infos[0].waypoints
    const routes = tapRoutes[i].route_infos
    for (let j = 0; j < routes.length; j++) {
      const route = tapRoutes[i].route_infos[j].waypoints
      const latlon = []
      for (let k = 0; k < route.length; k++) {
        const tmplatlon = [route[k].lon, route[k].lat]
        latlon.push(tmplatlon)
      }
      convertCross180Coordinates(latlon)
      let tmpDist = 0
      for (let k = 0; k < latlon.length - 1; k++) {
        const from = point(latlon[k])
        const to = point(latlon[k + 1])
        const options = { units: 'kilometers' }
        const dist = distance(from, to, options)
        tmpDist = tmpDist + dist
      }
      console.log(tmpDist)
      const arc = []
      const tmpLine = lineString(latlon)
      for (let k = 0; k < tmpDist; k += 100) { // 200km/6hours
        const options = { units: 'kilometers' }
        const segment = along(tmpLine, k, options)
        arc.push(segment.geometry.coordinates)
      }

      const simResult = tapRoutes[i].route_infos[j].simulation_result
      const tmpRoute = {
        geometry: {
          coordinates: arc,
          type: 'LineString'
        },
        type: 'Feature',
        properties: {
          // 'routetype': String(i*routes.length+j+1),
          // 'routeid': String(i*routes.length+j+1),
          routetype: String(++maxId),
          routeid: String(maxId),
          vessel_type: '',
          ETA: simResult.eta,
          ETD: simResult.etd,
          distance: simResult.distance, // shortestDist*0.539956803
          hsfo: simResult.hsfo,
          lsdogo: simResult.lsdogo,
          current_f: simResult.current_factor,
          weather_f: simResult.weather_factor
        }
      }
      const tmpRow = {
        // id: i*routes.length+j+1,
        id: maxId,
        dep,
        arr,
        lorb: lorb.value,
        speed: spd,
        eta: simResult.eta,
        days: Math.round(simResult.at_sea_days * 10) / 10,
        dist: Math.round(simResult.distance),
        cost: Math.round(simResult.cost.total),
        fuel: Math.round(simResult.hsfo + simResult.lsdogo),
        co2: '--',
        cii: '--'
      }
      table.rows.push(tmpRow)
      vesSimLayer.simRoutes.features.push(tmpRoute)
      console.log(maxId)
    }
  }
  // maxId = maxId + routes.length*tapRoutes.length

  console.log(vesSimLayer.simRoutes)
  // vesSimLayer.simRoutes = simRoutes
  vesSimLayer.map.getSource(`${vesSimLayer.source}simVoycom`).setData(vesSimLayer.simRoutes)
  */
  return false
}

const simulateLeg = async () => {
  const url = 'https://tmax.seapln-osr.pt-aws.wni.com/T-Max/TonnageAllocation/api/okamaw-test.cgi'
  const simType = 'plan'
  const lad = ladSpeed.value
  const bal = balSpeed.value
  let spd = ''
  if (lorb.value === 'L') {
    if (selectedKey.value.id === 'speed') {
      spd = lad + 'kts'
    } else if (selectedKey.value.id === 'rpm') {
      spd = lad + 'rpm'
    } else if (selectedKey.value.id === 'mcr') {
      spd = lad + '%'
    }
  } else if (lorb.value === 'B') {
    if (selectedKey.value.id === 'speed') {
      spd = bal + 'kts'
    } else if (selectedKey.value.id === 'rpm') {
      spd = bal + 'rpm'
    } else if (selectedKey.value.id === 'mcr') {
      spd = bal + '%'
    }
  }
  console.log(spd)

  const param = {
    'plan-c': {
      name: 'Plan C',
      ship_info: {
        wnishipnum: '28607',
        shipname: 'BAK',
        callsign: 'WNIDEMO28',
        imo_num: '28028028028',
        shiptype: 'TANKER',
        dwt: {
          min: '156929',
          max: '156929'
        }
      },
      etd: '2022/06/27 21:45', // ETD
      routeing_condition: {
        type: selectedKey.value.item,
        laden: String(ladSpeed.value),
        ballast: String(balSpeed.value)
      },
      cost: {
        hire: parseFloat(hireCost.value),
        ifo: parseFloat(ifoCost.value),
        lsdogo: parseFloat(lsdogoCost.value)
      },
      port_rotation: [
        {
          portcode: dep,
          portname: vesSimLayer.depPort,
          country: 'JP',
          point: {
            lat: depLat,
            lon: depLon,
            name: vesSimLayer.depPort,
            timezone: 'Asia/Tokyo',
            country: 'JP'
          },
          loading_condition: lorb.value, // LADEN/BALLAST
          port_days: '0',
          passage_days: '',
          time_window: true,
          target_eta: {
            from: '',
            to: ''
          },
          timezone: 'Asia/Tokyo',
          passage_portcode: ''
        },
        {
          portcode: arr,
          portname: vesSimLayer.arrPort,
          country: 'CA',
          point: {
            lat: arrLat,
            lon: arrLon,
            name: vesSimLayer.arrPort,
            timezone: 'America/Vancouver',
            country: 'CA'
          },
          passage_days: '',
          time_window: true,
          target_eta: {
            from: '',
            to: ''
          },
          timezone: 'America/Vancouver',
          passage_portcode: ''
        }
      ]
    }
  }

  const body1 = [simType, JSON.stringify(param)]

  const simJson = await fetch(url, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body1)
  })
    .then(res => res.json())
    .catch(console.error)

  console.log(simJson)
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
}</style>
