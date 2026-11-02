import apiClient from '@/services/apiClient'

export default {
  // Obtener todos los gastos
  obtenerGastos() {
    return apiClient.get('/gastos')
  },

  // Obtener gasto por ID
  obtenerGasto(id) {
    return apiClient.get(`/gastos/${id}`)
  },

  // Crear nuevo gasto
  crearGasto(formData) {
    // Axios y el navegador generan el boundary multipart; no fijarlo manualmente.
    return apiClient.post('/gastos', formData)
  },

  // Actualizar gasto
  actualizarGasto(id, formData) {
    return apiClient.put(`/gastos/${id}`, formData)
  },

  // Eliminar gasto
  eliminarGasto(id) {
    return apiClient.delete(`/gastos/${id}`)
  },

  // Obtener gastos por fecha
  obtenerGastosPorFecha(fechaInicio, fechaFin) {
    return apiClient.get('/gastos/fecha', {
      params: {
        fechaInicio,
        fechaFin
      }
    })
  },

  // Obtener resumen
  obtenerResumen() {
    return apiClient.get('/gastos/resumen')
  }
}
