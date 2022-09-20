<template>
  <div class="tableplane">
    <EasyDataTable
      show-index
      height="100%"
      header-background-color="#ddd"
      :fixed-header="true"
      table-height="200"
      :headers="headers"
      :items="items"
      :loading="loadingState"
      table-class-name="customize-table"
      @click-row="clickRow"
    >
      <template #item-select="{select, bgcolor}">
        <div :style="bgcolor">
          <b>{{ select }}</b>
        </div>
      </template>
      <template #item-setting="{setting, bgcolorSetting}">
        <div :style="bgcolorSetting">
          {{ setting }}
        </div>
      </template>
      <template #item-cii="{cii, bgcolorCii}">
        <div :style="bgcolorCii">
          {{ cii }}
        </div>
      </template>
      <template #item-ciiYtd="{ciiYtd, bgcolorCiiYtd}">
        <div :style="bgcolorCiiYtd">
          {{ ciiYtd }}
        </div>
      </template>
      <template #item-entire_cost="{entire_cost, bgcolorCost}">
        <div :style="bgcolorCost">
          {{ entire_cost }}
        </div>
      </template>
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
    <!--div>{{ itemsSelected }}</div-->
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
  legData: { type: Object, default: () => {} },
  loading: { type: Boolean, default: false }
})

const { legData, loading } = toRefs(props)
// watch(() => props.custtomerId, (newValue) => {
watch(legData, (newValue) => {
  console.log('Table create Handler')
  console.log(newValue)
  createTable(newValue)
}, { deep: true })

watch(loading, (newValue) => {
  loadingState.value = newValue
})

// Emits
const emits = defineEmits(['tablePlanSelected'])
const clickRow = (item) => {
  console.log(item.setting)
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[i].id === item.id) {
      items.value[i].bgcolorSetting = 'background-color: #0f0'
      if ((item.cii).slice(0, 1) === 'A') {
        items.value[i].bgcolorCii = 'background-color: #0ff'
      } else if ((item.cii).slice(0, 1) === 'B') {
        items.value[i].bgcolorCii = 'background-color: #0f0'
      } else if ((item.cii).slice(0, 1) === 'C') {
        items.value[i].bgcolorCii = 'background-color: #ff0'
      } else if ((item.cii).slice(0, 1) === 'D') {
        items.value[i].bgcolorCii = 'background-color: #f90'
      } else if ((item.cii).slice(0, 1) === 'E') {
        items.value[i].bgcolorCii = 'background-color: #f00'
      }
      if ((item.ciiYtd).slice(0, 1) === 'A') {
        items.value[i].bgcolorCiiYtd = 'background-color: #0ff'
      } else if ((item.ciiYtd).slice(0, 1) === 'B') {
        items.value[i].bgcolorCiiYtd = 'background-color: #0f0'
      } else if ((item.ciiYtd).slice(0, 1) === 'C') {
        items.value[i].bgcolorCiiYtd = 'background-color: #ff0'
      } else if ((item.ciiYtd).slice(0, 1) === 'D') {
        items.value[i].bgcolorCiiYtd = 'background-color: #f90'
      } else if ((item.ciiYtd).slice(0, 1) === 'E') {
        items.value[i].bgcolorCiiYtd = 'background-color: #f00'
      }
    } else {
      items.value[i].bgcolorSetting = 'background-color: transparent'
      items.value[i].bgcolorCii = 'background-color: transparent'
      items.value[i].bgcolorCiiYtd = 'background-color: transparent'
    }
  }
  emits('tablePlanSelected', item)
}

// Create Table
const headers = ref([])
const items = ref([])
// const itemsSelected = ref([])
// const isEditing = ref(false)
const loadingState = ref(false)
const editingItem = reactive({
  height: '',
  weight: 0,
  id: 0
})
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

