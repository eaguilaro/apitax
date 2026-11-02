import apiClient from '@/services/apiClient'

export default {
  inicializarDatos() {
    return apiClient.post('/mantenimiento/inicializar')
  },
  limpiarDatos(confirmacion) {
    return apiClient.post('/mantenimiento/limpiar', { confirmacion })
  }
}
