<template>
  <div class="tableplane">
    <EasyDataTable
      dense
      height="100%"
      header-background-color="#ddd"
      :fixed-header="true"
      table-height="250"
      rows-per-page="500"
      :rows-items="[500,1000,1500]"
      :loading="loadingState"
      :headers="headers"
      :items="items"
      table-class-name="customize-table"
      header-class-name="customize-table-header"
      @click-row="clickRow"
    >
      <template #item-vesselName="{vesselName, bgcolor}">
        <div :style="bgcolor">
          <b>{{ vesselName }}</b>
        </div>
      </template>
      <template #item-riskSpd="{riskSpd, riskSpdLevel}">
        <div class="risk-wrapper">
          <img
            class="risk"
            :src="riskSpdLevel"
            alt=""
          >{{ riskSpd }}
        </div>
      </template>
      <template #item-riskRpm="{riskRpm, riskRpmLevel}">
        <div class="risk-wrapper">
          <img
            class="risk"
            :src="riskRpmLevel"
            alt=""
          >{{ riskRpm }}
        </div>
      </template>
      <template #item-riskFoc="{riskFoc, riskFocLevel}">
        <div class="risk-wrapper">
          <img
            class="risk"
            :src="riskFocLevel"
            alt=""
          >{{ riskFoc }}
        </div>
      </template>
      <template #item-operation="item">
        <div class="operation-wrapper">
          <!--img
            src="../images/delete.png"
            class="operation-icon"
            @click="deleteItem(item)"
          -->
          <img
            src="../images/edit.png"
            class="operation-icon"
            @click="editItem(item)"
          >
        </div>
      </template>
    </EasyDataTable>
    <div
      v-if="isEditing"
      class="edit-item"
    >
      height:<input
        v-model="editingItem.height"
        type="text"
      >
      <br>
      weight:<input
        v-model="editingItem.weight"
        type="text"
      >
      <br>
      <button @click="submitEdit">
        ok
      </button>
    </div>
    <div>{{ itemsSelected }}</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineProps, watch, toRefs } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import { point } from '@turf/helpers'
import distance from '@turf/distance'
import calcCO2 from './calcCO2_errm.js'
import calcCII from '../../calcCII.js'
import getYtdData from '../../getYtdData.js'

const loadingState = ref(false)

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  errmVessels: { type: Object, default: () => { } },
  tableFocusVessel: { type: String, default: '' },
  load: { type: Boolean, dafault: false }
})

const { customerId, errmVessels, tableFocusVessel, load } = toRefs(props)

watch(errmVessels, (newValue) => {
  console.log('Table draw Handler')
  console.log(newValue)
  console.log(customerId.value)
  createTable(newValue)
}, { deep: true })

watch(tableFocusVessel, (newValue) => {
  console.log('FOCUS VESSEL on TABLE')
  console.log(newValue)
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[i].imo === newValue) {
      items.value[i].bgcolor = 'background-color: #0ff'
      const newItem = items.value[i]
      items.value.splice(i, 1)
      items.value.unshift(newItem)
    } else {
      items.value[i].bgcolor = 'background-color: transparent'
    }
  }
})

watch(load, (newValue) => {
  console.log('LOADING CHANGE')
  loadingState.value = newValue
})

// Emits
const emits = defineEmits(['tableVesselSelected'])
const clickRow = (item) => {
  items.value.sort((a, b) => b.riskScore - a.riskScore)
  console.log(item.imo)
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[i].imo === item.imo) {
      items.value[i].bgcolor = 'background-color: #0ff'
    } else {
      items.value[i].bgcolor = 'background-color: transparent'
    }
  }
  emits('tableVesselSelected', item.imo)
}

// Create Table
const headers = ref([])
const items = ref([])
const itemsSelected = ref([])
const isEditing = ref(false)
const editingItem = reactive({
  height: '',
  weight: 0,
  id: 0
})
const deleteItem = (val) => {
  items.value = items.value.filter((item) => item.id !== val.id)
}
const editItem = (val) => {
  isEditing.value = true
  const { height, weight, id } = val
  editingItem.height = height
  editingItem.weight = weight
  editingItem.id = id
}
const submitEdit = () => {
  isEditing.value = false
  const item = items.value.find((item) => item.id === editingItem.id)
  item.height = editingItem.height
  item.weight = editingItem.weight
}

const formatNumber = (number) => {
  let value = '-'
  if (number !== '' && number != null) {
    value = (Math.round(Number(number) * 10) / 10).toFixed(1)
  }
  return value
}

