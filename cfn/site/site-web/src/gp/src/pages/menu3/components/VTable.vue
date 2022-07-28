<template>
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
        <th>Cargo Name</th>
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
        <th>Commision [%]</th>
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
          <button
            type="submit"
            class="perfbtn"
            @click="calcCost(item)"
          >
            CALC
          </button>
        </td>
      </tr>
      <tr />
      <tr>
        <th>Days</th>
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
        <th>DOGO cost [USD/MT]</th>
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
        <th>Total DOGOC [USD]</th>
        <td
          v-for="item in items"
          :key="item.id"
          style="text-align:right"
        >
          {{ item.total_dogoc }}
        </td>
      </tr>
      <tr>
        <th>Inport days</th>
        <td
          v-for="item in items"
          :key="item.id"
          style="text-align:right"
        >
          {{ item.inport_days }}
        </td>
      </tr>
      <tr>
        <th>Inport FOC [MT/day]</th>
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
        <th>Port charge [USD]</th>
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
        <th>Passage cost [USD]</th>
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
        <th>EXPENSE [USD]</th>
        <td
          v-for="item in items"
          :key="item.id"
          style="text-align:right"
        >
          {{ item.expense }}
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
        <th>TC equivalent</th>
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
    </tbody>
  </table>
</template>
<script setup>
import { ref, reactive } from 'vue'

const items = ref([])
items.value = [
  {
    id: 1,
    plan_name: 'plan A',
    revenue: 0,
    cargo: '',
    freight: 0,
    quantity: 0,
    commision: 0,
    income: 0,
    expense: 0,
    days: 20.1,
    fo: 246.3,
    dogo: 9,
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
  },
  {
    id: 2,
    plan_name: 'plan B',
    revenue: 0,
    cargo: '',
    freight: 0,
    quantity: 0,
    commision: 0,
    income: 0,
    expense: 0,
    days: 13.1,
    fo: 440.3,
    dogo: 20.7,
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

]

const calcIncome = (val) => {
  console.log(val)
  // val.number = val.tmp
  const item = items.value.find((item) => item.id === val.id)
  item.freight = val.freight
  item.quantity = val.quantity
  item.commision = val.commision
  item.revenue = item.freight * item.quantity
  item.income = item.freight * item.quantity * (1 - item.commision / 100)
  console.log(item.id)
  console.log(item.commision / 100)
}

const calcCost = (val) => {
  console.log(val)
  // val.number = val.tmp
  const item = items.value.find((item) => item.id === val.id)
  // calculate revenue and income
  item.freight = val.freight
  item.quantity = val.quantity
  item.commision = val.commision
  item.revenue = item.freight * item.quantity
  item.income = item.freight * item.quantity * (1 - item.commision / 100)
  // calculate expense
  item.hire = val.hire
  item.fo = val.fo
  item.dogo = val.dogo
  item.import_foc = val.import_foc
  item.port_charge = val.port_charge
  item.passage = val.passage
  item.total_hire = Math.round(item.hire * item.days)
  item.total_foc = Math.round(item.fo * item.foc)
  item.total_dogoc = Math.round(item.dogo * item.dogoc)
  item.expense = Math.round(item.total_hire + item.total_foc + item.total_dogoc + item.inport_days * item.inport_foc + item.port_charge + item.passage)
  // others
  item.profit = Math.round(item.income - item.expense)
  item.tc_equiv = Math.round(item.profit / (item.days + item.inport_days))
  console.log(item.id)
}

const editHire = (val) => {
  console.log(val)
  console.log(val.hire)
  // val.number = val.tmp
  const item = items.value.find((item) => item.id === val.id)
  item.hire = parseInt(val.hire)
  item.total = parseInt(item.hire) + item.fo + item.go
  console.log(item.id)
  console.log(item.hire)
}
const editFo = (val) => {
  console.log(val)
  console.log(val.fo)
  // val.number = val.tmp
  const item = items.value.find((item) => item.id === val.id)
  item.fo = parseInt(val.fo)
  item.total = item.hire + parseInt(item.fo) + item.go
  console.log(item.id)
  console.log(item.fo)
}
const editGo = (val) => {
  console.log(val)
  console.log(val.go)
  // val.number = val.tmp
  const item = items.value.find((item) => item.id === val.id)
  item.go = parseInt(val.go)
  item.total = item.hire + item.fo + parseInt(item.go)
  console.log(item.id)
  console.log(item.go)
}
</script>
<style scoped>
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input {
  border: 2px solid blue;
  width: 100px;
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

table {
  font-size: 10px;
}

th,td {
  border: solid 1px;
  padding: 1px;
}
</style>
