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
      ['dist', 'co2', 'a/b', 'b/c', 'c/d', 'd/e', 'latest'],
      [0, 0.0, 0, 0, 0, 0, 0]
    ]
    ytdAvailable.value = false
  } else {
    // constant for CII reference line
    const a = newValue.ytd.rating_info.baseline * newValue.ytd.using_ship_info.using_capacity / 1000000

    // This voyage ***********
    // recalculate reference lines
    for (let i = 2; i < newValue.data.length; i++) {
      newValue.data[i][2] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d1
      newValue.data[i][3] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d2
      newValue.data[i][4] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d3
      newValue.data[i][5] = a * newValue.data[i][0] * newValue.ytd.cii_factor.d4
    }
    chartData.value = newValue.data

    // YTD *******************
    if (newValue.ytd.distance !== 0) {
      ytdAvailable.value = true
      const newYtd = [
        ['dist', 'co2', 'a/b', 'b/c', 'c/d', 'd/e', 'latest'],
        [0, 0.0, 0, 0, 0, 0, null]
      ]
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
  }
}, { deep: true })

const chartData = ref([
  ['dist', 'co2', 'a/b', 'b/c', 'c/d', 'd/e', 'latest'],
  [0, 0.0, 0, 0, 0, 0, 0]
])

const chartDataYtd = ref([
  ['dist', 'co2', 'a/b', 'b/c', 'c/d', 'd/e', 'latest'],
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
    0: { color: 'black', pointSize: 3, pointShape: 'circle', lineWidth: 3 },
    1: { color: 'blue', pointsVisible: false, lineWidth: 2 },
    2: { color: 'green', pointsVisible: false, lineWidth: 2 },
    3: { color: 'orange', pointsVisible: false, lineWidth: 2 },
    4: { color: 'red', pointsVisible: false, lineWidth: 2 },
    5: { color: 'black', pointSize: 10, pointShape: 'circle', lineWidth: 0 }
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
    0: { color: 'black', pointSize: 3, pointShape: 'circle', lineWidth: 3 },
    1: { color: 'blue', pointsVisible: false, lineWidth: 2 },
    2: { color: 'green', pointsVisible: false, lineWidth: 2 },
    3: { color: 'orange', pointsVisible: false, lineWidth: 2 },
    4: { color: 'red', pointsVisible: false, lineWidth: 2 },
    5: { color: 'black', pointSize: 10, pointShape: 'circle', lineWidth: 0 }
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
