<template>
  <q-layout view="hHh Lpr fFf">
    <q-header v-if="authStore.authenticated" elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="menu"
          :aria-label="t('nav.openMenu')"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title>
          {{ t('app.title') }}
        </q-toolbar-title>
        <q-btn
          flat
          dense
          :label="locale === 'es' ? 'EN' : 'ES'"
          :aria-label="t('language.label')"
          @click="setLanguage(locale === 'es' ? 'en' : 'es')"
        />
        <q-btn
          flat
          round
          icon="add_a_photo"
          :aria-label="t('nav.newExpense')"
          to="/recibos"
        />
        <q-btn
          flat
          round
          icon="logout"
          :aria-label="t('nav.logout')"
          @click="cerrarSesion"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      v-if="authStore.authenticated"
      show-if-above
      bordered
      class="bg-grey-2"
    >
      <q-list>
        <q-item-label header class="text-primary">{{ t('nav.menu') }}</q-item-label>
        <q-item
          clickable
          v-ripple
          :active="$route.name === 'gastos'"
          to="/"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section>{{ t('nav.expenses') }}</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="$route.name === 'nuevo-gasto' || $route.name === 'editar-gasto'"
          to="/recibos"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="upload_file" />
          </q-item-section>
          <q-item-section>{{ t('nav.receipts') }}</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="$route.name === 'ingresos-semanales'"
          to="/ingresos"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="payments" />
          </q-item-section>
          <q-item-section>{{ t('nav.income') }}</q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :active="$route.name === 'resumen'"
          to="/resumen"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="analytics" />
          </q-item-section>
          <q-item-section>{{ t('nav.summary') }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          :active="$route.name === 'balance-semanal'"
          to="/balance"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="show_chart" />
          </q-item-section>
          <q-item-section>{{ t('nav.balance') }}</q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          :active="$route.name === 'mantenimiento'"
          to="/mantenimiento"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="build" />
          </q-item-section>
          <q-item-section>{{ t('nav.maintenance') }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="authStore.authenticated" bordered class="bg-white text-primary lt-sm">
      <q-tabs
        dense
        no-caps
        active-color="primary"
        indicator-color="primary"
        align="justify"
      >
        <q-route-tab
          to="/"
          icon="receipt_long"
          :label="t('nav.expenses')"
          :aria-label="t('nav.viewExpenses')"
        />
        <q-route-tab
          to="/recibos"
          icon="add_a_photo"
          :label="t('nav.capture')"
          :aria-label="t('nav.newExpense')"
        />
        <q-route-tab
          to="/ingresos"
          icon="payments"
          :label="t('nav.income')"
          :aria-label="t('nav.income')"
        />
        <q-route-tab
          to="/balance"
          icon="show_chart"
          :label="t('nav.balance')"
          :aria-label="t('nav.balance')"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from '@/i18n'

const leftDrawerOpen = ref(false)
const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const { locale, setLanguage, t } = useI18n()

function manejarSesionExpirada() {
  if (!authStore.authenticated) return
  authStore.clearSession()
  $q.notify({
    type: 'warning',
    message: t('auth.sessionExpired'),
    position: 'top'
  })
  router.replace('/login')
}

async function cerrarSesion() {
  try {
    await authStore.logout()
    await router.replace('/login')
  } catch (error) {
    if (error.response?.status === 401) {
      authStore.clearSession()
      await router.replace('/login')
      return
    }
    $q.notify({
      type: 'negative',
      message: t('auth.logoutFailed'),
      position: 'top'
    })
  }
}

onMounted(() => window.addEventListener('apitax:unauthorized', manejarSesionExpirada))
onUnmounted(() => window.removeEventListener('apitax:unauthorized', manejarSesionExpirada))
</script>

<style scoped lang="scss">
.q-header {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
