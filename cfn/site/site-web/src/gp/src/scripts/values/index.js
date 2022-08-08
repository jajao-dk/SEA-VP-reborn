import dev from './_development'
import prd from './_production'

export default {
  ...(process.env.NODE_ENV === 'development' ? dev : prd)
}
