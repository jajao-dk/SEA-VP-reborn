<script setup>
import { useData } from './data'

const { data } = useData()
</script>

<template>
  <!-- div>{{ data }}</div-->
  <div class="tap">
    <iframe
      id="TAP mockup"
      title="TAP mockup with mapbox"
      src="https://d6mw5wbrp0lzx.cloudfront.net/map/customers/ssm-with-tap/nyk/index.html"
    />
  </div>
</template>

<style scoped>

.tap {
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: 100vh;
}

iframe {
  border:none;
  width:100%;
  height:100%;
}
</style>
