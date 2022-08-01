<template>
  <div
    id="app"
    class="allpane"
  >
    <!--div class="inputpane">
      &nbsp; Client code:
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
        @map-vessel-selected="mapVesselSelected"
      />
    </div>

    <div class="tablepane">
      <Table
        v-if="authorized"
        :customer-id="customerId"
        :errm-vessels="errmVessels"
        :table-focus-vessel="tableFocusVessel"
        @table-vessel-selected="tableVesselSelected"
      />
    </div>

    <div class="qspane">
      <div
        ref="container"
        class="h-full"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { loadMapConfig } from '../../scripts/mapConfig.js'
import Table from './components/Table.vue'
import Map from './components/Map.vue'
import { useAuth } from '../../plugins/auth'
import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'

// Common parameters
const { getToken, getUser } = useAuth()
const customerId = ref('')
const authorized = ref(false)
const config = reactive({})
const pathParams = ref({ shopName: 'vp' })
const mapFocusVessel = ref('')
const tableFocusVessel = ref('')
let dashboard

// For Table & Map components
const errmVessels = ref({})

// For QuickSight
const container = ref(null)

onMounted(async () => {
  const user = await getUser()
  const token = await getToken()
  customerId.value = user.customer_ids[0]
  // console.log(user.customer_ids[0])

  const mapConfigUrl = './map_config_menu4.json'
  config.value = await loadMapConfig(mapConfigUrl, null)
  console.log(config.value)

  pathParams.value.client = user.customer_ids[0]
  pathParams.value.application = 'gp'
  // console.log(pathParams.value)
  authorized.value = true
  // console.log(authorized.value)

  const res = await axios.get('/api/v1/quicksight', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      application: 'GP',
      content_id: 'gperrm',
      customer_id: user.customer_ids?.[0],
      user_name: user.email
    }
  })

  const options = {
    // url: 'https://ap-northeast-1.quicksight.aws.amazon.com/sn/embed/share/accounts/716990209761/dashboards/9e6e3e10-2ea8-4b32-bbba-d73d907687bb?directory_alias=sea-analytics',
    // url: 'https://ap-northeast-1.quicksight.aws.amazon.com/sn/embed/share/accounts/716990209761/dashboards/1cca6f7c-2ee4-4c0d-91d1-42cbe40d995c?directory_alias=sea-analytics',
    url: res.data.EmbedUrl,
    container: container.value,
    iframeResizeOnSheetChange: true,
    printEnabled: true,
    scrolling: 'auto',
    width: '100%',
    height: '100%',
    locale: 'en-US'
  }
  dashboard = QuickSightEmbedding.embedDashboard(options)

  getLatestERRM()
})

// Emit
const tableVesselSelected = selectedVessel => {
  console.log('table emit! ' + selectedVessel)
  mapFocusVessel.value = selectedVessel
  dashboard.setParameters({ IMO: [''] })
  dashboard.setParameters({ IMO: selectedVessel })
}
const mapVesselSelected = selectedVessel => {
  console.log('map emit! ' + selectedVessel)
  tableFocusVessel.value = selectedVessel
  dashboard.setParameters({ IMO: [''] })
  dashboard.setParameters({ IMO: selectedVessel })
}

// Create Table
const client = ref('')
let vesselList

const getLatestERRM = async () => {
  console.log('getVesselList')
  console.log('Client code: ', client.value)
  client.value = customerId.value

  if (client.value === '') {
    return false
  }

  // client.value = 'ZZZ'
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
  const tolerance = data.data.settings.tolerance_range
  console.log(vesselList)
  // console.log(allVessels)

  const urlLatest = 'https://tmax-b01.weathernews.com/T-Max/EnrouteRisk/api/reborn_get_latest_enrouterisk.cgi'
  const body = ['TEST', JSON.stringify({ ships: allVessels, group: '', client: client.value })]

  const errmJson = await fetch(urlLatest, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify(body)
  })
    .then((res) => res.json())
    .catch(console.error)

  // console.log(errmJson)

  if (errmJson.result === 'OK') {
    const vessels = errmJson.data
    // vessels.settings = tolerance
    for (let i = 0; i < vessels.length; i++) {
      vessels[i].tolerance_range = tolerance
    }
    errmVessels.value = vessels
  }
  console.log(errmVessels.value)
}
</script>

<style>
.allpane {
  display: grid;
  height: 100%;
  grid-template-rows: 8% 52% 40%;
  grid-template-columns: 70% 30%;
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

</style>
