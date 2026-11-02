import apiClient from '@/services/apiClient'

export default {
  obtenerIngresos(fechaInicio, fechaFin) {
    return apiClient.get('/ingresos', {
      params: { fechaInicio, fechaFin }
    })
  },

  crearIngreso(ingreso) {
    return apiClient.post('/ingresos', ingreso)
  }
}
