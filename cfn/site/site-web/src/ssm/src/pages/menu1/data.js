import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuth } from '../../plugins/auth'

export function useData () {
  const data = ref('')

  const { getToken } = useAuth()

  onMounted(async () => {
    const token = await getToken()
    const res = await axios.get('/customer/WNI/json/sample.json', { headers: { Authorization: `Bearer ${token}` } })
    data.value = res.data.message
  })

  return { data }
}
