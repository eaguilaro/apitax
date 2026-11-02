<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-xs">{{ t('balance.title') }}</div>
    <div class="text-body2 text-grey-7 q-mb-lg">
      {{ t('balance.intro') }}
    </div>

    <!-- El selector cambia el ejercicio completo; los botones de abajo seleccionan semanas dentro de ese ejercicio. -->
    <q-card class="q-mb-md">
      <q-card-section class="row items-center justify-between q-col-gutter-sm">
        <q-btn
          flat
          round
          icon="chevron_left"
          :aria-label="t('balance.previousFiscalYear')"
          :disable="anioFiscal <= 2000 || cargando"
          @click="cambiarAnioFiscal(-1)"
        />
        <div class="text-subtitle1 text-weight-medium text-center">
          {{ t('balance.fiscalPeriod', { start: anioFiscal, end: anioFiscal + 1 }) }}
        </div>
        <q-btn
          flat
          round
          icon="chevron_right"
          :aria-label="t('balance.nextFiscalYear')"
          :disable="anioFiscal >= anioFiscalActual || cargando"
          @click="cambiarAnioFiscal(1)"
        />
      </q-card-section>
    </q-card>

    <!-- Totales acumulados de julio a junio para el año fiscal elegido, independientes de la semana seleccionada. -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          {{ t('balance.fiscalTotals', { start: anioFiscal, end: anioFiscal + 1 }) }}
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-4">
            <div class="balance-metric bg-green-1 text-positive">
              <div class="text-caption">{{ t('balance.income') }}</div>
              <div class="text-h6">{{ formatoDinero(totalesAnioFiscal.totalIngresos) }}</div>
              <div class="text-caption">
                {{ t('balance.movements', { count: totalesAnioFiscal.cantidadIngresos }) }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="balance-metric bg-red-1 text-negative">
              <div class="text-caption">{{ t('balance.expenses') }}</div>
              <div class="text-h6">{{ formatoDinero(totalesAnioFiscal.totalGastos) }}</div>
              <div class="text-caption">
                {{ t('balance.movements', { count: totalesAnioFiscal.cantidadGastos }) }}
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div
              class="balance-metric"
              :class="totalesAnioFiscal.balance >= 0 ? 'bg-blue-1 text-primary' : 'bg-orange-1 text-negative'"
            >
              <div class="text-caption">{{ t('balance.fiscalBalance') }}</div>
              <div class="text-h6">{{ formatoDinero(totalesAnioFiscal.balance) }}</div>
              <div class="text-caption">
                {{ totalesAnioFiscal.balance >= 0 ? t('balance.positive') : t('balance.negative') }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Resumen de la semana activa; sus flechas recorren el calendario fiscal devuelto por la API. -->
    <q-card class="q-mb-md">
      <q-card-section class="row items-center q-col-gutter-sm">
        <div class="col">
          <div class="text-subtitle1 text-weight-medium">{{ t('balance.selectedWeek') }}</div>
          <div class="text-body2 text-grey-7">{{ etiquetaSemana(semanas[indiceSeleccionado]) }}</div>
        </div>
        <q-btn
          flat
          round
          icon="chevron_left"
          :aria-label="t('balance.previousWeek')"
          :disable="indiceSeleccionado <= 0 || cargando"
          @click="indiceSeleccionado -= 1"
        />
        <q-btn
          flat
          round
          icon="chevron_right"
          :aria-label="t('balance.nextWeek')"
          :disable="indiceSeleccionado >= semanas.length - 1 || cargando"
          @click="indiceSeleccionado += 1"
        />
      </q-card-section>

      <q-linear-progress v-if="cargando" indeterminate color="primary" />

      <!-- Métricas calculadas para la semana seleccionada en la gráfica o en el historial. -->
      <q-card-section v-if="semanaActual" class="row q-col-gutter-md">
        <div class="col-12 col-sm-4">
          <div class="balance-metric bg-green-1 text-positive">
            <div class="text-caption">{{ t('balance.income') }}</div>
            <div class="text-h6">{{ formatoDinero(semanaActual.totalIngresos) }}</div>
            <div class="text-caption">{{ t('balance.movements', { count: semanaActual.cantidadIngresos }) }}</div>
          </div>
        </div>
        <div class="col-12 col-sm-4">
          <div class="balance-metric bg-red-1 text-negative">
            <div class="text-caption">{{ t('balance.expenses') }}</div>
            <div class="text-h6">{{ formatoDinero(semanaActual.totalGastos) }}</div>
            <div class="text-caption">{{ t('balance.movements', { count: semanaActual.cantidadGastos }) }}</div>
          </div>
        </div>
        <div class="col-12 col-sm-4">
          <div
            class="balance-metric"
            :class="semanaActual.balance >= 0 ? 'bg-blue-1 text-primary' : 'bg-orange-1 text-negative'"
          >
            <div class="text-caption">{{ t('balance.net') }}</div>
            <div class="text-h6">{{ formatoDinero(semanaActual.balance) }}</div>
            <div class="text-caption">
              {{ semanaActual.balance >= 0 ? t('balance.positive') : t('balance.negative') }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ t('balance.trend') }}</div>
        <div class="text-caption text-grey-7 q-mb-md">
          {{ t('balance.fiscalWeeks', { count: semanas.length }) }}
        </div>

        <!-- La gráfica incluye todas las semanas del ejercicio, incluso las semanas sin movimientos. -->
        <div v-if="semanas.length" class="trend-chart">
          <svg
            viewBox="0 0 640 220"
            role="img"
            :aria-label="t('balance.chartLabel')"
            preserveAspectRatio="none"
          >
            <line x1="24" :y1="posicionCero" x2="616" :y2="posicionCero" class="chart-zero" />
            <polyline :points="puntosGrafica" class="chart-line" />
            <circle
              v-for="(punto, indice) in puntos"
              :key="semanas[indice].inicio"
              :cx="punto.x"
              :cy="punto.y"
              :r="indice === indiceSeleccionado ? 6 : 3.5"
              :class="indice === indiceSeleccionado ? 'chart-dot-selected' : 'chart-dot'"
            >
              <title>{{ etiquetaSemana(semanas[indice]) }}: {{ formatoDinero(semanas[indice].balance) }}</title>
            </circle>
          </svg>
          <div class="row justify-between text-caption text-grey-7">
            <span>{{ formatoFechaCorta(semanas[0].inicio) }}</span>
            <span>{{ formatoFechaCorta(semanas[semanas.length - 1].inicio) }}</span>
          </div>
        </div>
        <div v-else-if="!cargando" class="text-center text-grey-7 q-pa-lg">
          {{ t('balance.noWeeks') }}
        </div>
      </q-card-section>
    </q-card>

    <!-- El historial permite elegir cualquier semana para actualizar el resumen superior. -->
    <q-card>
      <q-card-section class="text-h6">{{ t('balance.history') }}</q-card-section>
      <q-list v-if="semanas.length" separator>
        <q-item
          v-for="(semana, indice) in semanas"
          :key="semana.inicio"
          clickable
          :active="indice === indiceSeleccionado"
          active-class="bg-blue-1"
          @click="indiceSeleccionado = indice"
        >
          <q-item-section>
            <q-item-label>{{ etiquetaSemana(semana) }}</q-item-label>
            <q-item-label caption>
              Ingresos {{ formatoDinero(semana.totalIngresos) }}
              · Gastos {{ formatoDinero(semana.totalGastos) }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-weight-bold" :class="semana.balance >= 0 ? 'text-positive' : 'text-negative'">
              {{ formatoDinero(semana.balance) }}
            </q-item-label>
            <q-item-label caption>{{ t('balance.weekBalance') }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-card-section v-else-if="!cargando" class="text-center text-grey-7">
        {{ t('balance.empty') }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import balanceService from '@/services/balanceService'
import { useI18n } from '@/i18n'

const $q = useQuasar()
const { locale, t } = useI18n()
const semanas = ref([])
const indiceSeleccionado = ref(0)
const cargando = ref(false)
const totalesAnioFiscal = ref({
  totalIngresos: 0,
  totalGastos: 0,
  balance: 0,
  cantidadIngresos: 0,
  cantidadGastos: 0
})

// El año fiscal se identifica por el año en que empieza: julio de 2026 pertenece a 2026–2027.
function obtenerAnioFiscalActual() {
  const hoy = new Date()
  return hoy.getMonth() >= 6 ? hoy.getFullYear() : hoy.getFullYear() - 1
}

const anioFiscalActual = obtenerAnioFiscalActual()
const anioFiscal = ref(anioFiscalActual)

// El índice permite que las flechas, la gráfica y la lista compartan la misma semana seleccionada.
const semanaActual = computed(() => semanas.value[indiceSeleccionado.value] || null)

// Convierte los saldos en coordenadas SVG; la línea de cero también aparece si todos los valores son positivos o negativos.
const posicionCero = computed(() => {
  if (!semanas.value.length) return 110
  const valores = semanas.value.map((semana) => semana.balance)
  const minimo = Math.min(0, ...valores)
  const maximo = Math.max(0, ...valores)
  if (maximo === minimo) return 110
  const rango = maximo - minimo || 1
  return 24 + (maximo / rango) * 172
})

const puntos = computed(() => {
  if (!semanas.value.length) return []
  const valores = semanas.value.map((semana) => semana.balance)
  const minimo = Math.min(0, ...valores)
  const maximo = Math.max(0, ...valores)
  if (maximo === minimo) {
    return valores.map((_, indice) => ({
      x: semanas.value.length === 1 ? 320 : 24 + (indice / (semanas.value.length - 1)) * 592,
      y: 110
    }))
  }
  const rango = maximo - minimo || 1
  const ancho = 592
  const alto = 172

  return valores.map((valor, indice) => ({
    x: semanas.value.length === 1 ? 320 : 24 + (indice / (semanas.value.length - 1)) * ancho,
    y: 24 + ((maximo - valor) / rango) * alto
  }))
})

const puntosGrafica = computed(() => puntos.value.map((punto) => `${punto.x},${punto.y}`).join(' '))

// La API envía fechas ISO sin hora; se formatean en UTC para evitar que cambien de día según la zona del teléfono.
function formatoDinero(valor) {
  return `$${Number(valor || 0).toLocaleString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function formatoFechaCorta(fecha) {
  return new Date(`${fecha}T00:00:00Z`).toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC'
  })
}

function etiquetaSemana(semana) {
  if (!semana) return t('common.loading')
  return `${formatoFechaCorta(semana.inicio)} – ${formatoFechaCorta(semana.fin)}`
}

// Recupera el ejercicio seleccionado y deja activa la semana actual, o la última si se consulta un año anterior.
async function cargarBalance() {
  cargando.value = true
  try {
    const { data } = await balanceService.obtenerBalanceSemanal(anioFiscal.value)
    semanas.value = data.data
    totalesAnioFiscal.value = data.totalesAnioFiscal

    const hoy = new Date().toISOString().slice(0, 10)
    const indiceSemanaActual = semanas.value.findIndex(
      (semana) => semana.inicio <= hoy && semana.fin >= hoy
    )
    indiceSeleccionado.value = indiceSemanaActual >= 0
      ? indiceSemanaActual
      : Math.max(0, semanas.value.length - 1)
  } catch (error) {
    semanas.value = []
    indiceSeleccionado.value = 0
    totalesAnioFiscal.value = {
      totalIngresos: 0,
      totalGastos: 0,
      balance: 0,
      cantidadIngresos: 0,
      cantidadGastos: 0
    }
    $q.notify({
      type: 'negative',
      message: t('balance.loadError'),
      position: 'top'
    })
  } finally {
    cargando.value = false
  }
}

// Permite consultar ciclos anteriores y evita avanzar a un ejercicio que todavía no ha comenzado.
async function cambiarAnioFiscal(cambio) {
  anioFiscal.value += cambio
  await cargarBalance()
}

onMounted(cargarBalance)
</script>

<style scoped lang="scss">
.balance-metric {
  min-height: 106px;
  padding: 16px;
  border-radius: 8px;
}

.trend-chart {
  width: 100%;
  overflow: hidden;
}

.trend-chart svg {
  display: block;
  width: 100%;
  height: 220px;
}

.chart-zero {
  stroke: #9e9e9e;
  stroke-dasharray: 5 5;
  stroke-width: 1;
}

.chart-line {
  fill: none;
  stroke: #1976d2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 3;
}

.chart-dot {
  fill: #1976d2;
}

.chart-dot-selected {
  fill: #e53935;
  stroke: #fff;
  stroke-width: 2;
}
</style>
