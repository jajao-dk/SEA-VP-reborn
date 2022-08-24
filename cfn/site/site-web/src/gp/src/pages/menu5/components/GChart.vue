<template>
  <div class="chartplane">
    <GChart
      type="ScatterChart"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>

<script setup>
import { ref, defineProps, watch, toRefs } from 'vue'
import { GChart } from 'vue-google-charts'

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
  } else {
    chartData.value = newValue.data
  }
}, { deep: true })

const chartData = ref([
  ['dist', 'co2', 'a/b', 'b/c', 'c/d', 'd/e', 'latest'],
  [0, 0.0, 0, 0, 0, 0, 0]
])

const chartOptions = ref({
  title: 'CII target for this voyage',
  lineWidth: 1,
  curveType: 'None',
  legend: { position: 'right', maxLines: 10, pageIndex: 1, alignment: 'start' },
  // chartArea: { width: '50%' },
  series: {
    0: { color: 'black', pointSize: 7, pointShape: 'circle', lineWidth: 3 },
    1: { color: 'blue', pointsVisible: false, lineWidth: 2 },
    2: { color: 'green', pointsVisible: false, lineWidth: 2 },
    3: { color: 'orange', pointsVisible: false, lineWidth: 2 },
    4: { color: 'red', pointsVisible: false, lineWidth: 2 },
    5: { color: 'black', pointSize: 20, pointShape: 'circle', lineWidth: 0 }
  },
  /*
  trendlines: {
    1: {
      type: "linear",
      color: "green",
      lineWidth: 3,
      opacity: 0.3,
      showR2: true,
      visibleInLegend: true,
    },
  },
  */
  hAxis: {
    title: 'Distance [nm]'
    // minValue: 0
    // format: "YYYY.MM",
  },
  vAxis: {
    title: 'CO2 consumption [mt]'
  },
  // pointShape: 'star',
  width: 450,
  height: 450
})
</script>
<style scoped>
.chartplane {
  width: 100%;
  height: 55vh;
  overflow: scroll;
}
</style>
