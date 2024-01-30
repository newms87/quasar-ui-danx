import { h } from 'vue'
import { QBadge } from 'quasar'

export default {
  name: 'TestTmp',

  setup () {
    return () => h(QBadge, {
      class: 'TestTmp',
      label: 'TestTmp'
    })
  }
}
