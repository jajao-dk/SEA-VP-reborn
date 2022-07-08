<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../plugins/auth'
import * as QuickSightEmbedding from 'amazon-quicksight-embedding-sdk'
import {
  set as gtagSet,
  pageview as gtagPageview,
  optIn as gtagOptin,
  event as gtagEvent,
  customMap as gtagCustomMap,
} from 'vue-gtag'

const container = ref(null)
let mapWindow = {}

const { getToken, getUser } = useAuth()

let dashboard

const onchangedQsParameters = (payload) => {
  if (Object.keys(mapWindow).length) {
    for (const i in payload.changedParameters) {
      switch (payload.changedParameters[i].name) {
        case 'VesselName':
          if (payload.changedParameters[i].value !== 'All') {
            mapWindow.postMessage({ messageType: 'selectVesselFromQsToMap', vesselName: [payload.changedParameters[i].value] })
          }
      }
    }
  }
}

const onMessage = (event) => {
  if (event.origin === location.origin && event.data) {
    switch (event.data.messageType) {
      case 'openWindow':
        window.open(event.data.url, event.data.windowName)
        break
      case 'initSetMapWindow':
        // map windowを登録
        mapWindow = event.source
        break
      /*
      case 'selectVesselFromMapToQs':
        // vesselNameをQS側に送る
        console.log('selectVesselFromMapToQs')
        console.log(event.data.vesselName)
        // test
        dashboard.setParameters({ VesselName: [' '] })
        dashboard.setParameters({ VesselName: event.data.vesselName })
        break
      */
    }
  }
}

window.addEventListener('message', onMessage, false)

onMounted(async () => {
  const token = await getToken()
  const user = await getUser()
  const res = await axios.get('/api/v1/quicksight',{
    headers: { Authorization: `Bearer ${token}` },
    params: {
      application: 'SSM',
      customer_id: user.customer_ids?.[0],
      user_name: user.email
    }
  })

  const options = {
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
  // changed Paramater
  dashboard.on('parametersChange', onchangedQsParameters)

  /*
  // reload
  const reload = () => {
      let dashboardVesselParameters = '';
      dashboard.getActiveParameterValues(function(value){
        dashboardVesselParameters = value['parameters'][1]['value']
        if (dashboardVesselParameters == ['All']){
          dashboard.setParameters({VesselName:[' ']});
        }else{
          dashboard.setParameters({VesselName:['All']});
        }
        dashboard.setParameters({VesselName: dashboardVesselParameters});
      });
  }
  setInterval(reload, 3600000);
  */

  gtagOptin() // gtag.js にて、プラグイン登録時にプラグイン無効化しているので、ここで有効化する

  // GA4用の記述
  gtagSet('user_id', user.email)
  gtagSet('user_properties', {login_id: user.email, customer_id: user.customer_ids?.[0]})
  // UA用の記述
  gtagCustomMap('dimension1', 'login_id')
  gtagCustomMap('dimension2', 'customer_id')
  gtagEvent('custom_dimension', { login_id: user.email, customer_id: user.customer_ids?.[0] })

  // pageview送信
  gtagPageview(location.href)
  
})
</script>

<template>
  <div
    ref="container"
    class="h-full"
  />
</template>
