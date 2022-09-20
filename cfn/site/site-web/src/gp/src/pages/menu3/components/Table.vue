<template>
  <div class="tableplane">
    <EasyDataTable
      v-model:items-selected="itemsSelected"
      :theme-color="blue"
      :dense="true"
      :loading="loadingState"
      :fixed-header="true"

      :headers="headers"
      :items="items"
      :rows-per-page="5"
    hide-footer
      table-class-name="customize-table"
    />
    <!--div>{{ itemsSelected }}</div-->
    <div v-if="ytdReady">
      <button
        class="simbtn"
        @click="addVoyageEstimate"
      >
        Add Voyage Estimate
      </button>&nbsp; <b class="errmsg">{{ msg }}</b>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, toRefs } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import calcCO2 from './calcCO2_tap.js'
import calcCII from '../../calcCII.js'
import getYtdData from '../../getYtdData.js'
import { blue } from 'color-name'

// Error message
const msg = ref('')
const ytdReady = ref(false)
const loadingState = ref(false)
let YTD = {}

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  simDatas: { type: Object, default: () => {} },
  loading: { type: Boolean, dafault: false }
})

// Events, new data
const { simDatas, loading } = toRefs(props)
watch(simDatas, (newValue) => {
  console.log('Table create Handler')
  console.log(newValue)
  createTable(props.simDatas)
}, { deep: true })

watch(loading, (newValue) => {
  console.log('LOADING CHANGE')
  loadingState.value = newValue
})

// Emits
const emits = defineEmits(['tableRouteSelected', 'newVoyageData'])
/*
const clickRow = (item) => {
  console.log(item.id)
  // emits('tableVesselSelected', item.imo)
}
*/

// Create Table
const headers = ref([])
const items = ref([])
const itemsSelected = ref([])

// table action
watch(itemsSelected, (newValue) => {
  console.log(newValue)
  emits('tableRouteSelected', newValue)
}, { deep: true })