const createTable = async (legData) => {
  console.log('create table')
  console.log(legData)
  items.value.length = 0
  // if (legData === undefined) {
  if (Object.keys(legData).length === 0) {
    return false
  }

  // loadingState.value = true

  // CO2計算
  const arrObj = await calcCO2(legData)

  // CII計算
  const apiResultArr = []
  // latest, planで一つずつCIIを計算する
  for (let i = 0; i < arrObj.length; i++) {
    let apiResult = []
    const targetArr = []
    // APIに渡すパラメータが定義されているかチェック
    if (arrObj[i].distance && arrObj[i].co2 && arrObj[i].imoNumber) {
      // APIには配列で渡す
      targetArr.push(arrObj[i])
      apiResult = await calcCII(targetArr)
    }
    // 元データとマージさせる為、APIのレスポンスを配列に追加する
    apiResultArr.push(apiResult)
  }
  console.log(apiResultArr)

  // 元データにCII計算結果を追加する
  /*
  for (let i = 0; i < legData.plans.length; i++) {
    // index=0はfrom_dep_to_latestでの値の為含めない
    if (apiResultArr[i + 1].length > 0) {
      // CIIの計算が実行されなければ、配列は空
      const ciiValue = String(Math.round(apiResultArr[i + 1][0].cii * 100) / 100)
      legData.plans[i].co2 = apiResultArr[i + 1][0].co2
      legData.plans[i].cii_rank = apiResultArr[i + 1][0].cii_rank + '(' + ciiValue + ')'
    } else {
      legData.plans[i].co2 = ''
      legData.plans[i].cii_rank = ''
    }
  }
  */

  const plans = legData.plans

  /*
  plans.sort(function (a, b) {
    if (a.selected >= b.selected) return -1
    if (a.selected < b.selected) return 1
    return 0
  })
  */

  // pre-calculation (minimum cost)
  let minEntireCost = 10 ** 10
  for (let i = 0; i < plans.length; i++) {
    if (Number(plans[i].cost_entire) < minEntireCost) {
      minEntireCost = Number(plans[i].cost_entire)
    }
  }

  // main loop
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]
    let color = 'background-color: transparent'
    if (plan.selected === true) {
      color = 'background-color: #0ff'
    }
    let tmpCo2 = ''
    let tmpCii = ''
    if (apiResultArr[i + 1].length > 0) {
      // CIIの計算が実行されなければ、配列は空
      const ciiValue = String(Math.round(apiResultArr[i + 1][0].cii * 100) / 100)
      tmpCo2 = apiResultArr[i + 1][0].co2
      tmpCii = apiResultArr[i + 1][0].cii_rank + '(' + ciiValue + ')'
    }
    const tmpRaw = {
      id: i,
      select: (plan.selected === true) ? 'Recommend' : 'Ref-' + String(i + 1),
      bgcolor: color,
      bgcolorSetting: 'background-color: transparent',
      bgcolorCii: 'background-color: transparent',
      bgcolorCiiYtd: 'background-color: transparent',
      bgcolorCost: (plan.cost_entire === minEntireCost) ? 'background-color: #0f0' : 'background-color: #ccc',
      setting: plan.setting,
      route: plan.route_name,
      eta: plan.eta_lt,
      // co2: (Math.round(Number(plan.co2))).toLocaleString(),
      co2: Math.round(Number(tmpCo2)).toLocaleString(),
      co2Raw: tmpCo2,
      // cii: plan.cii_rank,
      cii: tmpCii,
      co2Ytd: '',
      ciiYtd: '-',
      remain_dist: (plan.distance.remain).toLocaleString(),
      entire_dist: (plan.distance.entire).toLocaleString(),
      distRaw: plan.distance.entire,
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
      est_foc: (Math.round(Number(plan.wni_estimated_foc) * 10) / 10).toFixed(1),
      bunker_cost: (plan.cost_bunker).toLocaleString(),
      hire_cost: (plan.cost_hire).toLocaleString(),
      total_cost: (plan.cost_total).toLocaleString(),
      daily_cost: (plan.cost_daily).toLocaleString(),
      entire_cost: (plan.cost_entire).toLocaleString() + ' (' + (Number(plan.cost_entire) - minEntireCost).toLocaleString() + ')'
      // hire_cost: (Math.round(Number(latest.ordered_dogo) * 10) / 10).toFixed(1),
    }
    items.value.push(tmpRaw)
  }

  // post calculation (YtD)
  if (legData.ytd_distance !== 0) {
    const tmpArr = []
    for (let i = 0; i < plans.length; i++) {
      let tmpCo2 = ''
      if (apiResultArr[i + 1].length > 0) {
        tmpCo2 = apiResultArr[i + 1][0].co2
      }
      const tmpDict = {}
      tmpDict.co2 = tmpCo2 + legData.ytd_co2 + legData.inPortFoc * 3.206
      items.value[i].co2Ytd = Math.round(tmpDict.co2).toLocaleString()
      tmpDict.distance = plans[i].distance.entire + legData.ytd_distance
      tmpDict.imoNumber = legData.imo_number
      tmpArr.push(tmpDict)
    }
    console.log(tmpArr)
    const ytdCII = await calcCII(tmpArr)
    console.log(ytdCII)
    for (let i = 0; i < ytdCII.length; i++) {
      const ciiValue = String(Math.round(ytdCII[i].cii * 100) / 100)
      items.value[i].ciiYtd = ytdCII[i].cii_rank + '(' + ciiValue + ')'
    }
  }

  items.value.sort(function (a, b) {
    if (a.select >= b.select) return 1
    if (a.select < b.select) return -1
    return 0
  })

  // loadingState.value = false
}

