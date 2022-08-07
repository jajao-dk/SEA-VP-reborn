<template>
  <div class="vtableplane">
    <table
      id="comparison"
      border="1"
      style="border-collapse: collapse"
    >
      <tbody align="center">
        <tr>
          <th>PLAN</th>
          <td
            v-for="item in items"
            :key="item.id"
            class="site-name"
          >
            {{ item.plan_name }}
          </td>
        </tr>
        <tr>
          <th>Revenue [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
            class="site-name"
            style="text-align:right"
          >
            {{ item.revenue }}
          </td>
        </tr>
        <tr>
          <th>Cargo type</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.cargo"
              type="text"
              class="form-control"
            >
          </td>
        </tr>
        <tr>
          <th>Freight [USD/MT]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.freight"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>Quantity [MT]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.quantity"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>Commission [%]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.commision"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>INCOME [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.income }}
          <!--button
            type="submit"
            class="perfbtn"
            @click="calcCost(item)"
          >
            CALC
          </button-->
          </td>
        </tr>
        <tr />
        <tr>
          <th>Ocean days</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.days }}
          </td>
        </tr>
        <tr>
          <th>IFO [MT]</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.fo }}
          </td>
        </tr>
        <tr>
          <th>LSDO/GO [MT]</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.dogo }}
          </td>
        </tr>
        <tr>
          <th>Hire cost [USD/day]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.hire"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>FO cost [USD/MT]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.foc"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>DO/GO cost [USD/MT]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.dogoc"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>Total hire [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.total_hire }}
          </td>
        </tr>
        <tr>
          <th>Total FOC [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.total_foc }}
          </td>
        </tr>
        <tr>
          <th>Total DO/GO [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.total_dogoc }}
          </td>
        </tr>
        <tr>
          <th>In port days</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.inport_days }}
          </td>
        </tr>
        <tr>
          <th>In port FOC [MT/day]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.inport_foc"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>Port charges [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.port_charge"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>Passage costs [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
          >
            <input
              v-model="item.passage"
              type="number"
              class="form-control"
              style="text-align:right"
            >
          </td>
        </tr>
        <tr>
          <th>TOTAL COSTS [USD]</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.expense }}
          <!--button
            type="submit"
            class="perfbtn"
            @click="calcCost(item)"
          >
            CALC
          </button-->
          </td>
        </tr>
        <tr>
          <th>PROFIT</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.profit }}
          </td>
        </tr>
        <tr>
          <th>TCE</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.tc_equiv }}
          </td>
        </tr>
        <tr>
          <th>CO2</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.co2 }}
          </td>
        </tr>
        <tr>
          <th>CII</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:right"
          >
            {{ item.cii }}
          </td>
        </tr>
        <tr>
          <th>Calculation</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:center"
          >
            <button
              type="submit"
              class="perfbtn"
              @click="calcCost(item)"
            >
              CALC
            </button>
          </td>
        </tr>
        <tr>
          <th>Delete</th>
          <td
            v-for="item in items"
            :key="item.id"
            style="text-align:center"
          >
            <button
              type="submit"
              class="perfbtn"
              @click="deleteColumn(item)"
            >
              DEL
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, reactive, defineProps, watch, toRefs, onMounted } from 'vue'

const props = defineProps({
  customerId: { type: String, default: '' },
  voyageData: { type: Object, default: () => {} }
})

// Events, new data
const { voyageData } = toRefs(props)
watch(voyageData, (newValue) => {
  console.log('Voyage Data update')
  console.log(newValue)
  createVTable(newValue)
}, { deep: true })

const items = ref([])
let uniqId = -1
// items.value = [

const initVoyageData = () => {
  for (let i = 0; i < 3; i++) {
    const tmpData = {
      id: uniqId++,
      used: false, // true: real-data, false, dummy-data
      plan_name: 'plan-' + String(uniqId + 1),
      revenue: 0,
      cargo: '',
      freight: 0,
      quantity: 0,
      commision: 0,
      income: 0,
      expense: 0,
      days: 0,
      fo: 0,
      dogo: 0,
      hire: 0,
      foc: 0,
      dogoc: 0,
      total_hire: 0,
      total_foc: 0,
      total_dogoc: 0,
      inport_days: 0,
      inport_foc: 0,
      port_charge: 0,
      passage: 0,
      profit: 0,
      tc_equiv: 0,
      co2: 0,
      cii: 0
    }
    items.value.push(tmpData)
  }
}

