<script setup>
import { ref, reactive, defineProps, watch, toRefs } from 'vue'
import { Chart, Grid, Line } from 'vue3-charts'

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  selectedVessel: { type: Object, default: () => {} }
})

const { selectedVessel } = toRefs(props)
watch(selectedVessel, (newValue) => {
  console.log('PERF GRAPH')
  console.log(newValue)
  getPerfCurve(newValue)
})

// To draw the Performance graph
const graphdata = ref([])

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

const getPerfCurve = async (selectedVsl) => {
  console.log(selectedVsl)
  if (selectedVsl === '') {
    console.log('Vessel name missing')
  }

  let vesCategory = -1
  let tmpBench = { do_analyze: false }
  // benchName.value = 'Unknown'
  const dwt = selectedVsl.dwt
  if (selectedVsl.ship_type === 'BULK CARRIER') {
    if (dwt > 0 && dwt < 40000) vesCategory = 0
    else if (dwt >= 40000 && dwt < 64000) vesCategory = 1
    else if (dwt >= 64000 && dwt < 100000) vesCategory = 2
    else if (dwt >= 100000 && dwt < 125000) vesCategory = 3
    else if (dwt >= 125000 && dwt < 200000) vesCategory = 4
    else if (dwt >= 200000) vesCategory = 5
  } else if (selectedVsl.ship_type === 'TANKER') {
    if (dwt > 0 && dwt < 60000) vesCategory = 6
    else if (dwt >= 60000 && dwt < 80000) vesCategory = 7
    else if (dwt >= 80000 && dwt < 120000) vesCategory = 8
    else if (dwt >= 120000 && dwt < 200000) vesCategory = 9
    else if (dwt >= 200000 && dwt < 320000) vesCategory = 10
    else if (dwt >= 320000) vesCategory = 11
  } else if (selectedVsl.ship_type === 'PCTC') vesCategory = 11

  if (vesCategory >= 0) {
    tmpBench = {
      do_analyze: true,
      shiptype: benchMark[vesCategory].shiptype,
      shipsize: benchMark[vesCategory].shipsize,
      dwt: benchMark[vesCategory].dwt
    }
    benchName.value = benchMark[vesCategory].name
  } else {
    benchName.value = selectedVsl.ship_type
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
    fuel_consumption: 'me',
    loading_condition: 'laden',
    weather_level: ['fair'],
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
        wnishipnum: selectedVsl.ship_num,
        vessel_name: selectedVsl.ship_name,
        callsign: selectedVsl.call_sign,
        ship_type: selectedVsl.ship_type,
        dwt: selectedVsl.dwt,
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
    client: props.customerId,
    benchmark_setting: tmpBench,
    _: 1656298096548
  }
  console.log(input_json)

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
    perfJson.data.performance_data[selectedVsl.ship_num][0]
  const analysisData = perfData.analysis
  const reportData = perfData.report
  const benchData = perfJson.data.benchmark_data.analysis

  console.log(analysisData)
  console.log(reportData)
  console.log(benchData)

  const tmpRPM = { speed: 'RPM' }
  const tmpMCR = { speed: 'MCR(%)' }
  const tmpFOC = { speed: 'FOC ALL (mt/24h)' }
  for (let i = 0; i < analysisData.length; i++) {
    analysisData[i].analysis = analysisData[i].foc
    reportData.push(analysisData[i])
    // const tmpTitle = { text: analysisData[i].speed, value: String(i), width: 50 }
    tmpRPM[String(i)] = analysisData[i].rpm
    tmpMCR[String(i)] = analysisData[i].mcr
    tmpFOC[String(i)] = analysisData[i].foc
    delete analysisData[i].foc
  }
  if (benchData) {
    for (let i = 0; i < benchData.length; i++) {
      benchData[i].benchdata = benchData[i].foc
      reportData.push(benchData[i])
      delete benchData[i].foc
    }
  }

  console.log(reportData)
  graphdata.value = reportData

  return false
}
</script>

<template>
  <div
    class="perfplance"
    align="center"
  >
    <div class="ylabel">
      Fuel consumption [mt]
    </div>
    <div class="gtitle">
      <b>{{ props.selectedVessel.ship_name }} ({{ benchName }})</b>
    </div>
    <Chart
      align="center"
      :size="{ width: 300, height: 180 }"
      :data="graphdata"
      :margin="{ left: 20, top: 5, right: 5, bottom: 0 }"
      :axis="{
        primary: {
          domain: [0, 20],
          type: 'linear',
          label: 'Speed'
        },
        secondary: {
          domain: [0, 40],
          type: 'linear'
        }
      }"
      :direction="'horizontal'"
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
    <div class="xlabel">
      speed [kts]
    </div>
  </div>
</template>

<style scoped>
.graph{
  margin-left: 20px;
  overflow: scroll;
}
.gtitle {
  position: relative;
  top: -10pt;
  font-size: 14px;
  width:fit-content;
}
.ylabel {
  position: relative;
  top: 90pt;
  right: 110pt;
  font-size: 12px;
  width:fit-content;
  transform:rotate(270deg);
}
.xlabel {
  position: relative;
  font-size: 12px;
  right: -20px;
}
</style>
