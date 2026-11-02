<template>
  <q-page class="q-pa-md">
    <q-card class="expense-form-card">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>{{ isEditing ? t('expense.editTitle') : t('expense.newTitle') }}</q-toolbar-title>
      </q-toolbar>

      <q-linear-progress
        v-if="loading"
        indeterminate
        color="primary"
      />

      <q-form ref="formularioRef" @submit.prevent="guardar">
        <q-card-section class="q-gutter-y-md">
          <div class="text-body2 text-grey-7">
            {{ t('expense.instructions') }}
          </div>

        <q-input
          v-model="formulario.proveedor"
          :label="t('expense.vendor')"
          outlined
          :rules="[val => val && val.trim().length > 0 || t('expense.vendorRequired')]"
        />

        <!-- Quasar rules must return a boolean or an error message, never the date string itself. -->
        <q-input
          v-model="formulario.fecha"
          type="date"
          :label="t('expense.date')"
          outlined
          :rules="[val => Boolean(val) || t('expense.dateRequired')]"
        />

        <q-input
          v-model.number="formulario.valor"
          :label="t('expense.amount')"
          outlined
          type="number"
          min="0.01"
          step="0.01"
          :rules="[val => val && val > 0 || t('expense.amountPositive')]"
        />

        <q-input
          v-model="formulario.descripcion"
          :label="t('expense.description')"
          outlined
          type="textarea"
          rows="3"
          :rules="[val => val && val.trim().length > 0 || t('expense.descriptionRequired')]"
        />

        <q-input
          v-model="formulario.observacion"
          :label="t('expense.observation')"
          outlined
          type="textarea"
          rows="2"
        />

        <div>
          <div class="text-weight-bold q-mb-sm">{{ t('expense.optionalReceipt') }}</div>
          <q-file
            v-model="archivo"
            @update:model-value="previsualizarImagen"
            :label="t('expense.chooseFile')"
            outlined
            accept=".jpg,.jpeg,.png,.gif,.pdf"
            max-file-size="10485760"
            @rejected="onFileRejected"
            clearable
          />
          <q-file
            v-model="archivo"
            @update:model-value="previsualizarImagen"
            :label="t('expense.takePhoto')"
            outlined
            accept="image/*"
            capture="environment"
            max-file-size="10485760"
            @rejected="onFileRejected"
            clearable
            class="q-mt-sm"
          >
            <template #prepend>
              <q-icon name="photo_camera" />
            </template>
          </q-file>
          <div class="text-caption text-grey q-mt-xs">
            {{ t('expense.acceptedFormats') }}
          </div>
        </div>

        <div v-if="previewImagen" class="q-mb-md">
          <div class="text-weight-bold q-mb-sm">{{ t('expense.preview') }}</div>
          <img
            v-if="tipoPreview === 'imagen'"
            :src="previewImagen"
            style="max-width: 100%; max-height: 300px; border: 1px solid #e0e0e0;"
            :alt="t('expense.preview')"
          />
          <div v-else class="bg-grey-2 q-pa-md text-center">
            <q-icon name="picture_as_pdf" size="48px" color="negative" />
            <div>{{ t('expense.selectedPdf', { name: archivo.name }) }}</div>
          </div>
        </div>

        <div v-if="isEditing && gastoActual?.rutaImagen" class="q-mb-md">
          <div class="text-weight-bold q-mb-sm">{{ t('expense.currentReceipt') }}</div>
          <a
            v-if="gastoActual.rutaImagen.toLowerCase().endsWith('.pdf')"
            :href="urlRecibo(gastoActual.rutaImagen)"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('expense.openPdf') }}
          </a>
          <img
            v-else
            :src="urlRecibo(gastoActual.rutaImagen)"
            style="max-width: 100%; max-height: 300px; border: 1px solid #e0e0e0;"
            :alt="t('expense.currentReceipt')"
          />
        </div>
        </q-card-section>

        <q-card-actions class="q-pa-md">
          <q-btn flat :label="t('expense.cancel')" to="/" />
          <q-space />
          <q-btn
            type="submit"
            unelevated
            :label="t('expense.save')"
            icon="save"
            color="primary"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGastoStore } from '@/stores/gastoStore'
import { useQuasar } from 'quasar'
import { useI18n } from '@/i18n'
import { resolveUploadUrl } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()
const gastoStore = useGastoStore()
const $q = useQuasar()
const { t } = useI18n()

