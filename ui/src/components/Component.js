import { h } from 'vue'
import { QBadge } from 'quasar'

export default {
  name: 'Danx',

  setup () {
    return () => h(QBadge, {
      class: 'Danx',
      label: 'Danx'
    })
  }
}
