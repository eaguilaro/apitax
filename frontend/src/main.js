import { createApp } from 'vue'
import {
  Quasar,
  ClosePopup,
  Notify,
  QAvatar,
  QBanner,
  QBtn,
  QCard,
  QCardActions,
  QCardSection,
  QDialog,
  QDrawer,
  QFile,
  QFooter,
  QForm,
  QHeader,
  QIcon,
  QInput,
  QItem,
  QItemLabel,
  QItemSection,
  QLayout,
  QLinearProgress,
  QList,
  QPage,
  QPageContainer,
  QRouteTab,
  QSeparator,
  QSpace,
  QTable,
  QTabs,
  QTd,
  QToolbar,
  QToolbarTitle,
  Ripple
} from 'quasar'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

const app = createApp(App)

// Quasar core no registra todos los componentes automáticamente en una app Vite.
// Se registran aquí los componentes y directivas usados por las páginas del proyecto.
app.use(Quasar, {
  components: {
    QAvatar,
    QBanner,
    QBtn,
    QCard,
    QCardActions,
    QCardSection,
    QDialog,
    QDrawer,
    QFile,
    QFooter,
    QForm,
    QHeader,
    QIcon,
    QInput,
    QItem,
    QItemLabel,
    QItemSection,
    QLayout,
    QLinearProgress,
    QList,
    QPage,
    QPageContainer,
    QRouteTab,
    QSeparator,
    QSpace,
    QTable,
    QTabs,
    QTd,
    QToolbar,
    QToolbarTitle
  },
  directives: { ClosePopup, Ripple },
  plugins: { Notify },
  config: {
    notify: {},
    loading: {}
  }
})

app.use(createPinia())
app.use(router)
app.mount('#app')
