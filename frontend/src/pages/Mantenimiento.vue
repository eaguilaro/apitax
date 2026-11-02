<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-xs">{{ t('maintenance.title') }}</div>
    <div class="text-body2 text-grey-7 q-mb-lg">
      {{ t('maintenance.intro') }}
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ t('maintenance.initialize') }}</div>
        <p class="q-mb-md">
          {{ t('maintenance.initializeInfo') }}
        </p>
        <q-btn
          color="primary"
          unelevated
          icon="database"
          :label="t('maintenance.prepare')"
          :loading="inicializando"
          @click="mostrarConfirmacion = true"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 text-negative">{{ t('maintenance.clearTitle') }}</div>
        <p class="q-mb-md">{{ t('maintenance.clearInfo') }}</p>
        <q-btn
          color="negative"
          unelevated
          icon="delete_forever"
          :label="t('maintenance.clearButton')"
          :loading="limpiando"
          @click="mostrarConfirmacionBorrado = true"
        />
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ t('maintenance.locations') }}</div>
        <q-list separator>
          <q-item>
            <q-item-section avatar><q-icon name="storage" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>MongoDB</q-item-label>
              <q-item-label caption>
                {{ t('maintenance.mongoInfo') }}
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar><q-icon name="folder" color="primary" /></q-item-section>
            <q-item-section>
              <q-item-label>{{ t('maintenance.receipts') }}</q-item-label>
              <q-item-label caption>
                {{ t('maintenance.receiptInfo') }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-banner v-if="resultado" rounded class="bg-green-1 text-positive q-mb-md">
      <template #avatar><q-icon name="check_circle" /></template>
      {{ resultado }}
    </q-banner>

    <q-dialog v-model="mostrarConfirmacion">
      <q-card>
        <q-card-section class="text-h6">{{ t('maintenance.confirmTitle') }}</q-card-section>
        <q-card-section>
          {{ t('maintenance.confirmInfo') }}
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" v-close-popup />
          <q-btn
            color="primary"
            unelevated
            :label="t('maintenance.continue')"
            :loading="inicializando"
            @click="inicializar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="mostrarConfirmacionBorrado" @hide="confirmacionBorrado = ''">
      <q-card style="min-width: min(90vw, 420px)">
        <q-card-section class="text-h6 text-negative">
          {{ t('maintenance.clearConfirmTitle') }}
        </q-card-section>
        <q-card-section>
          <p>{{ t('maintenance.clearConfirmInfo') }}</p>
          <q-input
            v-model="confirmacionBorrado"
            autofocus
            outlined
            :label="t('maintenance.clearConfirmInput')"
            autocomplete="off"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('common.cancel')" v-close-popup />
          <q-btn
            color="negative"
            unelevated
            :label="t('maintenance.clearButton')"
            :loading="limpiando"
            :disable="confirmacionBorrado !== 'BORRAR'"
            @click="limpiar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import mantenimientoService from '@/services/mantenimientoService'
import { useI18n } from '@/i18n'

const $q = useQuasar()
const { t } = useI18n()
const mostrarConfirmacion = ref(false)
const inicializando = ref(false)
const mostrarConfirmacionBorrado = ref(false)
const confirmacionBorrado = ref('')
const limpiando = ref(false)
const resultado = ref('')

async function inicializar() {
  mostrarConfirmacion.value = false
  inicializando.value = true
  resultado.value = ''

  try {
    const { data } = await mantenimientoService.inicializarDatos()
    resultado.value = t('maintenance.success')
    $q.notify({ type: 'positive', message: t('maintenance.success'), position: 'top' })
  } catch {
    $q.notify({
      type: 'negative',
      message: t('maintenance.error'),
      position: 'top'
    })
  } finally {
    inicializando.value = false
  }
}

async function limpiar() {
  limpiando.value = true
  resultado.value = ''

  try {
    const { data } = await mantenimientoService.limpiarDatos(confirmacionBorrado.value)
    const conteos = data.data
    resultado.value = t('maintenance.clearSuccess', {
      expenses: conteos.gastosEliminados,
      income: conteos.ingresosEliminados,
      receipts: conteos.recibosEliminados
    })
    mostrarConfirmacionBorrado.value = false
    $q.notify({ type: 'positive', message: resultado.value, position: 'top' })
  } catch (error) {
    const respuesta = error.response?.data
    const conteos = respuesta?.data
    const detallesParciales = conteos
      ? ` ${t('maintenance.clearPartial', {
        expenses: conteos.gastosEliminados,
        income: conteos.ingresosEliminados,
        receipts: conteos.recibosEliminados
      })}`
      : ''
    const mensaje = `${respuesta?.message || t('maintenance.clearError')}${detallesParciales}`
    $q.notify({ type: 'negative', message: mensaje, position: 'top' })
  } finally {
    limpiando.value = false
  }
}
</script>
