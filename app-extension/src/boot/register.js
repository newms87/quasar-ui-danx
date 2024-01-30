import { boot } from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-danx'

export default boot(({ app }) => {
  app.use(VuePlugin)
})