const loading = computed(() => gastoStore.loading)
const isEditing = computed(() => !!route.params.id)

const fechaHoy = () => {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

const formularioVacio = () => ({
  proveedor: '',
  fecha: fechaHoy(),
  valor: '',
  descripcion: '',
  observacion: ''
})

const urlRecibo = (ruta) => resolveUploadUrl(ruta)

const formulario = ref(formularioVacio())
const formularioRef = ref(null)

const archivo = ref(null)
const previewImagen = ref('')
const tipoPreview = ref('')
const gastoActual = ref(null)

// Al editar, se precargan los datos existentes; al crear, el formulario empieza vacío.
onMounted(async () => {
  if (isEditing.value) {
    try {
      const response = await gastoStore.obtenerGasto(route.params.id)
      gastoActual.value = response.data
      formulario.value = {
        proveedor: gastoActual.value.proveedor,
        fecha: new Date(gastoActual.value.fecha).toISOString().split('T')[0],
        valor: gastoActual.value.valor,
        descripcion: gastoActual.value.descripcion,
        observacion: gastoActual.value.observacion
      }
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('expense.loadError'),
        position: 'top'
      })
    }
  }
})

const previsualizarImagen = (archivoSeleccionado) => {
  if (!archivoSeleccionado) {
    previewImagen.value = ''
    tipoPreview.value = ''
    return
  }

  if (archivoSeleccionado.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (evento) => {
      previewImagen.value = evento.target.result
      tipoPreview.value = 'imagen'
    }
    reader.readAsDataURL(archivoSeleccionado)
  } else if (archivoSeleccionado.type === 'application/pdf') {
    previewImagen.value = archivoSeleccionado.name
    tipoPreview.value = 'pdf'
  } else {
    previewImagen.value = ''
    tipoPreview.value = ''
  }
}

const limpiarFormulario = async () => {
  formulario.value = formularioVacio()
  archivo.value = null
  previewImagen.value = ''
  tipoPreview.value = ''
  // Espera a que Vue actualice los campos antes de borrar sus errores de validación.
  await nextTick()
  formularioRef.value?.resetValidation()
}

const onFileRejected = () => {
  $q.notify({
    type: 'negative',
    message: t('expense.fileRejected'),
    position: 'top'
  })
}

const validarFormulario = () => {
  if (!formulario.value.proveedor.trim()) {
    $q.notify({
      type: 'warning',
      message: t('expense.vendorRequired'),
      position: 'top'
    })
    return false
  }
  if (!formulario.value.fecha) {
    $q.notify({
      type: 'warning',
      message: t('expense.dateRequired'),
      position: 'top'
    })
    return false
  }
  if (!formulario.value.valor || formulario.value.valor <= 0) {
    $q.notify({
      type: 'warning',
      message: t('expense.amountPositive'),
      position: 'top'
    })
    return false
  }
  if (!formulario.value.descripcion.trim()) {
    $q.notify({
      type: 'warning',
      message: t('expense.descriptionRequired'),
      position: 'top'
    })
    return false
  }
  return true
}

const guardar = async () => {
  if (!validarFormulario()) return

  // Se envía un multipart para que Multer reciba juntos los datos y la foto/PDF.
  const formData = new FormData()
  formData.append('proveedor', formulario.value.proveedor)
  formData.append('fecha', formulario.value.fecha)
  formData.append('valor', formulario.value.valor)
  formData.append('descripcion', formulario.value.descripcion)
  formData.append('observacion', formulario.value.observacion)

  if (archivo.value) {
    formData.append('imagen', archivo.value)
  }

  try {
    if (isEditing.value) {
      await gastoStore.actualizarGasto(route.params.id, formData)
      $q.notify({
        type: 'positive',
        message: t('expense.updated'),
        position: 'top'
      })
      await router.push('/')
      return
    }

    // Se confirma y limpia solo después de que el backend responda con éxito.
    await gastoStore.crearGasto(formData)
    await limpiarFormulario()
    $q.notify({
      type: 'positive',
      message: t('expense.saved'),
      caption: t('expense.savedNext'),
      position: 'top',
      timeout: 3500
    })
  } catch (error) {
    // Si falla la API, se conservan los datos para corregir el problema e intentar otra vez.
    $q.notify({
      type: 'negative',
      message: t('expense.saveError'),
      position: 'top'
    })
  }
}

</script>

<style scoped lang="scss">
.expense-form-card {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
}
</style>