// Table headers
headers.value = [
  { text: 'Select', value: 'select', fixed: true, width: 100 },
  { text: 'Setting', value: 'setting', width: 150 },
  { text: 'Route', value: 'route', width: 120 },
  { text: 'ETA (LT)', value: 'eta', sortable: true, width: 100 },
  { text: 'CO2 at sea', value: 'co2', sortable: true, width: 75 },
  { text: 'CII　　at sea', value: 'cii', sortable: true, width: 75 },
  { text: 'CO2 YtD', value: 'co2Ytd', sortable: true, width: 70 },
  { text: 'CII YtD', value: 'ciiYtd', sortable: true, width: 70 },
  { text: 'Daily cost [$]', value: 'daily_cost', sortable: true, width: 85 },
  { text: 'Entire cost [$]', value: 'entire_cost', sortable: true, width: 125 },
  { text: 'Remain dist.', value: 'remain_dist', sortable: true, width: 70 },
  { text: 'Entire dist.', value: 'entire_dist', sortable: true, width: 70 },
  { text: 'Ocean days', value: 'ocean_days', sortable: true, width: 70 },
  { text: 'Remain days', value: 'remain_days', sortable: true, width: 70 },
  { text: 'Entire days', value: 'entire_days', sortable: true, width: 70 },
  { text: 'GoodWx SPD', value: 'goodwx_days', sortable: true, width: 70 },
  { text: 'Wx factor', value: 'wx_factor', width: 50 },
  { text: 'Cur factor', value: 'cur_factor', width: 50 },
  { text: 'O.G', value: 'og', sortable: true, width: 50 },
  { text: 'HSFO', value: 'hsfo', sortable: true, width: 60 },
  { text: 'LSFO', value: 'lsfo', sortable: true, width: 60 },
  { text: 'DO/GO', value: 'dogo', sortable: true, width: 60 },
  { text: 'Est. FOC', value: 'est_foc', sortable: true, width: 60 },
  { text: 'Bunker cost [$]', value: 'bunker_cost', sortable: true, width: 85 },
  { text: 'Hire cost [$]', value: 'hire_cost', sortable: true, width: 85 },
  { text: 'Total cost [$]', value: 'total_cost', sortable: true, width: 85 }

  // { text: 'EDIT', value: 'operation', width: 50 }
]

</script>

<style scoped>
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

.customize-table {
  --easy-table-header-font-size: 12px;
  --easy-table-header-height: 14px;
  --easy-table-header-background-color: #ccc;
  --easy-table-body-row-height: 24px;
}
</style>