const calcEnvIndex = async (arrObj, items, errmVessel) => {
  console.log('calcEnvIndex')
  let apiResult = []
  console.log(arrObj[0])
  if (arrObj[0].distance && arrObj[0].co2 && arrObj[0].imoNumber) {
    apiResult = await calcCII(arrObj)
  }

  const item = items.value.filter((elem) => {
    return (elem.imo === errmVessel.imo_num)
  })

  if (item.length === 1) {
    const ciiValue = String(Math.round(apiResult[0].cii * 100) / 100)
    item[0].co2 = apiResult.length > 0 ? (Math.round(Number(apiResult[0].co2))).toLocaleString() : ''
    item[0].cii = apiResult.length > 0 ? apiResult[0].cii_rank + '(' + ciiValue + ')' : ''
    console.log(apiResult)
    console.log(item)
  }
}

const createTable = async (errmVessels) => {
  console.log('create table')
  console.log(errmVessels)
  items.value.length = 0

  for (let i = 0; i < errmVessels.length; i++) {
    const latest = errmVessels[i].latest
    // console.log(latest.vessel_name)

    // Check alert
    const riskSpdLevel = checkSpdAlert(errmVessels[i])
    const riskRpmLevel = checkRpmAlert(errmVessels[i])
    const riskFocLevel = checkFocAlert(errmVessels[i])
    const riskSpdScore = checkRiskScore(riskSpdLevel)
    const riskRpmScore = checkRiskScore(riskRpmLevel)
    const riskFocScore = checkRiskScore(riskFocLevel)
    const totalRiskScore = riskSpdScore + riskRpmScore + riskFocScore

    /*
    const imoNumber = errmVessels[i].imo_num

    // ERRMデータからCO2排出量を算出(graph_data)
    const graphData = errmVessels[i].graph_data
    const arrObj = await calcCO2(graphData, imoNumber)

    // 距離計算 turf
    const wayPoints = errmVessels[i].past_waypoint
    let totalDistance = 0.0
    for (let i = 0; i < wayPoints.length - 1; i++) {
      const from = point([parseFloat(wayPoints[i].lon), parseFloat(wayPoints[i].lat)])
      const to = point([parseFloat(wayPoints[i + 1].lon), parseFloat(wayPoints[i + 1].lat)])
      const options = { units: 'kilometers' }
      totalDistance += distance(from, to, options)
      totalDistance = totalDistance / 1.852
    }
    arrObj[0].distance = totalDistance

    // CII計算
    let apiResult = []
    console.log(arrObj[0])
    if (arrObj[0].distance && arrObj[0].co2 && arrObj[0].imoNumber) {
      apiResult = await calcCII(arrObj)
    }
    */

    const tmpRaw = {
      id: i,
      vesselName: latest.vessel_name,
      imo: errmVessels[i].imo_num,
      service_type: latest.service_type,
      riskSpd: '',
      riskSpdLevel,
      riskRpm: '',
      riskRpmLevel,
      riskFoc: '',
      riskFocLevel,
      riskScore: totalRiskScore,
      laden_ballast: latest.loading_condition,
      priority: latest.voyage_priority,
      departure_port: latest.dep_port,
      atd: (latest.dep_time_utc).slice(5, 16).replace('/', '-').replace('T', ' '),
      arrival_port: latest.arr_port,
      eta: (latest.arr_time_utc).slice(5, 16).replace('/', '-').replace('T', ' '),
      rta: (latest.req_arr_time_utc).slice(5, 16).replace('/', '-').replace('T', ' '),
      speed: formatNumber(latest.average_speed),
      ordered_speed: formatNumber(latest.ordered_speed),
      rpm: formatNumber(latest.average_rpm),
      suggested_rpm: formatNumber(latest.suggested_rpm),
      total_foc: formatNumber(latest.total_foc),
      ordered_foc: formatNumber(latest.ordered_foc),
      total_dogo: formatNumber(latest.total_dogo),
      ordered_dogo: formatNumber(latest.ordered_dogo),
      cii: '-',
      co2: '',
      ciiYtd: '-',
      co2Ytd: '',
      bgcolor: 'background-color: transparent'
    }
    items.value.push(tmpRaw)
  }
  items.value.sort((a, b) => b.riskScore - a.riskScore)
  console.log(items.value)

  const ciiArr = []
  for (let i = 0; i < errmVessels.length; i++) {
    const imoNumber = errmVessels[i].imo_num

    // 距離計算 turf
    const wayPoints = errmVessels[i].past_waypoint
    let totalDistance = 0.0
    for (let i = 0; i < wayPoints.length - 1; i++) {
      const from = point([parseFloat(wayPoints[i].lon) / 60, parseFloat(wayPoints[i].lat) / 60])
      const to = point([parseFloat(wayPoints[i + 1].lon) / 60, parseFloat(wayPoints[i + 1].lat) / 60])
      const options = { units: 'kilometers' }
      totalDistance += distance(from, to, options) / 1.852
      // totalDistance = totalDistance / 1.852
    }

    // past_waypoint配列の最後のtimeを取得
    console.log(wayPoints)
    let lastRepTime = ''
    // past_waypointが空の場合がある
    if (wayPoints.length > 0) {
      lastRepTime = wayPoints[wayPoints.length - 1].info.time
    }

    // ERRMデータからCO2排出量を算出(graph_data)
    const graphData = errmVessels[i].graph_data
    console.log(graphData)
    console.log(`vessel_name: ${errmVessels[i].latest.vessel_name} / lastRepTime: ${lastRepTime} / totalDistance: ${totalDistance}`)
    const arrObj = await calcCO2(graphData, imoNumber, lastRepTime, totalDistance)
    console.log(arrObj)
    ciiArr.push(arrObj[0])

    // CII計算処理
    calcEnvIndex(arrObj, items, errmVessels[i])
  }

  console.log(ciiArr)

  // Get YTD data
  const ytdPost = { client_code: props.customerId, imo_no: [] }
  for (let i = 0; i < items.value.length; i++) {
    ytdPost.imo_no.push(Number(items.value[i].imo))
  }
  const ciiYtdResp = await getYtdData(ytdPost)
  console.log(ciiYtdResp)

  const ytdData = {}
  const totalCIIPost = []
  for (let i = 0; i < ciiYtdResp.length; i++) {
    if (ciiYtdResp[i].ytd_dist_depart_arr === 0) { continue }
    const imo = ciiYtdResp[i].imoNumber
    const co2Total =
      ciiYtdResp[i].ytd_cons.grand_total_dogo * 3.206 +
      ciiYtdResp[i].ytd_cons.grand_total_hfo * 3.114 +
      ciiYtdResp[i].ytd_cons.grand_total_lfo * 3.151
    const ciiData = ciiArr.find((item) => item.imoNumber === String(imo))
    console.log(ciiData)
    const tmpDict = {
      co2: co2Total + ciiData.co2,
      distance: ciiYtdResp[i].ytd_dist_depart_arr + ciiData.distance,
      imoNumber: imo
    }
    ytdData[imo] = tmpDict
    totalCIIPost.push(tmpDict)
  }
  console.log(totalCIIPost)
  const ciiTotalResp = await calcCII(totalCIIPost)
  console.log(ciiTotalResp)

  const totalData = {}
  for (let i = 0; i < ciiTotalResp.length; i++) {
    totalData[ciiTotalResp[i].imoNumber] = {
      co2: ciiTotalResp[i].co2,
      cii: Math.round(ciiTotalResp[i].cii * 100) / 100,
      cii_rank: ciiTotalResp[i].cii_rank,
      distance: ciiTotalResp[i].distance
    }
  }
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[i].imo in totalData) {
      items.value[i].ciiYtd = totalData[items.value[i].imo].cii_rank + '(' + String(totalData[items.value[i].imo].cii) + ')'
      items.value[i].co2Ytd = Math.round(totalData[items.value[i].imo].co2).toLocaleString()
    }
  }
}

