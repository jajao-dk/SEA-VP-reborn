import axios from 'axios'
import { useAuth } from '../../plugins/auth'

export function useAppItems () {
  const { getToken, getUser } = useAuth()

  return {
    async getAppItems () {
      const token = await getToken()
      const user = await getUser()

      try {
        const res = await axios.get(`/customer/${user.customer_ids?.[0]}/gp/system_setting/app_items.json`, { headers: { Authorization: `Bearer ${token}` } })
        return res.data
      } catch (error) {
        console.error(error)
        return {
          // Vessel CII Simulator
          gpvcs: {
            isEnabled: false
          },
          // TAP
          gptap: {
            isEnabled: false
          },
          // Enroute Rink Monitoring
          gperrm: {
            isEnabled: false
          },
          // Voyage Comparison
          gpvc: {
            isEnabled: false
          },
          // LegXML Dashboard
          emd: {
            isEnabled: true
          },
          // VDV Dashboard
          cimrd: {
            isEnabled: false
          },
          // Perfomance Evaluation
          gppe: {
            isEnabled: false
          },
        }
      }
    }
  }
}
