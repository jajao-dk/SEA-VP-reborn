<script setup>
import { reactive, ref, defineProps, watch } from 'vue'
import SimpleTypeAhead from 'vue3-simple-typeahead'
import TableLite from 'vue3-table-lite'
import { convertCross180Coordinates } from '../Layers/Util'
import distance from '@turf/distance'
import along from '@turf/along'
import { point, lineString, featureCollection } from '@turf/helpers'

const props = defineProps({
  vesselsimLayer: Object
})

let maxId = 0
let tableCheckedRows = []
const vesselList = ref([])
const portList = ref([])
const rpm =ref('')
const ladParam = ref('')
const balParam = ref('')
const hireCost = ref('')
const ifoCost = ref('')
const lsdogoCost = ref('')
const selectedKey=ref({id:0, item: '--SELECT--', id: '--', unit: ""})
const selectedItem=ref('')
const selectedUnit=ref('')
const etd=ref('2022/06/26 0:15')
const lorb=ref('L')
const items = reactive([
  {id:0, item: '--SELECT--', id: "", unit: ""},
  {id:1, item: 'speed', id: "speed", unit: "kts"},
  {id:2, item: 'rpm', id: "rpm", unit: "rpm"},
  {id:3, item: '%MCR', id: "mcr", unit: "%"}
])
const options = reactive([
  {text: 'Laden', value: 'L'},
  {text: 'Ballast', value: 'B'}
])

const table = reactive({
  isLoading: false,
  isReSearch: false,
  columns: [
    {label: "ID", field: "id", width: "5%", isKey: true},
    {label: "Dep.", field: "dep", width: "8%"},
    {label: "Arr.", field: "arr", width: "8%"},
    {label: "L/B", field: "lorb", width: "8%"},
    {label: "Speed", field: "speed", width: "8%"},
    {label: "ETA", field: "eta", width: "12%"},
    {label: "Days", field: "days", width: "8%"},
    {label: "Distance", field: "dist", width: "8%"},
    {label: "Cost[$]", field: "cost", width: "8%"},
    {label: "Fuel", field: "fuel", width: "8%"},
    {label: "CO2", field: "co2", width: "8%"},
    {label: "CII", field: "cii", width: "8%"},
  ],
  rows: [{id: 1, name: "aaa"}, {id: 2, name: "aaa"}],
  totalRecordCount: 2,
  sortable: {
    order: "id",
    sort: "asc",
  },
  messages: {
    pagingInfo: "",
    pageSizeChangeLabel: "Rows: ",
    gotoPageLabel: "  Page:",
    noDataAvailable: "No data",
  },
})

//table.rows = [{id: 1, name: "takao"},{id: 2, name: "yukiko"},{id:3, name: "naoko"}]

const doSearch = (offset, limit, order, sort) => {
  table.isLoading = true
  table.isReSearch = offset == undefined ? true : false
  // do your search event to get newRows and new Total
  table.rows = newRows
  table.totalRecordCount = newTotal
  table.sortable.order = order
  table.sortable.sort = sort
}

const tableLoadingFinish = (elements) => {
  table.isLoading = false;
  Array.prototype.forEach.call(elements, function (element) {
    if (element.classList.contains("name-btn")) {
      element.addEventListener("click", function () {
        // do your click event
        console.log(this.dataset.id + " name-btn click!!")
      })
    }
    if (element.classList.contains("quick-btn")) {
      // do your click event
      element.addEventListener("click", function () {
        console.log(this.dataset.id + " quick-btn click!!")
      })
    }
  })
}

const updateCheckedRows = (rowsKey) => {
  // do your checkbox click event
  console.log(rowsKey)
  tableCheckedRows = rowsKey
  props.vesselsimLayer.content.routeColoring(rowsKey)
}


const unwatch = watch(
  () => props.vesselsimLayer.content,
  (newValue) => {
    if (newValue.event) {
      props.vesselsimLayer.content.event.addEventListener('vesselList', (e) => {
        vesselList.value = e.detail.data
      })
      props.vesselsimLayer.content.event.addEventListener('portList', (e) => {
        portList.value = e.detail.data
      })
      unwatch()
    }
  }
)

const vesselSelectItemEventHandler = (item) => {
  console.log('selected vessel:' + item)
  props.vesselsimLayer.content.selectedVessel = item
  // props.vesselsimLayer.content.searchVessel(item)
  return false
}

const depSelectItemEventHandler = (item) => {
  console.log('departure port:' + item)
  props.vesselsimLayer.content.depPort = item
  // props.vesselsimLayer.content.searchVessel(item)
  return false
}

