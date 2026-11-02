<template>
  <q-page class="q-pa-md">
    <q-btn
      class="full-width q-mb-lg"
      color="primary"
      unelevated
      size="lg"
      icon="add_a_photo"
      :label="t('list.register')"
      to="/recibos"
    />

    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-4">
        <q-card class="text-white bg-primary">
          <q-card-section>
            <div class="text-h6">{{ t('list.totalExpenses') }}</div>
            <div class="text-h4">${{ formatNumber(totalGastos) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="text-white bg-info">
          <q-card-section>
            <div class="text-h6">{{ t('list.count') }}</div>
            <div class="text-h4">{{ cantidadGastos }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-4">
        <q-card class="text-white bg-positive">
          <q-card-section>
            <div class="text-h6">{{ t('list.average') }}</div>
            <div class="text-h4">{{ cantidadGastos > 0 ? '$' + formatNumber(totalGastos / cantidadGastos) : '$0' }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="q-mb-lg">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>{{ t('list.filters') }}</q-toolbar-title>
      </q-toolbar>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="filtro.fechaInicio"
              type="date"
              :label="t('list.startDate')"
              @update:model-value="aplicarFiltros"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="filtro.fechaFin"
              type="date"
              :label="t('list.endDate')"
              @update:model-value="aplicarFiltros"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions>
        <q-btn flat :label="t('list.clear')" @click="limpiarFiltros" />
      </q-card-actions>
    </q-card>

    <q-card>
      <q-linear-progress
        v-if="loading"
        indeterminate
        color="primary"
      />
      
      <q-table
        v-if="!loading && gastos.length > 0"
        :rows="gastos"
        :columns="columns"
        row-key="_id"
        flat
        bordered
        class="full-width"
      >
        <template v-slot:body-cell-fecha="props">
          <q-td :props="props">
            {{ formatDate(props.row.fecha) }}
          </q-td>
        </template>

        <template v-slot:body-cell-valor="props">
          <q-td :props="props">
            <span class="text-weight-bold text-primary">${{ formatNumber(props.row.valor) }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-imagen="props">
          <q-td :props="props">
            <q-icon
              v-if="props.row.imagen"
              :name="props.row.rutaImagen?.toLowerCase().endsWith('.pdf') ? 'picture_as_pdf' : 'image'"
              color="primary"
              size="24px"
              class="cursor-pointer"
              @click="verImagen(props.row)"
            />
            <span v-else class="text-grey">{{ t('list.noImage') }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              round
              icon="edit"
              :aria-label="`${t('expense.editTitle')}: ${props.row.proveedor}`"
              color="primary"
              size="sm"
              :to="`/editar/${props.row._id}`"
            />
            <q-btn
              flat
              dense
              round
              icon="delete"
              :aria-label="`${t('list.deleteTitle')}: ${props.row.proveedor}`"
              color="negative"
              size="sm"
              @click="confirmarEliminar(props.row._id)"
            />
          </q-td>
        </template>
      </q-table>

      <div v-else-if="!loading" class="q-pa-lg text-center text-grey-7">
        <q-icon name="receipt_long" size="64px" class="q-mb-md" />
        <div>{{ t('list.noExpenses') }}</div>
      </div>
    </q-card>

    <!-- Modal para ver imagen -->
    <q-dialog v-model="mostrarImagen" maximized>
      <q-card>
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title>{{ gastoSeleccionado?.proveedor }}</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="q-pa-lg">
          <div class="text-center">
            <iframe
              v-if="gastoSeleccionado?.rutaImagen?.toLowerCase().endsWith('.pdf')"
              :src="urlRecibo(gastoSeleccionado.rutaImagen)"
              style="width: 100%; height: 80vh; border: 0;"
              :title="t('list.receiptPdf')"
            />
            <img
              v-else-if="gastoSeleccionado?.rutaImagen"
              :src="urlRecibo(gastoSeleccionado.rutaImagen)"
              style="max-width: 100%; max-height: 80vh;"
              alt="Recibo"
            />
          </div>
          <div class="q-mt-md">
            <div><strong>{{ t('list.vendor') }}:</strong> {{ gastoSeleccionado?.proveedor }}</div>
            <div><strong>{{ t('list.amount') }}:</strong> ${{ formatNumber(gastoSeleccionado?.valor) }}</div>
            <div><strong>{{ t('list.description') }}:</strong> {{ gastoSeleccionado?.descripcion }}</div>
            <div v-if="gastoSeleccionado?.observacion"><strong>{{ t('list.observation') }}:</strong> {{ gastoSeleccionado.observacion }}</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGastoStore } from '@/stores/gastoStore'
import { useQuasar } from 'quasar'
import { useI18n } from '@/i18n'
import { resolveUploadUrl } from '@/services/apiClient'

const gastoStore = useGastoStore()
const $q = useQuasar()
const { locale, t } = useI18n()

const loading = computed(() => gastoStore.loading)
const gastos = computed(() => gastoStore.gastos)
const totalGastos = computed(() => gastoStore.totalGastos)
const cantidadGastos = computed(() => gastoStore.cantidadGastos)

const mostrarImagen = ref(false)
const gastoSeleccionado = ref(null)
const filtro = ref({
  fechaInicio: '',
  fechaFin: ''
})

const columns = computed(() => [
  { name: 'fecha', label: t('list.date'), field: 'fecha', align: 'left' },
  { name: 'proveedor', label: t('list.vendor'), field: 'proveedor', align: 'left' },
  { name: 'valor', label: t('list.amount'), field: 'valor', align: 'right' },
  { name: 'descripcion', label: t('list.description'), field: 'descripcion', align: 'left' },
  { name: 'imagen', label: t('list.receipt'), field: 'imagen', align: 'center' },
  { name: 'acciones', label: t('list.actions'), field: '', align: 'center' }
])

onMounted(() => {
  gastoStore.fetchGastos()
})

const formatDate = (date) => {
  return new Date(date).toLocaleDateString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatNumber = (num) => {
  return Number(num).toLocaleString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const verImagen = (gasto) => {
  gastoSeleccionado.value = gasto
  mostrarImagen.value = true
}

const urlRecibo = (ruta) => resolveUploadUrl(ruta)

const confirmarEliminar = (id) => {
  $q.dialog({
    title: t('list.deleteTitle'),
    message: t('list.deleteConfirm'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    gastoStore.eliminarGasto(id).then(() => {
      $q.notify({
        type: 'positive',
        message: t('list.deleteSuccess'),
        position: 'top'
      })
    }).catch(() => {
      $q.notify({
        type: 'negative',
        message: t('list.deleteError'),
        position: 'top'
      })
    })
  })
}

const aplicarFiltros = async () => {
  if (filtro.value.fechaInicio && filtro.value.fechaFin) {
    await gastoStore.fetchGastosPorFecha(filtro.value.fechaInicio, filtro.value.fechaFin)
  }
}

const limpiarFiltros = () => {
  filtro.value.fechaInicio = ''
  filtro.value.fechaFin = ''
  gastoStore.fetchGastos()
}
</script>

<style scoped lang="scss">
.bg-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