const createTable = async (simDatas) => {
  console.log('create table')
  console.log(simDatas)
  items.value.length = 0
  itemsSelected.value.length = 0
  ytdReady.value = false
  const imoNumber = simDatas.imo_no
  const inPortFoc = simDatas.inPortFoc
  const inPortDaysLast = simDatas.inPortDaysLast

  let k = 0
  for (let i = 0; i < simDatas.data.length; i++) {
    console.log(i)
    console.log(simDatas.data[i])
    const legInfo = simDatas.data[i]
    const routeInfos = simDatas.data[i].route_infos

    for (let j = 0; j < routeInfos.length; j++) {
      const tmpRaw = {
        leg: i + 1,
        id: legInfo.leg_id + '-' + routeInfos[j].route_id,
        legId: legInfo.leg_id,
        routeId: routeInfos[j].route_id,
        dep: legInfo.departure.portcode,
        arr: legInfo.arrival.portcode,
        lb: legInfo.loading_condition,
        eta: (routeInfos[j].simulation_result.eta).slice(5, 16),
        days: Math.round(parseFloat(routeInfos[j].simulation_result.at_sea_days) * 10) / 10,
        inportDays: Math.round(parseFloat(routeInfos[j].simulation_result.in_port_days) * 10) / 10,
        dist: (Math.round(parseFloat(routeInfos[j].simulation_result.distance))).toLocaleString(),
        co2: '',
        cii: '-',
        co2Total: '',
        ciiTotal: '-',
        hsfo: Math.round(parseFloat(routeInfos[j].simulation_result.hsfo) * 10) / 10,
        dogo: Math.round(parseFloat(routeInfos[j].simulation_result.lsdogo) * 10) / 10,
        inportFoc: Math.round(routeInfos[j].simulation_result.in_port_days * inPortFoc * 10) / 10,
        wxfact: routeInfos[j].simulation_result.weather_factor,
        curfact: routeInfos[j].simulation_result.current_factor
        // hire_cost: (Math.round(Number(latest.ordered_dogo) * 10) / 10).toFixed(1),
      }

      if (i === simDatas.data.length - 1) {
        tmpRaw.inportDays = Math.round((routeInfos[j].simulation_result.in_port_days + inPortDaysLast) * 10) / 10
        tmpRaw.inportFoc = Math.round((routeInfos[j].simulation_result.in_port_days + inPortDaysLast) * inPortFoc * 10) / 10
      }
      items.value.push(tmpRaw)
      k++

      // CO2計算
      const simResult = routeInfos[j].simulation_result
      const arrObj = await calcCO2(simResult, imoNumber, 'tapData')

      // in portでのCO2排出量(DOGOとして計算する)
      let inPortCO2 = inPortFoc * 3.206 * simResult.in_port_days
      if (i === simDatas.data.length - 1) {
        inPortCO2 = inPortFoc * 3.206 * (simResult.in_port_days + inPortDaysLast)
      }
      console.log(inPortCO2)
      // index = 1にin portを加えた要素として追加
      arrObj[1] = {
        co2: arrObj[0].co2 + inPortCO2,
        distance: arrObj[0].distance,
        imoNumber: arrObj[0].imoNumber
      }

      console.log(arrObj)

      // CII計算
      let apiResult = []
      if (arrObj[0].distance && arrObj[0].co2 && arrObj[0].imoNumber) {
        apiResult = await calcCII(arrObj)
        console.log('kkk=' + k)
        items.value[k - 1].co2 = apiResult.length > 0 ? (Math.round(parseFloat(apiResult[0].co2))).toLocaleString() : ''
        items.value[k - 1].cii = apiResult.length > 0 ? `${apiResult[0].cii_rank}(${(Math.round(apiResult[0].cii * 100) / 100).toLocaleString()})` : ''
        items.value[k - 1].co2Total = apiResult[1] ? (Math.round(parseFloat(apiResult[1].co2))).toLocaleString() : ''
        items.value[k - 1].ciiTotal = apiResult[1] ? `${apiResult[1].cii_rank}(${(Math.round(apiResult[1].cii * 100) / 100).toLocaleString()})` : ''
      }
      console.log(apiResult)
    }
  }

  // YTDの取得
  const getYTDParam = {
    client_code: simDatas.clientCode,
    imo_no: [Number(imoNumber)]
  }
  console.log(getYTDParam)
  const ytdDatas = await getYtdData(getYTDParam)
  console.log(ytdDatas)

  const ytdParam = {
    hsfo: ytdDatas[0].ytd_cons.grand_total_hfo,
    lsfo: ytdDatas[0].ytd_cons.grand_total_lfo,
    lsdogo: ytdDatas[0].ytd_cons.grand_total_dogo,
    distance: ytdDatas[0].ytd_dist_depart_arr
  }
  console.log(ytdParam)
  const ytdCO2 = await calcCO2(ytdParam, imoNumber, 'ytdData')
  console.log(ytdCO2)
  YTD = ytdCO2[0]
  ytdReady.value = true
}

// Table headers
headers.value = [
  { text: 'LEG', value: 'leg', width: 40, fixed: true },
  { text: 'DEP', value: 'dep', width: 50, fixed: true },
  { text: 'ARR', value: 'arr', width: 50, fixed: true },
  { text: 'L/B', value: 'lb', width: 50 },
  { text: 'ETA(LT)', value: 'eta', width: 100 },
  { text: 'Sea days', value: 'days', width: 60 },
  { text: 'Port days', value: 'inportDays', width: 60 },
  { text: 'Dist.[nm]', value: 'dist', width: 60 },
  { text: 'CO2 at sea', value: 'co2', width: 65 },
  { text: 'CII at sea', value: 'cii', width: 60 },
  { text: 'CO2 sea+port', value: 'co2Total', width: 80 },
  { text: 'CII sea+port', value: 'ciiTotal', width: 70 },
  { text: 'HSFO [mt]', value: 'hsfo', width: 60 },
  { text: 'DO/GO [mt]', value: 'dogo', width: 65 },
  { text: 'In port [mt]', value: 'inportFoc', width: 65 },
  { text: 'Weather factor', value: 'wxfact', width: 60 },
  { text: 'Current factor', value: 'curfact', width: 60 }
  // { text: 'EDIT', value: 'operation', width: 50 }
]

