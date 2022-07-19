<template>
  <div
    id="app"
    class="allpane"
  >
    <!--div class="inputpane">
      &nbsp Client code:
      <input
        v-model="client"
        class="perfin"
        type="text"
        placeholder=""
      >
      <button
        class="perfbtn"
        type="submit"
        @click="getLatestERRM"
      >
        Submit
      </button>
    </div-->

    <div class="mappane">
      <Map
        v-if="authorized"
        :customer-id="customerId"
        :config="config.value"
        :path-params="pathParams"
        :errm-vessels="errmVessels"
        :map-focus-vessel="mapFocusVessel"
      />
    </div>

    <div class="tablepane">
      <Table
        v-if="authorized"
        :customer-id="customerId"
        :errm-vessels="errmVessels"
        @table-vessel-selected="tableVesselSelected"
      />
    </div>

    <div class="qspane">
      <div
        ref="container"
        class="h-full"
      />
      <!--iframe
        width="960"
        height="720"
        src="https://ap-northeast-1.quicksight.aws.amazon.com/sn/embed/share/accounts/716990209761/dashboards/1cca6f7c-2ee4-4c0d-91d1-42cbe40d995c?directory_alias=sea-analytics"
      /-->
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { loadMapConfig } from '../../scripts/mapConfig.js'
// import values from '../../scripts/values/'
import Table from './components/Table.vue'
import Map from './components/Map.vue'
// import EasyDataTable from 'vue3-easy-data-table'
// import 'vue3-easy-data-table/dist/style.css'
import { useAuth } from '../../plugins/auth'
import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'

// Common parameters
const { getUser } = useAuth()
const customerId = ref('')
const authorized = ref(false)
const config = reactive({})
const pathParams = ref({ shopName: 'vp' })
const mapFocusVessel = ref('')

// Table component
const errmVessels = ref({})

// MapWidget
// const errmGeoJson = ref({})

// QS
const container = ref(null)

onMounted(async () => {
  const user = await getUser()
  customerId.value = user.customer_ids[0]
  // console.log(user.customer_ids[0])

  const mapConfigUrl = './map_config.json'
  config.value = await loadMapConfig(mapConfigUrl, null)
  console.log(config.value)

  pathParams.value.client = user.customer_ids[0]
  pathParams.value.application = 'gp'
  // console.log(pathParams.value)
  authorized.value = true
  // console.log(authorized.value)

  const options = {
    url: 'https://ap-northeast-1.quicksight.aws.amazon.com/sn/embed/share/accounts/716990209761/dashboards/1cca6f7c-2ee4-4c0d-91d1-42cbe40d995c?directory_alias=sea-analytics',
    container: container.value,
    iframeResizeOnSheetChange: true,
    printEnabled: true,
    scrolling: 'auto',
    width: '100%',
    height: '100%',
    locale: 'en-US'
  }
  QuickSightEmbedding.embedDashboard(options)

  getLatestERRM()
})

// Emit
const tableVesselSelected = selectedVessel => {
  console.log('emit! ' + selectedVessel)
  mapFocusVessel.value = selectedVessel
}

// Create Table
const client = ref('')
let vesselList

const getLatestERRM = async () => {
  /*
  console.log('getVesselList')
  console.log('Client code: ', client.value)

  if (client.value === '') {
    return false
  }
  */
  client.value = 'ZZZ'
  // const url = 'https://tmax-b01.weathernews.com/T-Max/api/reborn_get_vessel_list.cgi?search_type=file_name&val=all&client=' + client.value
  const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_setting_for_enrouterisk.cgi?client=' + client.value
  // const urlSetting = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_setting_for_enrouterisk.cgi?client=' + client.value + '&section=' + section + '&group=' + group
  const resp = await fetch(urlSetting)
  const data = await resp.json()
  console.log(data)
  if (data.result === 'OK') {
    vesselList = data.data.vessel_list
  }
  const allVessels = vesselList.map(ship => { return ship.wnishipnum }).join(',')
  console.log(vesselList)
  console.log(allVessels)

  const urlLatest = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_latest_enrouterisk.cgi'
  const body = ['TEST', JSON.stringify({ ships: allVessels, group: '', client: client.value })]

  const errmJson = await fetch(urlLatest, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body)
  })
    .then((res) => res.json())
    .catch(console.error)

  console.log(errmJson)

  if (errmJson.result === 'OK') {
    const vessels = errmJson.data
    errmVessels.value = vessels
  }
}
</script>

<style>
/*
.boxA {float: left; width: 70%; height: 100%}
.qspane {float: left; width: 30%; height: 720px}
*/

/*
.allpane {
  display: grid;
  height: 100vh;
  grid-template-rows: 5% 65% 30%;
  grid-template-columns: 100%;
}
.inputpane {
  grid-row: 1;
  grid-column: 1;
}
.boxA {
  grid-row: 2;
  grid-column: 1;
}
.qspane {
  grid-row: 3;
  grid-column: 1;
}
*/

.allpane {
  display: grid;
  height: 100%;
  grid-template-rows: 5% 55% 40%;
  grid-template-columns: 75% 25%;
}
/*
.inputpane {
  grid-row: 1;
  grid-column: 2;
}
*/
.mappane {
  grid-row: 1/3;
  grid-column: 1;
}
.tablepane {
  grid-row: 3;
  grid-column: 1;
  overflow-y: scroll;
  /* overflow-x: scroll; */
}
.qspane {
  grid-row: 1/4;
  grid-column: 2;
}

body {
  padding: 0;
  margin: 0;
}

#app {
  height: 100%;
}

/*
.operation-wrapper .operation-icon {
  width: 20px;
  cursor: pointer;
}
*/

</style>
