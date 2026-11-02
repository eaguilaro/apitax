<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>{{ t('summary.title') }}</q-toolbar-title>
      </q-toolbar>

      <q-linear-progress
        v-if="loading"
        indeterminate
        color="primary"
      />

      <q-card-section class="q-gutter-md">
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12">
            <q-card class="text-white bg-primary">
              <q-card-section>
                <div class="text-h6">{{ t('summary.total') }}</div>
                <div class="text-h3">${{ formatNumber(totalGeneral) }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-if="!loading && resumen.length > 0">
          <q-table
            :rows="resumen"
            :columns="columns"
            row-key="_id"
            flat
            bordered
          >
            <template v-slot:body-cell-total="props">
              <q-td :props="props">
                <span class="text-weight-bold text-primary">${{ formatNumber(props.row.total) }}</span>
              </q-td>
            </template>

            <template v-slot:body-cell-porcentaje="props">
              <q-td :props="props">
                {{ calcularPorcentaje(props.row.total) }}%
                <q-linear-progress
                  :value="props.row.total / totalGeneral"
                  color="primary"
                  class="q-mt-sm"
                />
              </q-td>
            </template>
          </q-table>
        </div>

        <div v-else-if="!loading" class="text-center text-grey-7 q-pa-lg">
          <q-icon name="analytics" size="64px" class="q-mb-md" />
          <div>{{ t('summary.empty') }}</div>
        </div>
      </q-card-section>

      <q-card-actions>
        <q-btn flat :label="t('summary.back')" to="/" />
        <q-space />
        <q-btn
          flat
          :label="t('summary.refresh')"
          icon="refresh"
          @click="gastoStore.fetchResumen()"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useGastoStore } from '@/stores/gastoStore'
import { useI18n } from '@/i18n'

const gastoStore = useGastoStore()
const { locale, t } = useI18n()

const loading = computed(() => gastoStore.loading)
const resumen = computed(() => gastoStore.resumen)

const columns = computed(() => [
  { name: '_id', label: t('summary.vendor'), field: '_id', align: 'left' },
  { name: 'cantidad', label: t('summary.count'), field: 'cantidad', align: 'center' },
  { name: 'total', label: t('summary.amount'), field: 'total', align: 'right' },
  { name: 'porcentaje', label: t('summary.percent'), field: 'porcentaje', align: 'center' }
])

const totalGeneral = computed(() => {
  return resumen.value.reduce((sum, item) => sum + item.total, 0)
})

onMounted(() => {
  gastoStore.fetchResumen()
})

const formatNumber = (num) => {
  return Number(num).toLocaleString(locale.value === 'es' ? 'es-ES' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const calcularPorcentaje = (total) => {
  if (totalGeneral.value === 0) return 0
  return ((total / totalGeneral.value) * 100).toFixed(1)
}
</script>

<style scoped lang="scss">
</style>