const arrSelectItemEventHandler = (item) => {
  console.log('arrival port:' + item)
  props.vesselsimLayer.content.arrPort = item
  // props.vesselsimLayer.content.searchVessel(item)
  return false
}

const simStratEventHandler = async (item) => {
  console.log('simulation start')
  if (props.vesselsimLayer.content.arrPort === '' || props.vesselsimLayer.content.depPort === ''){
    console.log('Arr and/or Dep ports are missing.')
    return false
  }

  console.log(props.vesselsimLayer.content.depPort)
  console.log(props.vesselsimLayer.content.arrPort)
  const vesSimLayer = props.vesselsimLayer.content
  const dep = vesSimLayer.portList[vesSimLayer.depPort]['code']
  const arr = vesSimLayer.portList[vesSimLayer.arrPort]['code']
  const depLat = vesSimLayer.portList[vesSimLayer.depPort]['lat']
  const depLon = vesSimLayer.portList[vesSimLayer.depPort]['lon']
  const arrLat = vesSimLayer.portList[vesSimLayer.arrPort]['lat']
  const arrLon = vesSimLayer.portList[vesSimLayer.arrPort]['lon']
  console.log(dep, arr)
  console.log(selectedKey.value.id, ladParam.value, balParam.value)
  console.log(hireCost.value, ifoCost.value, lsdogoCost.value)
  console.log(etd.value, lorb.value)

  const url = "https://tmax.seapln-osr.pt-aws.wni.com/T-Max/TonnageAllocation/api/okamaw-test.cgi"
  const simType = "plan"
  const lad = ladParam.value
  const bal = balParam.value
  let spd = ''
  if (lorb.value === 'L'){
    if (selectedKey.value.id === 'speed'){
      spd = lad+'kts'
    } else if (selectedKey.value.id === 'rpm'){
      spd = lad+'rpm'
    } else if (selectedKey.value.id === 'mcr'){
      spd = lad+'%'
    }
  } else if (lorb.value === 'B'){
    if (selectedKey.value.id === 'speed'){
      spd = bal+'kts'
    } else if (selectedKey.value.id === 'rpm'){
      spd = bal+'rpm'
    } else if (selectedKey.value.id === 'mcr'){
      spd = bal+'%'
    }
  }
  console.log(spd)

  const param = {
    "plan-c": { 
      "name": "Plan C",
      "ship_info": {
        "wnishipnum": "28607",
        "shipname": "BAK",
        "callsign": "WNIDEMO28",
        "imo_num": "28028028028",
        "shiptype": "TANKER",
        "dwt": {
          "min": "156929",
          "max": "156929"
        }
      },
      "etd": "2022/06/27 21:45", // ETD
      "routeing_condition": {
        "type": selectedKey.value.item,
        "laden": String(ladParam.value),
        "ballast": String(balParam.value)
      },
      "cost": {
        "hire": parseFloat(hireCost.value),
        "ifo": parseFloat(ifoCost.value),
        "lsdogo": parseFloat(lsdogoCost.value)
      },
      "port_rotation": [
        {
          "portcode": dep,
          "portname": vesSimLayer.depPort,
          "country": "JP",
          "point": {
            "lat": depLat,
            "lon": depLon,
            "name": vesSimLayer.depPort,
            "timezone": "Asia/Tokyo",
            "country": "JP"
          },
          "loading_condition": lorb.value, // LADEN/BALLAST
          "port_days": "0",
          "passage_days": "",
          "time_window": true,
          "target_eta": {
            "from": "",
            "to": ""
          },
          "timezone": "Asia/Tokyo",
          "passage_portcode": ""
        },
        {
          "portcode": arr,
          "portname": vesSimLayer.arrPort,
          "country": "CA",
          "point": {
            "lat": arrLat,
            "lon": arrLon,
            "name": vesSimLayer.arrPort,
            "timezone": "America/Vancouver",
            "country": "CA"
          },
          "passage_days": "",
          "time_window": true,
          "target_eta": {
            "from": "",
            "to": ""
          },
          "timezone": "America/Vancouver",
          "passage_portcode": ""
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

  vesSimLayer.tapResult = simJson
  const tapRoutes = simJson["data"]["plan-c"]["leg_infos"]
  console.log(tapRoutes)

  let tmpRows = table.rows.filter(function(item){
    return item.name !== 'aaa'
  })
  table.rows=tmpRows
  for (let i=0; i<tapRoutes.length; i++){
    
    // const route = tapRoutes[i].route_infos[0].waypoints
    const routes = tapRoutes[i].route_infos
    for (let j=0; j<routes.length; j++){
      const route = tapRoutes[i].route_infos[j].waypoints
      let latlon = []
      for (let k=0; k<route.length; k++){
        const tmplatlon = [route[k].lon, route[k].lat]
        latlon.push(tmplatlon)
      }
      convertCross180Coordinates(latlon)
      let tmpDist = 0
      for (let k=0; k<latlon.length-1; k++){
        const from = point(latlon[k])
        const to = point(latlon[k+1])
        const options = {units: 'kilometers'}
        const dist = distance(from, to, options)
        tmpDist = tmpDist + dist
      }
      console.log(tmpDist)
      let arc = []
      const tmpLine = lineString(latlon)
      for (let k = 0; k < tmpDist; k += 100) { // 200km/6hours
        const options = {units: 'kilometers'}
        const segment = along(tmpLine, k, options)
        arc.push(segment.geometry.coordinates)
      }

      const simResult = tapRoutes[i].route_infos[j].simulation_result
      const tmpRoute = {
        'geometry': {
          'coordinates': arc,
          'type': 'LineString'
        },
        'type': 'Feature',
        'properties': {
          //'routetype': String(i*routes.length+j+1),
          //'routeid': String(i*routes.length+j+1),
          'routetype': String(++maxId),
          'routeid': String(maxId),
          'vessel_type': '',
          'ETA': simResult.eta,
          'ETD': simResult.etd,
          'distance': simResult.distance, // shortestDist*0.539956803
          'hsfo': simResult.hsfo,
          'lsdogo': simResult.lsdogo,
          'current_f': simResult.current_factor,
          'weather_f': simResult.weather_factor,
        }
      }
      let tmpRow={
        //id: i*routes.length+j+1,
        id: maxId,
        dep: dep,
        arr: arr,
        lorb: lorb.value,
        speed: spd,
        eta: simResult.eta,
        days: Math.round(simResult.at_sea_days*10)/10,
        dist: Math.round(simResult.distance),
        cost: Math.round(simResult.cost.total),
        fuel: Math.round(simResult.hsfo+simResult.lsdogo),
        co2: "--",
        cii: "--",
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
  return false
}

const simClearEventHandler = (item) => {
  console.log('simulation clear')
  const vesSimLayer = props.vesselsimLayer.content
  vesSimLayer.simRoutes = {
    'type': 'FeatureCollection',
    'features': []
  }
  table.rows = [{id: 1, name: "aaa"}, {id: 2, name: "aaa"}]
  tableCheckedRows = []
  //props.vesselsimLayer.content.arrPort === '' 
  //props.vesselsimLayer.content.depPort === ''
  vesSimLayer.map.getSource(`${vesSimLayer.source}simVoycom`).setData(vesSimLayer.simRoutes)
  //props.vesselsimLayer.content.clearSimulationHandler()
  return false
}

const tableRowsClearEventHandler = () => {
  console.log('table raw clear')
  let tmpary = []
  for (let i=0; i<table.rows.length; i++){
    tmpary.push(String(table.rows[i].id))
  }
  console.log(tableCheckedRows)
  let newary = tmpary.filter(i=>tableCheckedRows.indexOf(i)==-1)
  console.log(tmpary)
  console.log(tableCheckedRows)
  console.log(newary)
  for (let i=0; i<newary.length; i++){
    // remove rows from table
    for (let j=0; j<table.rows.length; j++){
      if (String(table.rows[j].id) === newary[i]){
        table.rows.splice(j,1)
        // delete table.rows[j]
      }
    }
    // remover routes from map
    const vesSimLayer = props.vesselsimLayer.content
    let features = vesSimLayer.simRoutes.features
    for (let j=0; j<features.length; j++){
      if (String(features[j].properties.routeid) === newary[i]){
        features.splice(j,1)
      }
    }
    vesSimLayer.map.getSource(`${vesSimLayer.source}simVoycom`).setData(vesSimLayer.simRoutes)
  }
  // tableCheckedRows = []
  //const newTableRows = _.cloneDeep(table.rows)
  //table.rows = []
  //table.rows = newTableRows
  /*
  for (let j=0; j<table.rows.length; j++){
    table.rows[j].id = ++maxId
  }
  */
  updateCheckedRows(tableCheckedRows)
  console.log(table.rows)
  console.log(tableCheckedRows)
  return false
}

const perfEventHandler = async (item) => {
  console.log("performance evaluation")
  let input_json = {
      "callback": "jQuery111102871803774890178_1656298096526",
      "session_id": "",
      "fuel_consumption": "me",
      "loading_condition": "laden",
      "weather_level": [
          "fair",
          "moderate",
          "heavy",
          "severe"
      ],
      "analysis_interval": {
          "target": "speed",
          "interval": "0.5"
      },
      "setting": {
          "draft": {
              "fore": [
                  "",
                  ""
              ],
              "mid": [
                  "",
                  ""
              ],
              "aft": [
                  "",
                  ""
              ]
          },
          "output": [
              "",
              ""
          ],
          "displacement": [
              "",
              ""
          ],
          "deviation_range": "50",
          "report_type": "modified_wni",
          "availableWindCond": true,
          "availableWaveCond": true,
          "weather_condition": {
              "wind": {
                  "fair": "4",
                  "moderate": "5",
                  "heavy": "6"
              },
              "wave": {
                  "fair": "2",
                  "moderate": "3",
                  "heavy": "5"
              }
          }
      },
      "target": [
          {
              "wnishipnum": "21806",
              "vessel_name": "SHIP A",
              "callsign": "WNIDEMO1",
              "ship_type": "TANKER",
              "dwt": "46547",
              "periods": [
                  {
                      "type": "Last 12 months",
                      "event_name": "Last 12 months",
                      "from": "2021/06/29",
                      "to": "2022/06/28"
                  }
              ]
          }
      ],
      "_": 1656298096548
  }

  // const url = "https://tmax.seapln-osr.pt-aws.wni.com/T-Max/PerfEval/api/okamaw_test_get_perf_curve.cgi"
  const url = "https://tmax.seapln-osr.pt-aws.wni.com/T-Max/PerfEval/api/okamaw-test-3.cgi"
  // const url = "https://tmax.seapln-osr.pt-aws.wni.com/T-Max/PerfEval/api/get_result_analysis_for_perfEval.cgi"
  const body1 = ["test", JSON.stringify(input_json)]
  
  const simJson = await fetch(url, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body1)
  })
  .then(res => res.json())   
  .catch(console.error)

  console.log(simJson)


  return false
}

const selected = () => {
  const vesSimLayer = 
  // selectedItem = items[selectedKey]
  console.log (selectedKey.value)  
  for (let i=0; i<items.length; i++){
    if (selectedKey.value.item === items[i].item ){
      selectedUnit.value = items[i].unit
    }
  }
  console.log(selectedUnit.value)
}

</script>

<template>
  <div v-show="props.vesselsimLayer.visible" v-cloak>
    <div class="vessellist">
        <simple-type-ahead
          placeholder="Search vessels"
          :items="vesselList"
          :minInputLength="0"
          @selectItem="vesselSelectItemEventHandler"
        ></simple-type-ahead>
    </div>
    <div class="dep_portlist">
        <simple-type-ahead
          placeholder="Departure port"
          :items="portList"
          :minInputLength="0"
          @selectItem="depSelectItemEventHandler"
        ></simple-type-ahead>
    </div>
    <div class="arr_portlist">
        <simple-type-ahead
          placeholder="Arrival port"
          :items="portList"
          :minInputLength="0"
          @selectItem="arrSelectItemEventHandler"
        ></simple-type-ahead>
    </div>
    <div class="spdinput_parent">
      <!-- form novalidate @submit.prevent="onSubmit"-->
      <div class="spdinput_box">
        Speed/rpm/%MCR <br>
        <select class="spdinput" v-model="selectedKey" v-on:change="selected">
          <option v-for="item in items" :value="item" v-bind:key="item.id">
            {{ item.item }}
          </option>
        </select>
      </div>
      <div class="spdinput_box">
        Laden: <br>
        <input class="spdinput" type="text" v-model="ladParam" v-bind:placeholder="selectedUnit">
      </div>
      <div class="spdinput_box">
        Ballast: <br>
        <input class="spdinput" type="text" v-model="balParam" v-bind:placeholder="selectedUnit"><br><br>
      </div>
    </div>
    <div class="costinput_parent">
      <div class="costinput_box">
        Hire: <br>
        <input class="spdinput" type="text" v-model="hireCost" placeholder="USD">
      </div>
      <div class="costinput_box">
        IFO: <br>
        <input class="spdinput" type="text" v-model="ifoCost" placeholder="USD">
      </div>
      <div class="costinput_box">
        LSDOGO: <br>
        <input class="spdinput" type="text" v-model="lsdogoCost" placeholder="USD">
      </div>
    </div>
    <div class="voyinfoinput_parent">
      <div class="voyinfoinput_box">
        ETD (UTC): <br>
        <input class="ymdinput" type="text" v-model="etd" placeholder="2022/06/26 0:15">
      </div>
      <div class="voyinfoinput_box">
        Laden/Ballast <br>
        <select class="spdinput" v-model="lorb">
          <option v-for="option in options" :value="option.value">
            {{ option.text }}
          </option>
        </select>
      </div>
    </div>
    <div class="sim_parent">
      <div>
        <button class="simbtn" @click="simStratEventHandler">
          CO2 simulation
        </button><br><br>
      </div>
      <div>
        <button class="simbtn" @click="simClearEventHandler">
          CLEAR ALL
        </button><br><br>
      </div>
      <div>
        <button class="simbtn" @click="tableRowsClearEventHandler">
          CLEAR Rows
        </button>
      </div>
      <div>
        <button class="simbtn" @click="perfEventHandler">
          Performance
        </button>
      </div>
    </div>
    <div class='simtable'>
    <table-lite
        :has-checkbox="true"
        :is-loading="table.isLoading"
        :is-re-search="table.isReSearch"
        :columns="table.columns"
        :rows="table.rows"
        :total="table.totalRecordCount"
        :sortable="table.sortable"
        :messages="table.messages"
        @do-search="doSearch"
        @is-finished="tableLoadingFinish"
        @return-checked-rows="updateCheckedRows"
    ></table-lite>
    </div>
  </div>
</template>

<style scoped>
.simtable {
  /* position: relative; */
  font: 16px Arial, Helvetica;
  position: absolute;
  /* bottom: 20px; */
  /* left: 20px; */
  right: 0;
  left: 0%;
  bottom: 20px;
  /* margin: auto; */
  width: 60%;
  margin-left: auto;
  margin-right: auto;
  /* width: 700px; */
  /* display: inline-block; */ 
  z-index: 5;
}
.vessellist {
  position: absolute;
  top: 50px;
  right: 200px;
  width: 170px;
  height: 30px;
  z-index: 8;
}

.inline-block_parent{
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute; 
  bottom: 20px;
  right: 10px; 
  width: 30%;
  display: flex;
  z-index: 5;
}

.spdinput_parent{
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute; 
  top: 110px;
  right: 120px; 
  display: flex;
  z-index: 5;
}
.spdinput_parent .spdinput_box{
  font: 14px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica;
  color: white;
  margin-bottom: 30px;
  padding: 5px;
  box-sizing: border-box;
}

.costinput_parent{
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute; 
  top: 160px;
  right: 120px; 
  display: flex;
  z-index: 5;
}
.costinput_parent .costinput_box{
  font: 14px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica;
  color: white;
  margin-bottom: 30px;
  padding: 5px;
  box-sizing: border-box;
}

.voyinfoinput_parent{
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute; 
  top: 210px;
  right: 120px; 
  display: flex;
  z-index: 5;
}
.voyinfoinput_parent .voyinfoinput_box{
  font: 14px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica;
  color: white;
  margin-bottom: 30px;
  padding: 5px;
  box-sizing: border-box;
}

.dep_portlist {
  position: absolute;
  top: 250px;
  right: 200px;
  width: 170px;
  height: 30px;
  z-index: 7;
}
.arr_portlist {
  position: absolute;
  top: 280px;
  right: 200px;
  width: 170px;
  height: 30px;
  z-index: 6;
}

.sim_parent{
  margin: 0;
  padding: 0;
  list-style: none;
  position: absolute; 
  top: 280px;
  right: 100px; 
  z-index: 5;
}
.sim_parent .sim_box{
  font: 14px 'HelveticaNeue-CondensedBold', 'Helvetica Neue', Arial, Helvetica; 
  display: inline-block;
  margin-bottom: 30px;
  padding: 5px;
  box-sizing: border-box;
}
</style>
<style>
.simbtn {
  background-color: #aaa;
  color: #333;
  padding: 5px;
  font-size: 16px;
  width: 150px;
  border: solid 1px;
  border-color: #888;
  cursor: pointer;
  z-index: 5;
}
.simbtn:hover {
  background-color: #bbb;
}

.spdinput {
  background-color: #ddd;
  color: #333;
  padding: 5px;
  font-size: 16px;
  width: 100px;
  border: solid 1px;
  border-color: #888;
  cursor: pointer;
  z-index: 5;
}

.ymdinput {
  background-color: #ddd;
  color: #333;
  padding: 5px;
  font-size: 16px;
  width: 210px;
  border: solid 1px;
  border-color: #888;
  cursor: pointer;
  z-index: 5;
}

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
