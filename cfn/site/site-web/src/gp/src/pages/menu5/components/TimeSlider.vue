<script setup>
import { computed, defineProps, watch, ref } from 'vue'
import { throttle } from 'lodash'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { event as gtagEvent } from 'vue-gtag'
import { useAuth } from '../../../plugins/auth'
const { getToken } = useAuth()
dayjs.extend(utc)
dayjs.locale('en')

const props = defineProps({
  layerList: { type: Object, default: () => {}, required: true },
  updateIntervalSecond: { type: Number, default: 3600, required: false },
  backHour: { type: Number, default: 360, required: false },
  futureHour: { type: Number, default: 360, required: false },
  colorMode: { type: String, default: 'dark', required: false }
})

const intervalHour = ref(3)
const index = ref(360)
const totalHour = props.backHour + props.futureHour
const now = ref(dayjs().startOf('hour'))

const min = computed(() => now.value.subtract(props.backHour, 'hour'))
const max = computed(() => now.value.add(props.futureHour, 'hour'))
const time = computed(() => min.value.add(index.value, 'hour'))

const targetDate = computed(() => time.value.utc().format('MMM/DD/YYYY HH:mm UTC'))
const minDate = computed(() => min.value.utc().format('MMM. DD'))
const maxDate = computed(() => max.value.utc().format('MMM. DD'))
const currentPosition = computed(() => `${now.value.diff(min.value, 'hour') / totalHour * 100}%`)
const showCurrentPosition = computed(() => !now.value.isSame(time.value))

const disablePrev = computed(() => time.value.isSame(min.value))
const disableNext = computed(() => time.value.isSame(max.value))

const prevTime = () => {
  index.value = Math.max(index.value - intervalHour.value, 0)
  updateLayerOnChange()
  gtagEvent('click', { event_category: 'timeslider', value: 'prev' })
}

const nextTime = () => {
  index.value = Math.min(index.value + intervalHour.value, totalHour)
  updateLayerOnChange()
  gtagEvent('click', { event_category: 'timeslider', value: 'next' })
}

const currentTime = () => {
  index.value = props.backHour
  updateLayerOnChange()
  gtagEvent('click', { event_category: 'timeslider', value: 'current' })
}

const updateLayer = () => {
  for (const layer of Object.values(props.layerList)) {
    layer.content.setTimeSeriesValue(time.value.valueOf())
  }
}
const updateLayerOnChange = () => {
  for (const layer of Object.values(props.layerList)) {
    layer.content.setTimeSeriesValueOnChange(time.value.valueOf())
  }
}
const updateLayerInterval = () => {
  for (const layer of Object.values(props.layerList)) {
    layer.content.setTimeSeriesIntervalHour(intervalHour.value)
  }
}
updateLayer()
updateLayerOnChange()

watch(
  () => time.value,
  throttle((newValue, oldValue) => {
    console.log({
      timeSeriesIndex: index.value,
      timeSeriesValue: dayjs.utc(time.value).format('MMM/DD/YYYY HH:mm UTC')
    })
    updateLayer()
  }, 100)
)

watch(() => intervalHour.value, (newValue) => {
  updateLayerInterval(newValue)
  gtagEvent('select', { event_category: 'timeslider', event_label: 'interval', value: newValue })
})

const gtagRangeEvent = () => {
  gtagEvent('range', { event_category: 'timeslider', event_label: 'slider', value: index.value })
}

const changeEvent = () => {
  gtagRangeEvent()
  updateLayerOnChange()
}

// Periodic update the source from the API every 2 seconds.
if (props.updateIntervalSecond) {
  setInterval(async () => {
    now.value = dayjs().startOf('hour')
    currentTime()
    await getToken()
  }, props.updateIntervalSecond * 1000)
}

</script>

