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

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  errmVessels: { type: Object, default: () => { } },
  tableFocusVessel: { type: String, default: '' }
})

const { customerId, errmVessels, tableFocusVessel } = toRefs(props)

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
      atd: (latest.dep_time_utc).slice(5, 16),
      arrival_port: latest.arr_port,
      eta: (latest.arr_time_utc).slice(5, 16),
      rta: (latest.req_arr_time_utc).slice(5, 16),
      speed: (Math.round(Number(latest.average_speed) * 10) / 10).toFixed(1),
      ordered_speed: (Math.round(Number(latest.ordered_speed) * 10) / 10).toFixed(1),
      rpm: (Math.round(Number(latest.average_rpm) * 10) / 10).toFixed(1),
      suggested_rpm: (Math.round(Number(latest.suggested_rpm) * 10) / 10).toFixed(1),
      total_foc: (Math.round(Number(latest.total_foc) * 10) / 10).toFixed(1),
      ordered_foc: (Math.round(Number(latest.ordered_foc) * 10) / 10).toFixed(1),
      total_dogo: (Math.round(Number(latest.total_dogo) * 10) / 10).toFixed(1),
      ordered_dogo: (Math.round(Number(latest.ordered_dogo) * 10) / 10).toFixed(1),
      cii: apiResult.length > 0 ? apiResult[0].cii_rank : '',
      co2: apiResult.length > 0 ? apiResult[0].co2 : '',
      bgcolor: 'background-color: transparent'
    }
    items.value.push(tmpRaw)
  }
  items.value.sort((a, b) => b.riskScore - a.riskScore)
  console.log(items.value)
}

const checkSpdAlert = (vessel) => {
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
  { text: 'Vessel name', value: 'vesselName', fixed: true, width: 100 },
  { text: 'Service', value: 'service_type', fixed: true, width: 60 },
  { text: 'Spd', value: 'riskSpd', fixed: true, width: 50 },
  { text: 'RPM', value: 'riskRpm', fixed: true, width: 50 },
  { text: 'FOC', value: 'riskFoc', fixed: true, width: 50 },
  { text: 'L/B', value: 'laden_ballast', width: 30 },
  { text: 'Priority', value: 'priority', width: 110 },
  { text: 'ATD', value: 'atd', sortable: true, width: 95 },
  { text: 'Arrival port', value: 'arrival_port', width: 100 },
  { text: 'ETA', value: 'eta', width: 95 },
  { text: 'RTA', value: 'rta', width: 95 },
  { text: 'CO2', value: 'co2', width: 50 },
  { text: 'CII', value: 'cii', width: 50 },
  { text: 'Speed', value: 'speed', width: 50 },
  { text: 'target', value: 'ordered_speed', sortable: true, width: 50 },
  { text: 'RPM', value: 'rpm', width: 50 },
  { text: 'target', value: 'suggested_rpm', width: 50 },
  { text: 'FOC', value: 'total_foc', width: 50 },
  { text: 'target', value: 'ordered_foc', sortable: true, width: 50 },
  { text: 'DO/GO', value: 'total_dogo', width: 50 },
  { text: 'target', value: 'ordered_dogo', sortable: true, width: 50 },
  { text: 'Edit', value: 'operation', width: 50 }
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
</style>
