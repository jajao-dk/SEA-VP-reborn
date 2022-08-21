<script setup>
import { ref, onMounted, reactive } from 'vue'
// import axios from 'axios'
import { useAuth } from '../../plugins/auth'
// import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'
import { Chart, Grid, Line } from 'vue3-charts'
import Vue3EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import {
  set as gtagSet,
  pageview as gtagPageview,
  optIn as gtagOptin,
  event as gtagEvent,
  customMap as gtagCustomMap
} from 'vue-gtag'

// const container = ref(null)

const { getToken, getUser } = useAuth()

/*
const onMessage = (event) => {
  if (event.origin === location.origin && event.data) {
    switch (event.data.messageType) {
      case 'openWindow':
        window.open(event.data.url, event.data.windowName)
        break
    }
  }
}
*/
// window.addEventListener('message', onMessage, false)

onMounted(async () => {
  const token = await getToken()
  const user = await getUser()
  customerId.value = user.customer_ids[0]
  console.log(user.customer_ids[0])

  getVesselList()

  gtagOptin() // gtag.js にて、プラグイン登録時にプラグイン無効化しているので、ここで有効化する

  // GA4用の記述
  gtagSet('user_id', user.email)
  gtagSet('user_properties', { login_id: user.email, customer_id: user.customer_ids?.[0] })
  // UA用の記述
  gtagCustomMap('dimension1', 'login_id')
  gtagCustomMap('dimension2', 'customer_id')
  gtagEvent('custom_dimension', { login_id: user.email, customer_id: user.customer_ids?.[0] })

  // pageview送信
  gtagPageview(location.href)
})

const customerId = ref('')
const vslList = ref([])
const selectedVsl = ref('')

const selectedLoad = ref('laden')
const selectedFC = ref('me')
const wxLevels = ref(['fair', 'moderate', 'heavy', 'severe'])

// To draw the Performance graph
const graphdata = ref([])
const direction = ref('horizontal')
const margin = ref({ left: 0, top: 5, right: 20, bottom: 0 })
const axis = reactive({
  primary: {
    domain: [0, 20],
    type: 'linear',
    label: 'Speed'
  },
  secondary: {
    domain: [0, 40],
    type: 'linear'
  }
})

// To create the performance table
const itemsSelected = ref([])
const headers = ref([])
const items = ref([])
const loadingState = ref(false)

// benchmark_setting
const benchName = ref('')
const benchMark = [
  {
    name: 'Bulker: Handysize (0-40K)',
    shiptype: 'Bulker',
    shipsize: 'Handysize',
    dwt: { min: 0, max: 40000 }
  },
  {
    name: 'Bulker: Supramax (40-64K)',
    shiptype: 'Bulker',
    shipsize: 'Supramax',
    dwt: { min: 40000, max: 64000 }
  },
  {
    name: 'Bulker: Panamax (64-100K)',
    shiptype: 'Bulker',
    shipsize: 'Panamax',
    dwt: { min: 64000, max: 100000 }
  },
  {
    name: 'Bulker: Babycape (100-125K)',
    shiptype: 'Bulker',
    shipsize: 'Babycape',
    dwt: { min: 100000, max: 125000 }
  },
  {
    name: 'Bulker: Cape (100-125K)',
    shiptype: 'Bulker',
    shipsize: 'Cape',
    dwt: { min: 125000, max: 200000 }
  },
  {
    name: 'Bulker: NewCastleMax (200K-)',
    shiptype: 'Bulker',
    shipsize: 'NewCastleMax',
    dwt: { min: 200000, max: 0 }
  },
  {
    name: 'Tanker: ProductTanker (0-60K)',
    shiptype: 'Tanker',
    shipsize: 'ProductTanker',
    dwt: { min: 0, max: 60000 }
  },
  {
    name: 'Tanker: Panamax (60-80K)',
    shiptype: 'Tanker',
    shipsize: 'Panamax',
    dwt: { min: 60000, max: 80000 }
  },
  {
    name: 'Tanker: Alfamax (80-120K)',
    shiptype: 'Tanker',
    shipsize: 'Alfamax',
    dwt: { min: 80000, max: 120000 }
  },
  {
    name: 'Tanker: Suezmax (120-200K)',
    shiptype: 'Tanker',
    shipsize: 'Suezmax',
    dwt: { min: 120000, max: 200000 }
  },
  {
    name: 'Tanker: VLCC (200-320K)',
    shiptype: 'Tanker',
    shipsize: 'VLCC',
    dwt: { min: 200000, max: 320000 }
  },
  {
    name: 'Tanker: ULCC (320K-)',
    shiptype: 'Tanker',
    shipsize: 'ULCC',
    dwt: { min: 320000, max: 0 }
  },
  {
    name: 'PCTC',
    shiptype: 'PCTC',
    shipsize: '',
    dwt: { min: 0, max: 0 }
  }
]

