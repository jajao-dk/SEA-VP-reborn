<template>
  <div class="tableplane">
    <EasyDataTable
      v-model:items-selected="itemsSelected"
      header-background-color="#ddd"
      :headers="headers"
      :items="items"
      table-class-name="customize-table"
    />
    <div>{{ itemsSelected }}</div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, toRefs } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'

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
const emits = defineEmits(['tableRouteSelected'])
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

// const isEditing = ref(false)
/*
const editingItem = reactive({
  height: '',
  weight: 0,
  id: 0
})
*/
/*
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
*/

const createTable = (simDatas) => {
  console.log('create table')
  console.log(simDatas)
  items.value.length = 0
  itemsSelected.value.length = 0

  for (let i = 0; i < simDatas.length; i++) {
    console.log(i)
    console.log(simDatas[i])
    const legInfo = simDatas[i]
    const routeInfos = simDatas[i].route_infos

    for (let j = 0; j < routeInfos.length; j++) {
      const tmpRaw = {
        leg: i + 1,
        id: legInfo.leg_id + '-' + routeInfos[j].route_id,
        dep: legInfo.departure.portcode,
        arr: legInfo.arrival.portcode,
        eta: routeInfos[j].simulation_result.eta,
        days: Math.round(parseFloat(routeInfos[j].simulation_result.at_sea_days) * 10) / 10,
        dist: Math.round(parseFloat(routeInfos[j].simulation_result.distance) * 10) / 10,
        co2: '',
        cii: '',
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
  { text: 'Days', value: 'days', width: 50 },
  { text: 'Dist[nm]', value: 'dist', width: 50 },
  { text: 'CO2', value: 'co2', width: 50 },
  { text: 'CII', value: 'cii', width: 50 },
  { text: 'HSFO', value: 'hsfo', width: 50 },
  { text: 'DOGO', value: 'dogo', width: 50 }//,
  // { text: 'EDIT', value: 'operation', width: 50 }
]

</script>

<style>
.tableplane {
  width: 100%;
  height: 300px;
  overflow: scroll;
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
