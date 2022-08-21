<script setup>
import { ref } from 'vue'

const props = defineProps({
  layerList: { type: Object, default () { return {} } }
})

const tooltipText = ref(null)
const tooltipShow = ref(false)
const tooltipY = ref('-20px')
const showTooltip = (text, event) => {
  tooltipText.value = text
  tooltipShow.value = true
  const rect = event.target.getBoundingClientRect()
  tooltipY.value = `${rect.y - 50}px`
}
const hideTooltip = (text) => {
  tooltipShow.value = false
}
</script>

<template>
  <div id="layers">
    <ul id="layerList_icon">
      <li
        v-for="layer in props.layerList"
        :key="layer.originName"
      >
        <div>
          <input
            :id="'toggle' + layer.originName"
            v-model="layer.visible"
            type="checkbox"
          >
          <label
            :for="'toggle' + layer.originName"
            @mouseenter="showTooltip(layer.title, $event)"
            @mouseleave="hideTooltip()"
          />
        </div>
      </li>
    </ul>
  </div>
  <div
    class="layerList_icon_desc"
    :style="{top: tooltipY}"
    :class="{show: tooltipShow}"
  >
    {{ tooltipText }}
  </div>
</template>

<style scoped>
#layers {
  position: absolute;
  top: 30px; /* 30px */
  left: 31%; /* 20px */
  background-color: rgba(200, 200, 200, 0.8);
  z-index: 1;
}
#layers ul {
  list-style-type: none;
  margin: 0;
  padding: 10px;
  max-height: calc(70vh - 80px);
  border-radius: 5px;
  overflow-y: auto;
}
#layers ul::-webkit-scrollbar {
  display: none;
}
#layers li label {
  display: inline-block;
  width: 30px;
  height: 30px;
  background-size: 100% 100%;
  cursor: pointer;
  user-select: none;
}
#layers li input[type="checkbox"] {
  display: none;
}
#layers li input#toggleGraticule:checked ~ label {
  background-image: url("/images/btns_svg/btn_graticule_on.svg");
}
#layers li input#toggleGraticule ~ label {
  background-image: url("/images/btns_svg/btn_graticule_off.svg");
}
#layers li input#toggle25m ~ label {
  background-image: url("/images/btns_svg/btn_25m_off.svg");
}
#layers li input#toggle25m:checked ~ label {
  background-image: url("/images/btns_svg/btn_25m_on.svg");
}
#layers li input#toggleNauticalChart ~ label {
  background-image: url("/images/btns_svg/btn_nauticalchart_off.svg");
}
#layers li input#toggleNauticalChart:checked ~ label {
  background-image: url("/images/btns_svg/btn_nauticalchart_on.svg");
}
#layers li input#toggleVessel ~ label {
  background-image: url("/images/btns_svg/btn_ship_off.svg");
}
#layers li input#toggleVessel:checked ~ label {
  background-image: url("/images/btns_svg/btn_ship_on.svg");
}
#layers li input#togglePort:checked ~ label {
  background-image: url("/images/btns_svg/btn_port_on.svg");
}
#layers li input#togglePort ~ label {
  background-image: url("/images/btns_svg/btn_port_off.svg");
}
#layers li input#toggleCurrent ~ label {
  background-image: url("/images/btns_svg/btn_current_off.svg");
}
#layers li input#toggleCurrent:checked ~ label {
  background-image: url("/images/btns_svg/btn_current_on.svg");
}
#layers li input#toggleWind ~ label {
  background-image: url("/images/btns_svg/btn_wind_off.svg");
}
#layers li input#toggleWind:checked ~ label {
  background-image: url("/images/btns_svg/btn_wind_on.svg");
}
#layers li input#toggleWxChart:checked ~ label {
  background-image: url("/images/btns_svg/btn_wxchart_on.svg");
}
#layers li input#toggleWxChart ~ label {
  background-image: url("/images/btns_svg/btn_wxchart_off.svg");
}
#layers li input#togglePiracy:checked ~ label {
  background-image: url("/images/btns_svg/btn_piracy_on.svg");
}
#layers li input#togglePiracy ~ label {
  background-image: url("/images/btns_svg/btn_piracy_off.svg");
}
#layers li input#toggleRestrictionArea:checked ~ label {
  background-image: url("/images/btns_svg/btn_ecaArea_on.svg");
}
#layers li input#toggleRestrictionArea ~ label {
  background-image: url("/images/btns_svg/btn_ecaArea_off.svg");
}
#layers li input#toggleRadar:checked ~ label {
  background-image: url("/images/btns_svg/btn_radar_on.svg");
}
#layers li input#toggleRadar ~ label {
  background-image: url("/images/btns_svg/btn_radar_off.svg");
}
#layers li input#toggleDepictedItem:checked ~ label {
  background-image: url("/images/btns_svg/btn_depictitem_on.svg");
}
#layers li input#toggleDepictedItem ~ label {
  background-image: url("/images/btns_svg/btn_depictitem_off.svg");
}
#layers li input#toggleDepictedItemOE:checked ~ label {
  background-image: url("/images/btns_svg/btn_windmill_on.svg");
}
#layers li input#toggleDepictedItemOE ~ label {
  background-image: url("/images/btns_svg/btn_windmill_off.svg");
}
#layers li input#toggleCyclone:checked ~ label {
  background-image: url("/images/btns_svg/btn_typhoon_on.svg");
}
#layers li input#toggleCyclone ~ label {
  background-image: url("/images/btns_svg/btn_typhoon_off.svg");
}
#layers li input#toggleLiden:checked ~ label {
  background-image: url("/images/btns_svg/btn_thunder_on.svg");
}
#layers li input#toggleLiden ~ label {
  background-image: url("/images/btns_svg/btn_thunder_off.svg");
}
#layers li input#toggleEntln:checked ~ label {
  background-image: url("/images/btns_svg/btn_thunder_on.svg");
}
#layers li input#toggleEntln ~ label {
  background-image: url("/images/btns_svg/btn_thunder_off.svg");
}
#layers li input#toggleWave:checked ~ label {
  background-image: url("/images/btns_svg/btn_wave_on.svg");
}
#layers li input#toggleWave ~ label {
  background-image: url("/images/btns_svg/btn_wave_off.svg");
}
#layers li input#toggleSeaVisibility:checked ~ label {
  background-image: url('/images/btns_svg/btn_visibility_on.svg');
}
#layers li input#toggleSeaVisibility ~ label {
  background-image: url('/images/btns_svg/btn_visibility_off.svg');
}
#layers li input#toggleSurfaceTemperature:checked ~ label {
  background-image: url('/images/btns_svg/btn_sst_on.svg');
}
#layers li input#toggleSurfaceTemperature ~ label {
  background-image: url('/images/btns_svg/btn_sst_off.svg');
}
#layers li input#toggleSprayIcing:checked ~ label {
  background-image: url('/images/btns_svg/btn_sprayicing_on.svg');
}
#layers li input#toggleSprayIcing ~ label {
  background-image: url('/images/btns_svg/btn_sprayicing_off.svg');
}
#layers li input#toggleIce:checked ~ label {
  background-image: url('/images/btns_svg/btn_ice_on.svg');
}
#layers li input#toggleIce ~ label {
  background-image: url('/images/btns_svg/btn_ice_off.svg');
}
#layers li input#toggleERRM ~ label {
  background-image: url("/images/btns_svg/btn_ship_off.svg");
}
#layers li input#toggleERRM:checked ~ label {
  background-image: url("/images/btns_svg/btn_ship_on.svg");
}
#layers li input#toggleOC:checked ~ label {
  background-image: url("/images/btns_svg/btn_ecaArea_on.svg");
}
#layers li input#toggleOC ~ label {
  background-image: url("/images/btns_svg/btn_ecaArea_off.svg");
}
#layers li input#toggleVoyCom ~ label {
  background-image: url("/images/btns_svg/btn_ship_off.svg");
}
#layers li input#toggleVoyCom:checked ~ label {
  background-image: url("/images/btns_svg/btn_ship_on.svg");
}
.layerList_icon_desc {
  /* ツールチップのスタイル */
  position: absolute;
  padding: 2px 10px;
  left: 34%; /* 60px */
  border-radius: 10px; /* 角の丸み */
  transform: translate(0px, 6px);
  background-color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  color: #101010;
  text-align: center;
  /*visibility: hidden;*/ /* ツールチップを非表示に */
  opacity: 0; /* 不透明度を0％に */
  z-index: 1;
  transition: transform 0.5s, opacity 0.5s, top 0.1s; /* マウスオーバー時のアニメーション速度 */
  white-space: nowrap;
  user-select: none;
}
.layerList_icon_desc.show {
  opacity: 1;
  transform: translate(5px, 6px);
}
#layerList_icon li {
  position: relative;
}
</style>
