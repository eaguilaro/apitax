import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from '@/i18n'

// Importar componentes
const ListadoGastos = () => import('@/pages/ListadoGastos.vue')
const NuevoGasto = () => import('@/pages/NuevoGasto.vue')
const ResumenGastos = () => import('@/pages/ResumenGastos.vue')
const Login = () => import('@/pages/Login.vue')

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { public: true, title: 'auth.loginTitle' }
  },
  {
    path: '/',
    name: 'gastos',
    component: ListadoGastos,
    meta: { title: 'nav.expenses' }
  },
  {
    path: '/recibos',
    name: 'nuevo-gasto',
    component: NuevoGasto,
    meta: { title: 'nav.receipts' }
  },
  {
    path: '/nuevo',
    redirect: '/recibos'
  },
  {
    path: '/editar/:id',
    name: 'editar-gasto',
    component: NuevoGasto,
    meta: { title: 'expense.editTitle' }
  },
  {
    path: '/ingresos',
    name: 'ingresos-semanales',
    component: () => import('@/pages/IngresosSemanales.vue'),
    meta: { title: 'income.title' }
  },
  {
    path: '/resumen',
    name: 'resumen',
    component: ResumenGastos,
    meta: { title: 'summary.title' }
  },
  {
    path: '/balance',
    name: 'balance-semanal',
    component: () => import('@/pages/BalanceSemanal.vue'),
    meta: { title: 'balance.title' }
  },
  {
    path: '/mantenimiento',
    name: 'mantenimiento',
    component: () => import('@/pages/Mantenimiento.vue'),
    meta: { title: 'maintenance.title' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  const { t } = useI18n()

  document.title = `${t(to.meta.title || 'app.title')} - API TAX`
  if (to.meta.public) {
    if (authStore.authenticated) return '/'
    return true
  }

  try {
    if (!authStore.initialized && !authStore.authenticated) {
      await authStore.refreshSession()
    }
    return authStore.authenticated ? true : '/login'
  } catch {
    return '/login'
  }
})

export default router