onMounted(() => {
  initVoyageData()
})

const createVTable = (newValue) => {
  console.log('CREATE TABLE')
  console.log(newValue)

  let allUsed = true
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[i].used === true) {
      continue
    } else {
      allUsed = false
      items.value[i].days = Math.round(newValue.total_days * 10) / 10
      items.value[i].fo = Math.round(newValue.total_ifo * 10) / 10
      items.value[i].dogo = Math.round(newValue.total_lsdogo * 10) / 10
      items.value[i].inport_days = Math.round(newValue.total_inport_days * 10) / 10
      items.value[i].co2 = Math.round(newValue.total_co2 * 10) / 10
      items.value[i].used = true
      break
    }
  }

  if (allUsed) {
    const newItem = {
      // id: items.value.length + 1,
      id: uniqId++,
      used: true, // true: real-data, false, dummy-data
      plan_name: 'plan-' + String(uniqId + 1),
      revenue: 0,
      cargo: '',
      freight: 0,
      quantity: 0,
      commision: 0,
      income: 0,
      expense: 0,
      days: Math.round(newValue.total_days * 10) / 10,
      fo: Math.round(newValue.total_ifo * 10) / 10,
      dogo: Math.round(newValue.total_lsdogo * 10) / 10,
      hire: 0,
      foc: 0,
      dogoc: 0,
      total_hire: 0,
      total_foc: 0,
      total_dogoc: 0,
      inport_days: Math.round(newValue.total_inport_days * 10) / 10,
      inport_foc: 0,
      port_charge: 0,
      passage: 0,
      profit: 0,
      tc_equiv: 0,
      co2: Math.round(newValue.total_co2 * 10) / 10,
      cii: 0
    }
    items.value.push(newItem)
  }
  console.log(items.value)
}

const calcCost = (val) => {
  console.log(val)
  // val.number = val.tmp
  const item = items.value.find((item) => item.id === val.id)
  // calculate revenue and income
  item.freight = val.freight
  item.quantity = val.quantity
  item.commision = val.commision
  const tmpRevenue = val.freight * val.quantity
  item.revenue = tmpRevenue.toLocaleString()
  const tmpIncome = val.freight * val.quantity * (1 - val.commision / 100)
  item.income = (tmpIncome).toLocaleString()
  // calculate expense
  item.hire = val.hire
  item.fo = val.fo
  item.dogo = val.dogo
  item.inport_foc = val.inport_foc
  item.port_charge = val.port_charge
  item.passage = val.passage
  const tmpTotalHire = val.hire * val.days
  item.total_hire = Math.round(tmpTotalHire).toLocaleString()
  const tmpTotalFoc = val.fo * val.foc
  item.total_foc = Math.round(tmpTotalFoc).toLocaleString()
  const tmpTotalDogoc = val.dogo * val.dogoc
  item.total_dogoc = Math.round(tmpTotalDogoc).toLocaleString()
  const tmpExpense = tmpTotalHire + tmpTotalFoc + tmpTotalDogoc + val.inport_days * val.inport_foc * val.dogoc + val.port_charge + val.passage
  item.expense = Math.round(tmpExpense).toLocaleString()
  // others
  const tmpProfit = tmpIncome - tmpExpense
  item.profit = Math.round(tmpProfit).toLocaleString()
  const tmpTcEquiv = tmpProfit / (val.days + val.inport_days)
  item.tc_equiv = Math.round(tmpTcEquiv).toLocaleString()
  console.log(item.id)
}

const deleteColumn = (val) => {
  console.log(val)
  console.log('delete column')
  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i]
    if (item.id === val.id) {
      items.value.splice(i, 1)
      break
    }
  }
  console.log(items)
}
</script>
<style scoped>
.vtableplane{
  height: 80vh;
  font-size: 12px;
  /* overflow: auto; */
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input {
  border: 2px solid blue;
  width: 80px;
  margin-bottom: 2px;
}

select {
  border: 2px solid blue;
  width: 100px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 1px 1px;
  /* margin: 3px 0; */
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
/*
table {
  font-size: 12px;
  overflow: scroll;
}
*/
th,td {
  border: solid 1px;
  padding: 1px;
}
</style>
