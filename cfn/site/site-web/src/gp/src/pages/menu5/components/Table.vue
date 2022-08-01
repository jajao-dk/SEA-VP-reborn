<template>
  <div class="tableplane">
    <EasyDataTable
      show-index
      header-background-color="#ddd"
      :headers="headers"
      :items="items"
      table-class-name="customize-table"
      @click-row="clickRow"
    >
      <!--template #item-risk="{risk, riskLevel}">
        <div class="risk-wrapper">
          <img
            class="risk"
            :src="riskLevel"
            alt=""
          >{{ risk }}
        </div>
      </template-->
      <template #item-operation="item">
        <div class="operation-wrapper">
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
import { ref, reactive, defineProps, watch, toRefs } from 'vue'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import calcCII from '../../calcCII.js'
import calcCO2 from './calcCO2.js'

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  legData: { type: Object, default: () => {} }
})

const { customerId, legData } = toRefs(props)
// watch(() => props.custtomerId, (newValue) => {
watch(legData, (newValue) => {
  console.log('Table create Handler')
  console.log(newValue)
  createTable(newValue)
})

// Emits
/*
const emits = defineEmits(['tableVesselSelected'])
const clickRow = (item) => {
  console.log(item.id)
  emits('tableVesselSelected', item.imo)
}
*/

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

const createTable = async (legData) => {
  console.log('create table')
  console.log(legData)
  items.value.length = 0
  if (legData === undefined) {
    return false
  }

  // CO2, CII rank追加処理
  const arrObj = await calcCO2(legData)
  // for (let i = 0; i < legData.plans.length; i++) {
  //   // arrObjのindex=0はfrom_dep_to_latestでの値の為含めない
  //   legData.plans[i].co2 = arrObj[i + 1].co2
  // }
  const apiResult = await calcCII(arrObj)
  for (let i = 0; i < legData.plans.length; i++) {
    // arrObjのindex=0はfrom_dep_to_latestでの値の為含めない
    legData.plans[i].co2 = apiResult[i + 1].co2
    legData.plans[i].cii_rank = apiResult[i + 1].cii_rank
  }

  const plans = legData.plans

  plans.sort(function (a, b) {
    if (a.selected >= b.selected) return -1
    if (a.selected < b.selected) return 1
    return 0
  })

  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]
    // const riskLevel = checkAlert(errmVessels[i])
    // console.log(riskLevel)

    // emits('tableVesselSelected', errmVessels[i].imo_num)

    console.log(plans)

    const tmpRaw = {
      id: i,
      select: plan.selected,
      setting: plan.setting,
      route: plan.route_name,
      eta: plan.eta_lt,
      co2: plan.co2,
      cii: plan.cii_rank,
      remain_dist: plan.distance.remain,
      entire_dist: plan.distance.entire,
      ocean_days: (Math.round(Number(plan.sailing_area.OpenOcean.sailing_days) * 10) / 10).toFixed(1),
      remain_days: (Math.round(Number(plan.sailing_area.Remain.sailing_days) * 10) / 10).toFixed(1),
      entire_days: (Math.round(Number(plan.sailing_area.Entire.sailing_days) * 10) / 10).toFixed(1),
      goodwx_spd: plan.speed.perf,
      wx_factor: plan.speed.wf,
      cur_factor: plan.speed.cf,
      og: plan.speed.og,
      hsfo: plan.cons_fo_over_0_1,
      lsfo: plan.cons_fo_max_0_1,
      dogo: plan.cons_dogo_max_0_1,
      est_foc: plan.wni_estimated_foc,
      bunker_cost: plan.cost_bunker,
      hire_cost: plan.cost_hire,
      total_cost: plan.cost_total,
      daily_cost: plan.cost_daily,
      entire_cost: plan.cost_entire
      // hire_cost: (Math.round(Number(latest.ordered_dogo) * 10) / 10).toFixed(1),
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
  { text: 'Select', value: 'select', width: 60 },
  { text: 'Setting', value: 'setting', width: 150 },
  { text: 'Route', value: 'route', width: 120 },
  { text: 'ETA (LT)', value: 'eta', width: 100 },
  { text: 'CO2', value: 'co2', width: 50 },
  { text: 'CII', value: 'cii', width: 50 },
  { text: 'Remain dist.', value: 'remain_dist', width: 50 },
  { text: 'Entire dist.', value: 'entire_dist', width: 50 },
  { text: 'Ocean days', value: 'ocean_days', width: 50 },
  { text: 'Remain days', value: 'remain_days', width: 50 },
  { text: 'Entire days', value: 'entire_days', width: 50 },
  { text: 'GoodWx SPD', value: 'goodwx_days', width: 50 },
  { text: 'Wx Factor', value: 'wx_factor', width: 50 },
  { text: 'Cur Factor', value: 'cur_factor', width: 50 },
  { text: 'O.G', value: 'og', width: 50 },
  { text: 'HSFO', value: 'hsfo', width: 50 },
  { text: 'LSFO', value: 'lsfo', sortable: true, width: 50 },
  { text: 'DOGO', value: 'dogo', width: 50 },
  { text: 'Est. FOC', value: 'est_foc', sortable: true, width: 50 },
  { text: 'Bunker cost', value: 'bunker_cost', width: 50 },
  { text: 'Hire cost', value: 'hire_cost', width: 50 },
  { text: 'Total cost', value: 'total_cost', width: 50 },
  { text: 'Daily cost', value: 'daily_cost', width: 50 },
  { text: 'Entire cost', value: 'entire_cost', width: 50 }//,
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
