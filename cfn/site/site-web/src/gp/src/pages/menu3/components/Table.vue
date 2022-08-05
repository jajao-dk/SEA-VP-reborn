<template>
  <div class="tableplane">
    <EasyDataTable
      v-model:items-selected="itemsSelected"
      header-background-color="#ddd"
      dense
      :fixed-header="true"
      table-height="200"
      :headers="headers"
      :items="items"
      table-class-name="customize-table"
    />
    <!--div>{{ itemsSelected }}</div-->
    <button
      class="simbtn"
      @click="addVoyageEstimate"
    >
      Add Voyage Estimate
    </button>&nbsp; <b class="errmsg">{{ msg }}</b>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, toRefs } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import calcCO2 from './calcCO2_tap.js'
import calcCII from '../../calcCII.js'

// Error message
const msg = ref('')

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  simDatas: { type: Object, default: () => { } }
})

// Events, new data
const { simDatas } = toRefs(props)
watch(simDatas, (newValue) => {
  console.log('Table create Handler')
  console.log(newValue)
  createTable(props.simDatas)
}, { deep: true })

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
  const imoNumber = simDatas.imo_no

  for (let i = 0; i < simDatas.length; i++) {
    console.log(i)
    console.log(simDatas[i])
    const legInfo = simDatas[i]
    const routeInfos = simDatas[i].route_infos

    for (let j = 0; j < routeInfos.length; j++) {
      // CO2計算
      const simResult = routeInfos[j].simulation_result
      const arrObj = await calcCO2(simResult, imoNumber)

      // CII計算
      let apiResult = []
      console.log(arrObj[0])
      if (arrObj[0].distance && arrObj[0].co2 && arrObj[0].imoNumber) {
        apiResult = await calcCII(arrObj)
      }
      console.log(apiResult)

      const tmpRaw = {
        leg: i + 1,
        id: legInfo.leg_id + '-' + routeInfos[j].route_id,
        legId: legInfo.leg_id,
        routeId: routeInfos[j].route_id,
        dep: legInfo.departure.portcode,
        arr: legInfo.arrival.portcode,
        eta: routeInfos[j].simulation_result.eta,
        days: Math.round(parseFloat(routeInfos[j].simulation_result.at_sea_days) * 10) / 10,
        dist: Math.round(parseFloat(routeInfos[j].simulation_result.distance) * 10) / 10,
        co2: apiResult.length > 0 ? Math.round(parseFloat(apiResult[0].co2) * 10) / 10 : '',
        cii: apiResult.length > 0 ? apiResult[0].cii_rank : '',
        hsfo: Math.round(parseFloat(routeInfos[j].simulation_result.hsfo) * 10) / 10,
        dogo: Math.round(parseFloat(routeInfos[j].simulation_result.lsdogo) * 10) / 10,
        inport: Math.round(parseFloat(routeInfos[j].simulation_result.in_port_days) * 10) / 10
        // hire_cost: (Math.round(Number(latest.ordered_dogo) * 10) / 10).toFixed(1),
      }
      items.value.push(tmpRaw)
    }
  }
}

// Table headers
headers.value = [
  { text: 'LEG', value: 'leg', width: 60, fixed: true },
  { text: 'DEP', value: 'dep', width: 60, fixed: true },
  { text: 'ARR', value: 'arr', width: 60, fixed: true },
  { text: 'ETA(UTC)', value: 'eta', width: 150 },
  { text: 'Seadays', value: 'days', width: 60 },
  { text: 'Portdays', value: 'inport', width: 60},
  { text: 'Dist[nm]', value: 'dist', width: 60 },
  { text: 'CO2', value: 'co2', width: 50 },
  { text: 'CII', value: 'cii', width: 50 },
  { text: 'HSFO', value: 'hsfo', width: 50 },
  { text: 'DO/GO', value: 'dogo', width: 50 }//,
  // { text: 'EDIT', value: 'operation', width: 50 }
]

const addVoyageEstimate = () => {
  msg.value = ''
  let voyageInfo = {}
  console.log(props.simDatas)

  for (let i = 0; i < props.simDatas.length; i++) {
    console.log(i)
    console.log(props.simDatas[i])
    const legInfo = props.simDatas[i]
    voyageInfo[legInfo.leg_id] = false
  }
  console.log(voyageInfo)

  // Validation
  // no legs selected
  if (itemsSelected.value.length === 0) { 
    msg.value = 'No leg is selected.'
    return false
  }
  // duplicated legs
  for (let i=0; i<itemsSelected.value.length; i++){
    const legid = itemsSelected.value[i].legId
    if (voyageInfo[legid] === false){
      voyageInfo[legid] = true
    } else {
      msg.value = 'There is a duplicate leg.'
      return false
    }
  }

  for (let legid in voyageInfo){
    if (voyageInfo[legid] === false){
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

  for (let i = 0; i < itemsSelected.value.length; i++) {
    totalDays = itemsSelected.value[i].days + totalDays
    totalIFO = itemsSelected.value[i].hsfo + totalIFO
    totalLSDOGO = itemsSelected.value[i].dogo + totalLSDOGO
    totalInportDays = itemsSelected.value[i].inport + totalInportDays
    totalCO2 = itemsSelected.value[i].co2 + totalCO2
  }

  const voyageData = {
    total_days: totalDays,
    total_ifo: totalIFO,
    total_lsdogo: totalLSDOGO,
    total_inport_days: totalInportDays,
    total_co2: totalCO2
  }

  console.log('EMIT to MENU3')
  console.log(voyageData)
  emits('newVoyageData', voyageData)
}

</script>

<style scoped>
.tableplane {
  width: 100%;
  height: 30vh;
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
