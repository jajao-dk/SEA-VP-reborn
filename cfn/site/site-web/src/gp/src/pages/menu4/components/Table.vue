<template>
  <div class="tableplane">
    <EasyDataTable
      dense
      header-background-color="#ddd"
      :headers="headers"
      :items="items"
      table-class-name="customize-table"
      @click-row="clickRow"
    >
      <template #item-risk="{risk, riskLevel}">
        <div class="risk-wrapper">
          <img
            class="risk"
            :src="riskLevel"
            alt=""
          >{{ risk }}
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

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  errmVessels: { type: Object, default: () => {} }
})

const { customerId, errmVessels } = toRefs(props)
// watch(() => props.custtomerId, (newValue) => {
watch(errmVessels, (newValue) => {
  console.log('Table draw Handler')
  console.log(newValue)
  console.log(customerId.value)
  createTable(newValue)
})

// Emits
const emits = defineEmits(['tableVesselSelected'])
const clickRow = (item) => {
  console.log(item.imo)
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

const createTable = (errmVessels) => {
  console.log('create table')
  console.log(errmVessels)

  for (let i = 0; i < errmVessels.length; i++) {
    const latest = errmVessels[i].latest
    // console.log(latest.vessel_name)
    const riskLevel = checkAlert(errmVessels[i])
    console.log(riskLevel)

    // emits('tableVesselSelected', errmVessels[i].imo_num)

    const tmpRaw = {
      id: i,
      vessel_name: latest.vessel_name,
      imo: errmVessels[i].imo_num,
      service_type: latest.service_type,
      risk: '',
      riskLevel,
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
      cii: ''
    }
    items.value.push(tmpRaw)
  }
}

const checkAlert = (vessel) => {
  const spd = Number(vessel.latest.average_speed)
  const targetSpd = Number(vessel.latest.ordered_speed)
  const spdWarn = 2
  const spdCaut = 1
  if (targetSpd === 0) {
    return './images/white.png'
  } else if (spd < targetSpd - spdWarn || spd > targetSpd + spdWarn) {
    return './images/red.png'
  } else if (spd < targetSpd - spdCaut || spd > targetSpd + spdCaut) {
    return './images/yellow.png'
  } else {
    return './images/white.png'
  }
}

// Table headers
headers.value = [
  { text: 'Vessel name', value: 'vessel_name', fixed: true, width: 100 },
  { text: 'Service', value: 'service_type', width: 60 },
  { text: 'Risk', value: 'risk', width: 50 },
  { text: 'L/B', value: 'laden_ballast', width: 30 },
  { text: 'Priority', value: 'priority', width: 110 },
  { text: 'ATD', value: 'atd', sortable: true, width: 95 },
  { text: 'Arrival port', value: 'arrival_port', width: 100 },
  { text: 'ETA', value: 'eta', width: 95 },
  { text: 'RTA', value: 'rta', width: 95 },
  { text: 'Speed', value: 'speed', width: 50 },
  { text: 'target', value: 'ordered_speed', sortable: true, width: 50 },
  { text: 'RPM', value: 'rpm', width: 50 },
  { text: 'target', value: 'suggested_rpm', width: 50 },
  { text: 'FOC', value: 'total_foc', width: 50 },
  { text: 'target', value: 'ordered_foc', sortable: true, width: 50 },
  { text: 'DO/GO', value: 'total_dogo', width: 50 },
  { text: 'target', value: 'ordered_dogo', sortable: true, width: 50 },
  { text: 'CII', value: 'cii', width: 50 },
  { text: 'Edit', value: 'operation', width: 50 }
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
