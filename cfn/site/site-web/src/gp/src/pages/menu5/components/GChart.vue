<template>
  <div
    class="chartplane"
    align="center"
  >
    <GChart
      type="ScatterChart"
      :data="chartData"
      :options="chartOptions"
    />
    <GChart
      v-if="ytdAvailable"
      type="ScatterChart"
      :data="chartDataYtd"
      :options="chartOptionsYtd"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, watch, toRefs } from 'vue'
import { GChart } from 'vue-google-charts'

const ytdAvailable = ref(false)

// Props
const props = defineProps({
  customerId: { type: String, default: '' },
  ciiData: { type: Object, default: () => {} }
})

const { ciiData } = toRefs(props)
watch(ciiData, (newValue) => {
  console.log('Graph create Handler')
  console.log(newValue)
  if (Object.keys(newValue).length === 0) {
    console.log('no elements')
    chartData.value = [
      ['dist', 'Actual', 'A/B', 'B/C', 'C/D', 'D/E', 'Latest'],
      [0, 0.0, 0, 0, 0, 0, 0]
    ]
    ytdAvailable.value = false
  } else {
    // constant for CII reference line
    const a = newValue.ytd.rating_info.baseline * newValue.ytd.using_ship_info.using_capacity / 1000000

    const newData = [
      ['dist', 'Actual', 'A/B', 'B/C', 'C/D', 'D/E', 'Latest']
    ]
    // This voyage ***********
    // recalculate reference lines
    for (let i = 1; i < newValue.data.length; i++) {
      const tmpData = []
      tmpData[0] = newValue.data[i][0]
      tmpData[1] = newValue.data[i][1]
      tmpData[2] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d1
      tmpData[3] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d2
      tmpData[4] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d3
      tmpData[5] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d4
      tmpData[6] = newValue.data[i][6]
      newData.push(tmpData)
    }
    chartData.value = newData

    // YTD *******************
    const newYtd = [
      ['dist', 'Actual', 'A/B', 'B/C', 'C/D', 'D/E', 'Latest'],
      [0, 0.0, 0, 0, 0, 0, null]
    ]
    if (newValue.ytd.distance !== 0) {
      ytdAvailable.value = true
      // past voyage
      newYtd.push([
        newValue.ytd.distance,
        newValue.ytd.co2,
        a * newValue.ytd.distance * newValue.ytd.cii_factor.d1,
        a * newValue.ytd.distance * newValue.ytd.cii_factor.d2,
        a * newValue.ytd.distance * newValue.ytd.cii_factor.d3,
        a * newValue.ytd.distance * newValue.ytd.cii_factor.d4,
        null
      ])
      // this voyage
      let flg = false
      for (let i = 2; i < newValue.data.length; i++) {
        const tmpYtd = [
          newValue.ytd.distance + newValue.data[i][0],
          newValue.ytd.co2 + newValue.data[i][1],
          a * (newValue.ytd.distance + newValue.data[i][0]) * newValue.ytd.cii_factor.d1,
          a * (newValue.ytd.distance + newValue.data[i][0]) * newValue.ytd.cii_factor.d2,
          a * (newValue.ytd.distance + newValue.data[i][0]) * newValue.ytd.cii_factor.d3,
          a * (newValue.ytd.distance + newValue.data[i][0]) * newValue.ytd.cii_factor.d4,
          null
        ]
        if (newValue.data[i][6] !== null && flg === false) {
          tmpYtd[6] = newValue.ytd.co2 + newValue.data[i][6]
          flg = true
        }
        newYtd.push(tmpYtd)
      }
      if (flg === false) {
        newYtd[2][6] = newValue.ytd.co2
      }
      chartDataYtd.value = newYtd
    } else {
      ytdAvailable.value = false
    }

    if ('selectedPlan' in newValue) {
      if (newData.includes(7) === false) {
        console.log(newValue.selectedPlan.co2)
        console.log(newValue.selectedPlan.entire_dist)
        const a = newValue.selectedPlan.co2Raw / newValue.selectedPlan.distRaw
        newData[0][7] = 'Sim.'
        for (let i = 1; i < newData.length; i++) {
          newData[i][7] = a * newData[i][0]
        }
        const tmpData = [
          newValue.selectedPlan.distRaw,
          null, null, null, null, null, null,
          newValue.selectedPlan.co2Raw
        ]
        newData.push(tmpData)
        /*
        if ('inPortFoc' in newValue) {
          const tmpPortData = [
            newValue.selectedPlan.distRaw,
            null, null, null, null, null, null,
            newValue.selectedPlan.co2Raw + newValue.inPortFoc * 3.206
          ]
          newData.push(tmpPortData)
        }
        */
      } else {
        console.log('Is this possible???')
      }

      if (newYtd.includes(7) === false) {
        console.log(newValue.selectedPlan.co2)
        console.log(newValue.selectedPlan.entire_dist)
        const a = newValue.selectedPlan.co2Raw / newValue.selectedPlan.distRaw
        newYtd[0][7] = 'Sim.'
        newYtd[1][7] = null
        for (let i = 2; i < newYtd.length; i++) {
          newYtd[i][7] = a * (newYtd[i][0] - newYtd[2][0]) + newYtd[2][1]
        }
        const tmpData = [
          newValue.selectedPlan.distRaw + newYtd[2][0],
          null, null, null, null, null, null,
          newValue.selectedPlan.co2Raw + newYtd[2][1]
        ]
        newYtd.push(tmpData)
        /*
        if ('inPortFoc' in newValue) {
          const tmpPortData = [
            newValue.selectedPlan.distRaw + newYtd[2][0],
            null, null, null, null, null, null,
            newValue.selectedPlan.co2Raw + newYtd[2][1] + newValue.inPortFoc * 3.206
          ]
          newYtd.push(tmpPortData)
        }
        */
      } else {
        console.log('Is this possible???')
      }
    }
  }
}, { deep: true })

