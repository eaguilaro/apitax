<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-xs">{{ t('income.title') }}</div>
    <div class="text-body2 text-grey-7 q-mb-lg">
      {{ t('income.intro') }}
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-5">
        <q-card>
          <q-toolbar class="bg-positive text-white">
            <q-toolbar-title>{{ t('income.register') }}</q-toolbar-title>
          </q-toolbar>
          <q-form ref="formularioRef" class="q-pa-md q-gutter-md" @submit.prevent="guardar">
            <q-input
              v-model="formulario.concepto"
              :label="t('income.concept')"
              outlined
              maxlength="100"
              :rules="[val => !!val.trim() || t('income.conceptRequired')]"
            />
            <q-input
              v-model="formulario.detalle"
              :label="t('income.detail')"
              type="textarea"
              rows="3"
              outlined
              maxlength="500"
              :rules="[val => !!val.trim() || t('income.detailRequired')]"
            />
            <q-input
              v-model.number="formulario.valor"
              :label="t('income.amount')"
              type="number"
              min="0.01"
              step="0.01"
              outlined
              :rules="[val => Number(val) > 0 || t('income.amountPositive')]"
            />
            <q-input
              v-model="formulario.fecha"
              :label="t('income.date')"
              type="date"
              outlined
              :rules="[val => Boolean(val) || 'La fecha es obligatoria']"
            />
            <div class="row justify-end">
              <q-btn
                type="submit"
                color="positive"
                unelevated
                icon="save"
                :label="t('income.save')"
                :loading="guardando"
              />
            </div>
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card>
          <q-card-section class="row items-center q-col-gutter-sm">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">{{ t('income.selectedWeek') }}</div>
              <div class="text-body2 text-grey-7">{{ etiquetaSemana }}</div>
            </div>
            <q-btn flat round icon="chevron_left" :aria-label="t('income.previousWeek')" @click="cambiarSemana(-1)" />
            <q-btn flat round icon="today" :aria-label="t('income.currentWeek')" @click="irASemanaActual" />
            <q-btn flat round icon="chevron_right" :aria-label="t('balance.nextWeek')" @click="cambiarSemana(1)" />
          </q-card-section>

          <q-separator />

          <q-card-section class="bg-green-1">
            <div class="text-caption text-grey-8">{{ t('income.weekTotal') }}</div>
            <div class="text-h4 text-positive">{{ formatoDinero(totalSemanal) }}</div>
            <div class="text-caption text-grey-8">{{ ingresos.length }} {{ t('income.movements') }}</div>
          </q-card-section>

          <q-linear-progress v-if="cargando" indeterminate color="positive" />

          <q-list v-if="!cargando && ingresos.length" separator>
            <q-item v-for="ingreso in ingresos" :key="ingreso._id" class="q-py-md">
              <q-item-section avatar>
                <q-avatar color="green-1" text-color="positive" icon="payments" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ ingreso.concepto }}</q-item-label>
                <q-item-label caption>{{ ingreso.detalle }}</q-item-label>
                <q-item-label caption>{{ formatoFecha(ingreso.fecha) }}</q-item-label>
              </q-item-section>
              <q-item-section side top class="text-weight-bold text-positive">
                {{ formatoDinero(ingreso.valor) }}
              </q-item-section>
            </q-item>
          </q-list>

          <q-card-section v-else-if="!cargando" class="text-center text-grey-7 q-pa-xl">
            <q-icon name="event_busy" size="48px" class="q-mb-sm" />
            <div>{{ t('income.empty') }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import ingresoService from '@/services/ingresoService'
import { useI18n } from '@/i18n'

const $q = useQuasar()
const { locale, t } = useI18n()
const ingresos = ref([])
const cargando = ref(false)
const guardando = ref(false)
const formularioRef = ref(null)
const semanaSeleccionada = ref(inicioSemana(new Date()))
const formulario = ref({
  concepto: '',
  detalle: '',
  valor: '',
  fecha: fechaLocal(new Date())
})

const rangoSemana = computed(() => {
  const inicio = new Date(semanaSeleccionada.value)
  const fin = new Date(inicio)
  fin.setDate(fin.getDate() + 6)
  return { inicio, fin }
})

const etiquetaSemana = computed(() => {
  const opciones = { day: '2-digit', month: 'short', year: 'numeric' }
  const inicio = rangoSemana.value.inicio.toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', opciones)
  const fin = rangoSemana.value.fin.toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', opciones)
  return `${inicio} – ${fin}`
})

const totalSemanal = computed(() =>
  ingresos.value.reduce((total, ingreso) => total + Number(ingreso.valor), 0)
)

function fechaLocal(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

function inicioSemana(fecha) {
  const inicio = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  const diasDesdeLunes = (inicio.getDay() + 6) % 7
  inicio.setDate(inicio.getDate() - diasDesdeLunes)
  return inicio
}

function formatoDinero(valor) {
  return `$${Number(valor || 0).toLocaleString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  })
}

async function cargarIngresos() {
  cargando.value = true
  try {
    const { data } = await ingresoService.obtenerIngresos(
      fechaLocal(rangoSemana.value.inicio),
      fechaLocal(rangoSemana.value.fin)
    )
    ingresos.value = data.data
  } catch {
    $q.notify({
      type: 'negative',
      message: t('income.loadError'),
      position: 'top'
    })
  } finally {
    cargando.value = false
  }
}

async function guardar() {
  guardando.value = true
  try {
    await ingresoService.crearIngreso({
      ...formulario.value,
      valor: Number(formulario.value.valor)
    })
    // El formulario solo se limpia cuando el servidor confirma que guardó el ingreso.
    $q.notify({
      type: 'positive',
      message: t('income.saved'),
      caption: t('income.savedNext'),
      position: 'top',
      timeout: 3500
    })
    const fechaGuardada = new Date(`${formulario.value.fecha}T00:00:00`)
    if (fechaGuardada >= rangoSemana.value.inicio && fechaGuardada <= rangoSemana.value.fin) {
      await cargarIngresos()
    }
    formulario.value = {
      concepto: '',
      detalle: '',
      valor: '',
      fecha: fechaLocal(new Date())
    }
    await nextTick()
    formularioRef.value?.resetValidation()
  } catch {
    $q.notify({
      type: 'negative',
      message: t('income.saveError'),
      position: 'top'
    })
  } finally {
    guardando.value = false
  }
}

function cambiarSemana(cantidad) {
  const fecha = new Date(semanaSeleccionada.value)
  fecha.setDate(fecha.getDate() + cantidad * 7)
  semanaSeleccionada.value = fecha
}

function irASemanaActual() {
  semanaSeleccionada.value = inicioSemana(new Date())
}

watch(semanaSeleccionada, cargarIngresos)
onMounted(cargarIngresos)
</script>