<template>
  <section
    class="timeSlider"
    :class="[props.colorMode]"
  >
    <div class="timeSlider__top">
      <div class="timeSlider__rangeTextArea">
        <p class="timeSlider__rangeText first">
          {{ minDate }}
        </p>
        <div
          v-show="showCurrentPosition"
          class="timeSlider__curr_position"
          :style="{ left: currentPosition }"
        >
          <div>Now</div> <div>▲</div>
        </div>
        <p class="timeSlider__rangeText last">
          {{ maxDate }}
        </p>
      </div>
      <input
        v-model.number="index"
        type="range"
        name="range"
        class="timeSlider__range"
        :step="intervalHour"
        min="0"
        :max="totalHour"
        @change="changeEvent()"
      >
    </div>
    <div
      id="timeSlider_bottom"
      class="timeSlider__bottom"
    >
      <label
        for="timeSlider__select"
        class="timeSlider__label"
      >
        <select
          id="timeSlider__select"
          v-model.number="intervalHour"
          name=""
          class="timeSlider__select"
        >
          <!--option
            value="1"
            class="timeSlider__option"
          >1h</option-->
          <option
            value="3"
            class="timeSlider__option"
          >3h</option>
          <option
            value="6"
            class="timeSlider__option"
          >6h</option>
          <option
            value="12"
            class="timeSlider__option"
          >12h</option>
          <option
            value="24"
            class="timeSlider__option"
          >24h</option>
        </select>
      </label>
      <div class="timeSlider__buttons">
        <div
          class="timeSlider__prev"
          :class="{ disable: disablePrev }"
          @click="prevTime()"
        />
        <div
          class="timeSlider__curr"
          @click="currentTime()"
        />
        <div
          class="timeSlider__next"
          :class="{ disable: disableNext }"
          @click="nextTime()"
        />
      </div>
      <div id="timeSlider_text">
        <p class="timeSlider__text">
          {{ targetDate }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
* { user-select: none; }
.timeSlider__select:hover,
.timeSlider__prev:hover,
.timeSlider__curr:hover,
.timeSlider__next:hover {
  -webkit-transition: ease-out 0.1s;
  cursor: pointer;
  opacity: 0.8;
  transition: ease-out 0.1s;
}

/*▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼
▼ スライダー
▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼△▼*/
.timeSlider {
  -webkit-transform: translateX(-50%);
  -webkit-box-shadow: 0px 1px 4px 0px #00000066;
  position: fixed;
  /* bottom: 15px; */
  bottom: 39%;
  left: 50%;
  width: 330px; /* 480px; */
  overflow: hidden;
  transform: translateX(-50%);
  border-radius: 8px;
  background-color: #101010;
  box-shadow: 0px 1px 4px 0px #00000066;
  z-index: 1;
}

.timeSlider__top,
.timeSlider__bottom {
  padding: 2px 10px 2px 10px; /* 10px; */
}

.light .timeSlider__top {
  background-color: #e1e1e1;
}

.timeSlider__bottom {
  -webkit-box-align: center;
  -ms-flex-align: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #303030;
}

.light .timeSlider__bottom {
  background-color: #eaeaea;
}

.timeSlider__bottom > *:not(:last-child) {
  margin-right: 12px;
}

/*====================================================================================
レンジ上のテキスト
====================================================================================*/
.timeSlider__rangeTextArea {
  display: table;
  width: 100%;
  margin-bottom: -5px;
  table-layout: fixed;
}

.timeSlider__rangeText {
  display: table-cell;
  color: #fff;
  font-size: 12px; /* 13px; */
  line-height: 1em;
}

.light .timeSlider__rangeText {
  color: #181818;
}

.timeSlider__rangeText.last {
  text-align: right;
}

/*====================================================================================
スライダーレンジ
====================================================================================*/
.timeSlider__range {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 6px;
  background-color: #909090;
  position: relative;
  z-index: 1;
}

.timeSlider__range:focus,
.timeSlider__range:active {
  outline: none;
}

.timeSlider__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  -webkit-border-radius: 50%;
  display: block;
  position: relative;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 0, 0, 0.75);
  border-radius: 50%;
  background-color: #00fffa;
  cursor: pointer;
}

.light .timeSlider__range::-webkit-slider-thumb {
  border: 3px solid #eaeaea;
  background-color: #198ad3;
}