const checkSpdAlert = (vessel) => {
  const avgSpd = vessel.latest.average_speed
  const ordSpd = vessel.latest.ordered_speed
  const tolSpd = vessel.tolerance_range.speed
  if (avgSpd === '' || avgSpd === null || ordSpd === '' || ordSpd === null || tolSpd === '' || tolSpd === null) {
    return './images/white.png'
  }
  const spd = Number(vessel.latest.average_speed)
  const orderSpd = Number(vessel.latest.ordered_speed)
  const toleSpd = Number(vessel.tolerance_range.speed)
  if (orderSpd > 0 && toleSpd > 0) {
    if (spd < orderSpd - toleSpd) {
      return './images/red.png'
    } else if (spd < orderSpd && spd >= orderSpd - toleSpd) {
      return './images/yellow.png'
    } else {
      return './images/white.png'
    }
  } else {
    return './images/white.png'
  }
}

const checkFocAlert = (vessel) => {
  const totFoc = vessel.latest.total_foc
  const ordFoc = vessel.latest.ordered_foc
  const tolFoc = vessel.tolerance_range.consumption
  if (totFoc === '' || totFoc === null || ordFoc === '' || ordFoc === null || tolFoc === '' || tolFoc === null) {
    return './images/white.png'
  }
  const foc = Number(vessel.latest.total_foc)
  const orderFoc = Number(vessel.latest.ordered_foc)
  const toleFoc = Number(vessel.tolerance_range.consumption)
  if (orderFoc > 0 && toleFoc > 0) {
    if (foc > orderFoc + toleFoc) {
      return './images/red.png'
    } else if (foc > orderFoc && foc <= orderFoc + toleFoc) {
      return './images/yellow.png'
    } else {
      return './images/white.png'
    }
  } else {
    return './images/white.png'
  }
}

