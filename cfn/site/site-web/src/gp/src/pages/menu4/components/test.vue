<template>
  <!--div>
  <h1>{{ props.msg }}</h1>
  <button @click="increment">count is: {{ count }}</button>
  <p>Edit <code>components/HelloWorld.vue</code> to test hot module replacement.</p>
</div-->
  <div class="tableplane">
    <Vue3EasyDataTable
      v-model:items-selected="itemsSelected"
      dense
      header-background-color="#ddd"
      :headers="headers"
      :items="items"
      fixed-header
      max-height="2"
    />
    <br>
    items selected <br>
    {{ itemsSelected }}
  </div>
<!--TableLite
    :has-checkbox="true"
    :is-loading="table.isLoading"
    :is-re-search="table.isReSearch"
    :columns="table.columns"
    :rows="table.rows"
    :total="table.totalRecordCount"
    :sortable="table.sortable"
    :messages="table.messages"
    @do-search="doSearch"
    @is-finished="tableLoadingFinish"
    @return-checked-rows="updateCheckedRows"
></TableLite-->
</template>

<script setup>
import { reactive, ref, defineProps } from 'vue'
import Vue3EasyDataTable from 'vue3-easy-data-table'
// import TableLite from 'vue3-table-lite'
import 'vue3-easy-data-table/dist/style.css'

/*
  const count = ref('')
  const table = reactive({
    isLoading: false,
    isReSearch: false,
    columns: [
      {
        label: "ID",
        field: "id",
        width: "3%",
        sortable: true,
        isKey: true,
      },
      {
        label: "Name",
        field: "name",
        width: "10%",
        sortable: true,
        display: function (row) {
          return (
            '<a href="#" data-id="' + row.user_id + '" class="name-btn">' + row.name + "</button>"
          );
        },
      },
      {
        label: "Email",
        field: "email",
        width: "15%",
        sortable: true,
      },
      {
        label: "",
        field: "quick",
        width: "10%",
        display: function (row) {
          return (
            '<button type="button" data-id="' + row.user_id + '" class="quick-btn">Button</button>'
          );
        },
      },
    ],
    rows: [
        {
          id: 1,
          name: "TEST1"
        },
        {
          id: 2,
          name: "TEST2"
        }
    ],
    totalRecordCount: 2,
    sortable: {
      order: "id",
      sort: "asc",
    },
    messages: {
      pagingInfo: "Showing {0}-{1} of {2}",
      pageSizeChangeLabel: "Row count:",
      gotoPageLabel: "Go to page:",
      noDataAvailable: "No data",
    },
  })

  const doSearch = (offset, limit, order, sort) => {
    table.isLoading = true;
    table.isReSearch = offset == undefined ? true : false;
    // do your search event to get newRows and new Total
    table.rows = newRows;
    table.totalRecordCount = newTotal;
    table.sortable.order = order;
    table.sortable.sort = sort;
  };

  const tableLoadingFinish = (elements) => {
    table.isLoading = false;
    Array.prototype.forEach.call(elements, function (element) {
      if (element.classList.contains("name-btn")) {
        element.addEventListener("click", function () {
          // do your click event
          console.log(this.dataset.id + " name-btn click!!");
        });
      }
      if (element.classList.contains("quick-btn")) {
        // do your click event
        element.addEventListener("click", function () {
          console.log(this.dataset.id + " quick-btn click!!");
        });
      }
    });
  };

  const updateCheckedRows = (rowsKey) => {
    // do your checkbox click event
    console.log(rowsKey);
  };
  */

const itemsSelected = ref([])
const headers = ref([
  { text: 'PLAYER', value: 'player', fixed: 'true' },
  { text: 'TEAM', value: 'team' },
  { text: 'NUMBER', value: 'number' },
  { text: 'POSITION', value: 'position' },
  { text: 'HEIGHT', value: 'height' },
  { text: 'WEIGHT (lbs)', value: 'weight', sortable: true },
  { text: 'LAST ATTENDED', value: 'lastAttended' },
  { text: 'COUNTRY', value: 'country' }
])
const items = ref([
  {
    player: 'Stephen Curry',
    team: 'GSW',
    number: 30,
    position: 'G',
    height: '6-2',
    weight: 185,
    lastAttended: 'Davidson',
    country: 'USA'
  },
  {
    player: 'Lebron James',
    team: 'LAL',
    number: 6,
    position: 'F',
    height: '6-9',
    weight: 250,
    lastAttended: 'St. Vincent-St. Mary HS (OH)',
    country: 'USA'
  },
  {
    player: 'Kevin Durant',
    team: 'BKN',
    number: 7,
    position: 'F',
    height: '6-10',
    weight: 240,
    lastAttended: 'Texas-Austin',
    country: 'USA'
  },
  {
    player: 'Giannis Antetokounmpo',
    team: 'MIL',
    number: 34,
    position: 'F',
    height: '6-11',
    weight: 242,
    lastAttended: 'Filathlitikos',
    country: 'Greece'
  }
])
const props = defineProps({
  msg: String
})

const increment = () => {
  count.value++
}
</script>

<style scoped>
.tableplane {
  width: 100%;
  height: 100%;
  overflow: scroll;
}
</style>