const getVesselList = async () => {
  console.log('getVesselList')
  console.log('Client code: ', customerId.value)

  if (customerId.value === '') {
    return false
  }
  const url =
    'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_vessel_list.cgi?search_type=file_name&val=all&client=' +
    customerId.value
  const resp = await fetch(url)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    vslList.value = data.data
  }
  console.log(vslList.value)
}

const getPerfCurve = async () => {
  console.log(selectedVsl.value)
  if (selectedVsl.value === '' || wxLevels.value.length === 0) {
    console.log()
  }

  let vesCategory = -1
  let tmpBench = { do_analyze: false }
  // benchName.value = 'Unknown'
  const dwt = selectedVsl.value.dwt
  if (selectedVsl.value.ship_type === 'BULK CARRIER') {
    if (dwt > 0 && dwt < 40000) vesCategory = 0
    else if (dwt >= 40000 && dwt < 64000) vesCategory = 1
    else if (dwt >= 64000 && dwt < 100000) vesCategory = 2
    else if (dwt >= 100000 && dwt < 125000) vesCategory = 3
    else if (dwt >= 125000 && dwt < 200000) vesCategory = 4
    else if (dwt >= 200000) vesCategory = 5
  } else if (selectedVsl.value.ship_type === 'TANKER') {
    if (dwt > 0 && dwt < 60000) vesCategory = 6
    else if (dwt >= 60000 && dwt < 80000) vesCategory = 7
    else if (dwt >= 80000 && dwt < 120000) vesCategory = 8
    else if (dwt >= 120000 && dwt < 200000) vesCategory = 9
    else if (dwt >= 200000 && dwt < 320000) vesCategory = 10
    else if (dwt >= 320000) vesCategory = 11
  } else if (selectedVsl.value.ship_type === 'PCTC') vesCategory = 11

  if (vesCategory >= 0) {
    tmpBench = {
      do_analyze: true,
      shiptype: benchMark[vesCategory].shiptype,
      shipsize: benchMark[vesCategory].shipsize,
      dwt: benchMark[vesCategory].dwt
    }
    benchName.value = benchMark[vesCategory].name
  } else {
    benchName.value = selectedVsl.value.ship_type
  }

  const dt = new Date()
  const Y = dt.getFullYear()
  const M = dt.getMonth()
  const D = dt.getDate()
  const fromDate = String(Y - 1) + '/' + String(M + 1) + '/' + String(D + 1)
  const toDate = String(Y) + '/' + String(M + 1) + '/' + String(D)
  console.log(fromDate)
  console.log(toDate)

  console.log(tmpBench)

  const input_json = {
    session_id: '', // must be blank
    fuel_consumption: selectedFC.value,
    loading_condition: selectedLoad.value,
    weather_level: wxLevels.value,
    analysis_interval: { target: 'speed', interval: '0.5' },
    setting: {
      draft: ['', ''],
      output: ['', ''],
      displacement: ['', ''],
      deviation_range: '50',
      report_type: 'modified_wni',
      availableWindCond: true,
      availableWaveCond: true,
      weather_condition: {
        wind: { fair: '4', moderate: '5', heavy: '6' },
        wave: { fair: '2', moderate: '3', heavy: '5' }
      }
    },
    target: [
      {
        wnishipnum: selectedVsl.value.ship_num,
        vessel_name: selectedVsl.value.ship_name,
        callsign: selectedVsl.value.call_sign,
        ship_type: selectedVsl.value.ship_type,
        dwt: selectedVsl.value.dwt,
        periods: [
          {
            type: 'Last 12 months',
            event_name: 'Last 12 months',
            from: fromDate,
            to: toDate
          }
        ]
      }
    ],
    client: customerId.value,
    benchmark_setting: tmpBench,
    _: 1656298096548
  }
  console.log(input_json)

  loadingState.value = true

  const url =
    'https://tmax-b01.weathernews.com/T-Max/PerfEval/api/reborn_get_result_analysis_for_perfEval.cgi'

  const body1 = ['test', JSON.stringify(input_json)]

  const perfJson = await fetch(url, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body1)
  })
    .then((res) => res.json())
    .catch(console.error)

  console.log(perfJson)
  const perfData =
    perfJson.data.performance_data[selectedVsl.value.ship_num][0]
  const analysisData = perfData.analysis
  const reportData = perfData.report
  const benchData = perfJson.data.benchmark_data.analysis

  loadingState.value = false

  console.log(analysisData)
  console.log(reportData)
  console.log(benchData)

  headers.value = []
  items.value = []

  headers.value.push({ text: 'Speed[kts]', value: 'speed', fixed: true })
  const tmpRPM = { speed: 'RPM' }
  const tmpMCR = { speed: 'MCR(%)' }
  const tmpFOC = { speed: 'FOC ALL (mt/24h)' }
  for (let i = 0; i < analysisData.length; i++) {
    analysisData[i].analysis = analysisData[i].foc
    reportData.push(analysisData[i])
    const tmpTitle = { text: analysisData[i].speed, value: String(i), width: 50 }
    tmpRPM[String(i)] = analysisData[i].rpm
    tmpMCR[String(i)] = analysisData[i].mcr
    tmpFOC[String(i)] = analysisData[i].foc
    headers.value.push(tmpTitle)
    delete analysisData[i].foc
  }
  if (benchData) {
    for (let i = 0; i < benchData.length; i++) {
      benchData[i].benchdata = benchData[i].foc
      reportData.push(benchData[i])
      delete benchData[i].foc
    }
  }
  items.value.push(tmpRPM)
  items.value.push(tmpMCR)
  items.value.push(tmpFOC)
  console.log(items.value)
  console.log(headers.value)

  console.log(reportData)
  graphdata.value = reportData

  return false
}
</script>