const chartData = ref([
  ['dist', 'Actual', 'A/B', 'B/C', 'C/D', 'D/E', 'Latest'],
  [0, 0.0, 0, 0, 0, 0, 0]
])

const chartDataYtd = ref([
  ['dist', 'Actual', 'A/B', 'B/C', 'C/D', 'D/E', 'Latest'],
  [0, 0.0, 0, 0, 0, 0, 0]
])

const chartOptions = ref({
  title: 'CII target for this voyage at sea',
  titleTextStyle: { fontSize: 16 },
  lineWidth: 1,
  curveType: 'None',
  legend: { position: 'right', maxLines: 10, pageIndex: 1, alignment: 'start' },
  // chartArea: { width: '50%' },
  series: {
    0: { color: 'black', pointSize: 3, pointShape: 'circle', lineWidth: 2 },
    1: { color: 'blue', pointsVisible: false, lineWidth: 2 },
    2: { color: 'green', pointsVisible: false, lineWidth: 2 },
    3: { color: 'orange', pointsVisible: false, lineWidth: 2 },
    4: { color: 'red', pointsVisible: false, lineWidth: 2 },
    5: { color: 'black', pointSize: 10, pointShape: 'circle', lineWidth: 0 },
    6: { color: '#0f0', pointsVisible: false, lineWidth: 4, lineDashStyle: [10, 2] }
  },

  hAxis: {
    title: 'Distance [nm]'
  },
  vAxis: {
    title: 'CO2 consumption [mt]'
  },
  width: 450,
  height: 350,
  chartArea: { width: '60%', height: '70%' }
})

const chartOptionsYtd = ref({
  title: 'CII target for YtD (Berth to Berth)',
  titleTextStyle: { fontSize: 16 },
  // lineWidth: 1,
  curveType: 'None',
  legend: { position: 'right', maxLines: 10, pageIndex: 1, alignment: 'start' },
  // chartArea: { width: '50%' },
  series: {
    0: { color: 'black', pointSize: 3, pointShape: 'circle', lineWidth: 2 },
    1: { color: 'blue', pointsVisible: false, lineWidth: 2 },
    2: { color: 'green', pointsVisible: false, lineWidth: 2 },
    3: { color: 'orange', pointsVisible: false, lineWidth: 2 },
    4: { color: 'red', pointsVisible: false, lineWidth: 2 },
    5: { color: 'black', pointSize: 10, pointShape: 'circle', lineWidth: 0 },
    6: { color: '#0f0', pointsVisible: false, lineWidth: 4, lineDashStyle: [10, 2] }
  },

  hAxis: {
    title: 'Distance [nm]'
  },
  vAxis: {
    title: 'CO2 consumption [mt]'
  },
  width: 450,
  height: 350,
  chartArea: { width: '60%', height: '70%' }
})
</script>
<style scoped>
.chartplane {
  width: 100%;
  height: 80vh;
  overflow: scroll;
}
</style>
