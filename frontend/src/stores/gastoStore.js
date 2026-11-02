import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import gastoService from '@/services/gastoService'

export const useGastoStore = defineStore('gasto', () => {
  // Pinia mantiene los gastos y el estado de carga compartidos entre pantallas.
  const gastos = ref([])
  const loading = ref(false)
  const error = ref(null)
  const resumen = ref([])

  // Computed
  const totalGastos = computed(() => {
    return gastos.value.reduce((sum, gasto) => sum + gasto.valor, 0)
  })

  const cantidadGastos = computed(() => {
    return gastos.value.length
  })

  // Acciones
  async function obtenerGasto(id) {
    loading.value = true
    error.value = null
    try {
      const response = await gastoService.obtenerGasto(id)
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error al obtener gasto:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchGastos() {
    loading.value = true
    error.value = null
    try {
      const response = await gastoService.obtenerGastos()
      gastos.value = response.data.data
    } catch (err) {
      error.value = err.message
      console.error('Error al obtener gastos:', err)
    } finally {
      loading.value = false
    }
  }

  async function crearGasto(formData) {
    loading.value = true
    error.value = null
    try {
      const response = await gastoService.crearGasto(formData)
      gastos.value.unshift(response.data.data)
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error al crear gasto:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function actualizarGasto(id, formData) {
    loading.value = true
    error.value = null
    try {
      const response = await gastoService.actualizarGasto(id, formData)
      const index = gastos.value.findIndex(g => g._id === id)
      if (index !== -1) {
        gastos.value[index] = response.data.data
      }
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error al actualizar gasto:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function eliminarGasto(id) {
    loading.value = true
    error.value = null
    try {
      const response = await gastoService.eliminarGasto(id)
      gastos.value = gastos.value.filter(g => g._id !== id)
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error al eliminar gasto:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchResumen() {
    loading.value = true
    error.value = null
    try {
      const response = await gastoService.obtenerResumen()
      resumen.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error al obtener resumen:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchGastosPorFecha(fechaInicio, fechaFin) {
    loading.value = true
    error.value = null
    try {
      const response = await gastoService.obtenerGastosPorFecha(fechaInicio, fechaFin)
      gastos.value = response.data.data
      return response.data
    } catch (err) {
      error.value = err.message
      console.error('Error al obtener gastos por fecha:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    gastos,
    loading,
    error,
    resumen,
    totalGastos,
    cantidadGastos,
    obtenerGasto,
    fetchGastos,
    crearGasto,
    actualizarGasto,
    eliminarGasto,
    fetchResumen,
    fetchGastosPorFecha
  }
})