<template>
  <div>
    <div class="inputpane">
      <div class="title">
        <b>Performance Evaluation</b>
      </div><br>
      Input vessel name:
      <select v-model="selectedVsl">
        <option
          disalbled
          value=""
        >
          Select vessel
        </option>
        <option
          v-for="vsl in vslList"
          :key="vsl.imo_num"
          :value="vsl"
        >
          {{ vsl.ship_name }}
        </option>
      </select><br><br>
      Time period: Last 12 months<br><br>
      Loading condition:
      <input
        v-model="selectedLoad"
        type="radio"
        name="Laden"
        value="laden"
      >Laden,
      <input
        v-model="selectedLoad"
        type="radio"
        name="Ballast"
        value="ballast"
      >Ballast,
      <input
        v-model="selectedLoad"
        type="radio"
        name="Laden+Ballast"
        value="laden_ballast"
      >Laden+Ballast, <br>
      <!-- {{selectedLoad}} -->
      Fuel consumption:
      <input
        v-model="selectedFC"
        type="radio"
        name="ME"
        value="me"
      >M/E,
      <input
        v-model="selectedFC"
        type="radio"
        name="ME+AE"
        value="me_ae"
      >M/E+A/E,
      <input
        v-model="selectedFC"
        type="radio"
        name="All"
        value="all"
      >All,
      <br>
      <!-- {{selectedFC}} -->
      Weather level:
      <input
        v-model="wxLevels"
        type="checkbox"
        name="ME"
        value="fair"
      >Fair,
      <input
        v-model="wxLevels"
        type="checkbox"
        name="ME+AE"
        value="moderate"
      >Moderate,
      <input
        v-model="wxLevels"
        type="checkbox"
        name="All"
        value="heavy"
      >Heavy,
      <input
        v-model="wxLevels"
        type="checkbox"
        name="All"
        value="severe"
      >Severe<br>
      <!-- {{wxLevels}}-->
      <button
        class="perfbtn"
        type="submit"
        @click="getPerfCurve"
      >
        Get perfromance data
      </button><br>
    </div>

    <div class="graphpane">
      <div class="graph">
        <Chart
          :size="{ width: 400, height: 300 }"
          :data="graphdata"
          :margin="margin"
          :axis="axis"
          :direction="direction"
        >
          <template #layers>
            <Grid stroke-dasharray="2,2" />
            <Line
              :data-keys="['speed', 'analysis']"
              type="natural"
              :hide-dot="true"
              :line-style="{ stroke: 'red', strokeWidth: 2 }"
            />
            <Line
              :data-keys="['speed', 'benchdata']"
              type="natural"
              :hide-dot="true"
              :line-style="{ stroke: 'blue', strokeWidth: 2 }"
            />
            <Line
              :data-keys="['speed', 'foc']"
              type="natural"
              :line-style="{ stroke: 'red', strokeWidth: 0 }"
              :dot-style="{ stroke: 'red', strokeWidth: 2 }"
            />
          </template>
        </Chart>
      </div>
      {{ benchName }}
    </div>

    <div class="table">
      <!-- Vue3EasyDataTable v-model:items-selected="itemsSelected" :headers="headers" :items="items" /-->
      <Vue3EasyDataTable
        :headers="headers"
        :items="items"
        header-background-color="#ddd"
        :loading="loadingState"
        table-class-name="customize-table"
      />
    </div>
  </div>
</template>

<style scoped>
.title{
  font-size: 18px;
}
.inputpane {
  border-radius: 5px;
  background-color: #f2f2f2;
  padding: 20px;
  line-height: 20px;
  font-size: 14px;
  overflow: scroll;
}

input {
  border: 2px solid blue;
  width: 30px;
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

.graphpane {
  border-radius: 5px;
  /* background-color: #f2f2f2;*/
  padding: 20px;
  line-height: 20px;
  font-size: 16px;
  overflow: scroll;
}
.graph {
  padding: 20px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}
.customize-table {
  --easy-table-header-font-size: 12px;
  --easy-table-header-height: 14px;
  --easy-table-header-background-color: #ccc;
  --easy-table-body-row-height: 24px;
}
</style>
