import { ref, onMounted } from 'vue'
import axios from 'axios'

export function useData () {
  const data = ref('')

  onMounted(async () => {
    const res = await axios.get('/json/sample.json')
    data.value = res.data.message
  })

  return { data }
}
