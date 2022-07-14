<script setup>
// import { useData } from './data'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../../plugins/auth'

const { getToken, getUser } = useAuth()

onMounted(async () => {
  const token = await getToken()
  const user = await getUser()
  console.log(token)
  console.log(user.customer_ids[0])
  const res = await axios.get(`/customer/${user.customer_ids[0]}/ssm/data/vessel/section-alert.json`, { headers: { Authorization: `Bearer ${token}` } })
  console.log(res.data)
})

// const { data } = useData()
const legid1 = ref('sid20220430_000311')
const legid2 = ref('sid20220430_000349')

const rpmEventHandler = async () => {
  console.log('RPM event')
  console.log('legid1: ', legid1.value)
  console.log('legid2: ', legid2.value)
  const url = 'https://yx479pb6pk.execute-api.ap-northeast-1.amazonaws.com/Prod/import_leg/'
  // const tmp_post = {source: "sid20220430_000311", target: "sid20220430_000349"}
  const tmp_post = { source: legid1.value, target: legid2.value }
  const post_msg = JSON.stringify(tmp_post)
  fetch(url, { mode: 'cors', method: 'POST', body: post_msg })
    .then(response => {
      if (!response.ok) { throw new Error() }
      return response.text()
    })
    .then(text => { console.log(text) })
  return false
}

</script>

<template>
  <!-- div>{{ data }}</div-->
  <div class="rpm">
    VUE-TEST-TAKAO:<br><br>
    <form
      novalidate
      @submit.prevent="onSubmit"
    >
      <!-- div class="field"-->
      Input LEG-ID1
      <input
        v-model="legid1"
        class="simbtn"
        type="text"
        placeholder="sid20220430_000311"
      >
      Input LEG-ID2
      <input
        v-model="legid2"
        class="simbtn"
        type="text"
        placeholder="sid20220430_000349"
      ><br><br>
      <!-- /div-->
      <button
        class="simbtn"
        type="submit"
        @click="rpmEventHandler"
      >
        Submit
      </button>
    </form>
  </div>
</template>

<style>
.rpm {
  /* position: relative; */
  position: absolute;
  top: 50px;
  left: 80px;
  width: 170px;
  height: 30px;
  display: inline-block;
  z-index: 5;
}
.simbtn {
  background-color: #ddd;
  color: #333;
  padding: 5px;
  font-size: 16px;
  min-width: 170px;
  border: solid 1px;
  border-color: #888;
  cursor: pointer;
  z-index: 5;
}
.simbtn:hover {
  background-color: #bbb;
}
</style>