const addVoyageEstimate = async () => {
  msg.value = ''
  const voyageInfo = {}
  console.log(props.simDatas)

  for (let i = 0; i < props.simDatas.data.length; i++) {
    console.log(i)
    console.log(props.simDatas.data[i])
    const legInfo = props.simDatas.data[i]
    voyageInfo[legInfo.leg_id] = false
  }
  const imoNumber = props.simDatas.imo_no
  const ytdDist = YTD.distance
  const ytdCO2 = YTD.co2
  console.log(voyageInfo)

  // Validation
  // no legs selected
  if (itemsSelected.value.length === 0) {
    msg.value = 'No leg is selected.'
    return false
  }
  // duplicated legs
  for (let i = 0; i < itemsSelected.value.length; i++) {
    const legid = itemsSelected.value[i].legId
    if (voyageInfo[legid] === false) {
      voyageInfo[legid] = true
    } else {
      msg.value = 'There is a duplicate leg.'
      return false
    }
  }

  for (const legid in voyageInfo) {
    if (voyageInfo[legid] === false) {
      msg.value = 'There is a missing leg.'
      return false
    }
  }

  // Add all columns
  let totalDays = 0
  let totalIFO = 0
  let totalLSDOGO = 0
  let totalInportDays = 0
  let totalCO2 = 0
  let totalDist = 0
  // include in port consumption
  let totalInportFoc = 0
  let totalCO2Total = 0
  for (let i = 0; i < itemsSelected.value.length; i++) {
    totalDays = itemsSelected.value[i].days + totalDays
    totalIFO = itemsSelected.value[i].hsfo + totalIFO
    totalLSDOGO = itemsSelected.value[i].dogo + totalLSDOGO
    totalInportDays = itemsSelected.value[i].inportDays + totalInportDays
    totalCO2 = parseFloat(itemsSelected.value[i].co2.replace(/,/g, '')) + totalCO2
    totalDist = parseFloat(itemsSelected.value[i].dist.replace(/,/g, '')) + totalDist
    totalInportFoc = itemsSelected.value[i].inportFoc + totalInportFoc
    totalCO2Total = parseFloat(itemsSelected.value[i].co2Total.replace(/,/g, '')) + totalCO2Total
  }

  const totalCIIParam = [
    {
      distance: totalDist,
      co2: totalCO2,
      imoNumber
    },
    {
      distance: totalDist,
      co2: totalCO2Total,
      imoNumber
    },
    {
      distance: totalDist + ytdDist,
      co2: totalCO2Total + ytdCO2,
      imoNumber
    }
  ]
  console.log(totalCIIParam)
  // VOYAGE ESTIMATE CII計算
  let totalCIIRes = []
  console.log(totalCIIParam[0])
  if (totalCIIParam[0].distance && totalCIIParam[0].co2 && totalCIIParam[0].imoNumber) {
    totalCIIRes = await calcCII(totalCIIParam)
  }
  console.log(totalCIIRes)

  const voyageData = {
    total_days: totalDays,
    total_ifo: totalIFO,
    total_lsdogo: totalLSDOGO,
    total_inport_days: totalInportDays,
    total_co2: totalCIIRes[0].co2,
    total_cii_rank: totalCIIRes[0].cii_rank,
    total_cii: totalCIIRes[0].cii,
    total_inport_foc: totalInportFoc,
    total_co2_total: totalCIIRes[1].co2,
    total_cii_rank_total: totalCIIRes[1].cii_rank,
    total_cii_total: totalCIIRes[1].cii,
    ytd_co2: totalCIIRes[2].co2,
    ytd_cii_rank: totalCIIRes[2].cii_rank,
    ytd_cii: totalCIIRes[2].cii
  }

  console.log('EMIT to MENU3')
  console.log(voyageData)
  emits('newVoyageData', voyageData)
}

</script>

<style scoped>
.tableplane {
  /* width: 100%; */
  /* height: 30vh; */
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
  --easy-table-header-height: 32px;
  --easy-table-header-background-color: #ccc;
  --easy-table-body-row-height: 24px;
}

button {
  background-color: #4CAF50;
  font-size: 12px;
  color: white;
  padding: 2px 5px;
  /* margin: 3px 0; */
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.errmsg{
  font-size: 18px;
  color: red;
}
</style>