const checkRpmAlert = (vessel) => {
  const avgRpm = vessel.latest.average_rpm
  const ordRpm = vessel.latest.suggested_rpm
  const tolRpm = vessel.tolerance_range.rpm
  if (avgRpm === '' || avgRpm === null || ordRpm === '' || ordRpm === null || tolRpm === '' || tolRpm === null) {
    return './images/white.png'
  }
  const rpm = Number(vessel.latest.average_rpm)
  const orderRpm = Number(vessel.latest.suggested_rpm)
  const toleRpm = Number(vessel.tolerance_range.rpm)
  if (orderRpm > 0 && toleRpm > 0) {
    if (rpm > orderRpm + toleRpm || rpm < orderRpm - toleRpm) {
      return './images/red.png'
    } else if ((rpm > orderRpm && rpm <= orderRpm + toleRpm) || (rpm < orderRpm && rpm >= orderRpm - toleRpm)) {
      return './images/yellow.png'
    } else {
      return './images/white.png'
    }
  } else {
    return './images/white.png'
  }
}

const checkRiskScore = (item) => {
  if (item === './images/red.png') {
    return 10
  } else if (item === './images/yellow.png') {
    return 1
  } else {
    return 0
  }
}

// Table headers
headers.value = [
  { text: 'Vessel name', value: 'vesselName', fixed: true, sortable: true, width: 100 },
  { text: 'Service', value: 'service_type', fixed: true, sortable: true, width: 60 },
  { text: 'Spd', value: 'riskSpd', fixed: true, width: 50 },
  { text: 'RPM', value: 'riskRpm', fixed: true, width: 50 },
  { text: 'FOC', value: 'riskFoc', fixed: true, width: 50 },
  { text: 'L/B', value: 'laden_ballast', width: 30 },
  { text: 'Priority', value: 'priority', width: 110 },
  { text: 'Dep. port', value: 'departure_port', width: 100 },
  { text: 'ATD[UTC]', value: 'atd', sortable: true, width: 95 },
  { text: 'Arr. port', value: 'arrival_port', width: 100 },
  { text: 'ETA[UTC]', value: 'eta', width: 95 },
  { text: 'RTA[UTC]', value: 'rta', width: 95 },
  { text: 'CO2 at sea', value: 'co2', sortable: true, width: 75 },
  { text: 'CII　　at sea', value: 'cii', sortable: true, width: 75 },
  { text: 'CO2 YtD', value: 'co2Ytd', sortable: true, width: 50 },
  { text: 'CII YtD', value: 'ciiYtd', sortable: true, width: 60 },
  { text: 'Spd [kts]', value: 'speed', width: 50 },
  { text: 'Spd target', value: 'ordered_speed', sortable: true, width: 50 },
  { text: 'RPM', value: 'rpm', width: 50 },
  { text: 'RPM target', value: 'suggested_rpm', width: 50 },
  { text: 'FOC [mt]', value: 'total_foc', width: 50 },
  { text: 'FOC target', value: 'ordered_foc', sortable: true, width: 50 },
  { text: 'DO/GO [mt]', value: 'total_dogo', width: 50 },
  { text: 'DO/GO target', value: 'ordered_dogo', sortable: true, width: 50 }// ,
  // { text: 'Edit', value: 'operation', width: 50 }
]

</script>

<style>
.tableplane {
  width: 100%;
  height: 300px;
  /* overflow: scroll; */
}

.operation-wrapper .operation-icon {
  width: 20px;
  cursor: pointer;
}

.risk-wrapper {
  padding: 3px;
  display: flex;
  align-items: center;
  justify-items: center;
}

.risk {
  margin-right: 10px;
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 10%);
}

.customize-table {
  --easy-table-header-font-size: 12px;
  --easy-table-header-height: 14px;
  --easy-table-header-background-color: #ccc;
}
</style>
