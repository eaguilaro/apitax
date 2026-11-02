import apiClient from '@/services/apiClient'

export default {
  obtenerBalanceSemanal(anioFiscal) {
    // El servidor devuelve todas las semanas del año fiscal solicitado (julio a junio).
    return apiClient.get('/balance/semanal', { params: { anioFiscal } })
  }
}