/*====================================================================================
プルダウン
====================================================================================*/
.timeSlider__label {
  display: block;
  position: relative;
  width: 65px; /* 60px */
  height: 30px; /* added */
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

.light .timeSlider__label {
  background-color: #0000000f;
}

.timeSlider__label:after {
  -webkit-transform: translateY(-50%) rotate(45deg);
  display: block;
  position: absolute;
  top: 45%;
  right: 6px;
  width: 9px;
  height: 9px;
  transform: translateY(-50%) rotate(45deg);
  border-right: 3px solid #fff;
  border-bottom: 3px solid #fff;
  content: '';
}

.light .timeSlider__label:after {
  border-right: 3px solid #181818;
  border-bottom: 3px solid #181818;
}

.timeSlider__select {
  z-index: 2;
  position: relative;
  width: 100%;
  padding: 4px; /* 7px; */
  padding-right: 5px;
  color: #fff;
  font-size: 13px; /* 15px; */
  font-weight: 600;
  text-align: center;
}

.light .timeSlider__select {
  color: #181818;
}

/*====================================================================================
前へ/次へボタン
====================================================================================*/
.timeSlider__buttons {
  display: table;
  overflow: hidden;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  table-layout: fixed;
}

.light .timeSlider__buttons {
  background-color: #0000000f;
}

.timeSlider__buttons > *:not(:last-child) {
  border-right: 2px solid #303030;
}

.light .timeSlider__buttons > *:not(:last-child) {
  border-right: 2px solid #0000001a;
}

.timeSlider__prev,
.timeSlider__curr,
.timeSlider__next {
  display: table-cell;
  position: relative;
  width: 25px; /* 40px */
  height: 25px; /* 36.5px */
  padding: 5px; /* 10px */
  vertical-align: middle;
  user-select: none;
}

.timeSlider__prev.disable,
.timeSlider__next.disable {
  opacity: 0.3;
  pointer-events: none;
}

.timeSlider__prev:after,
.timeSlider__next:after {
  -webkit-transform: translate(-50%, -50%) rotate(45deg);
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12px; /* 16px */
  height: 12px; /* 16px */
  transform: translate(-50%, -50%) rotate(45deg);
  border: 3px solid #fff;
  content: '';
}
.light .timeSlider__prev:after {
  border: 3px solid #181818;
  border-top: none;
  border-right: none;
}
.light .timeSlider__next:after {
  border: 3px solid #181818;
  border-bottom: none;
  border-left: none;
}

.timeSlider__curr {
  padding: 0;
}
.timeSlider__curr:before,
.timeSlider__curr:after {
  font-family: 'ヒラギノ角ゴシック', 'Hiragino Sans', 'ヒラギノ角ゴ ProN W3',
    'HiraKakuProN-W3', 'メイリオ', Meiryo, 'ＭＳ Ｐゴシック', sans-serif;
  display: block;
  text-align: center;
  line-height: 1em;
  color: #60ff90;
  font-weight: bold;
  font-size: 10px; /* 12px NOW */
}
.light .timeSlider__curr:before,
.light .timeSlider__curr:after {
  color: #619d31;
}

.timeSlider__curr:before {
  content: 'Now';
}
.timeSlider__curr:after {
  content: '▲';
}

.timeSlider__prev:after {
  left: 60%;
  border-top: none;
  border-right: none;
}

.timeSlider__next:after {
  left: 40%;
  border-bottom: none;
  border-left: none;
}

/*====================================================================================
日付/時刻テキスト
====================================================================================*/
.timeSlider__textArea {
  -webkit-box-flex: 1;
  -ms-flex: 1;
  flex: 1;
}

.timeSlider__text {
  color: #00fff8;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  user-select: none;
}

.light .timeSlider__text {
  color: #1594da;
}

.timeSlider__curr_position {
  position: absolute;
  text-align: center;
  transform: translate(-50%, 8px);
  font-size: 12px;
  font-weight: 800;
  color: #60ff90;
  top: -4px;
  z-index: 0;
}

.light .timeSlider__curr_position {
  color: #619d31;
}
</style>
