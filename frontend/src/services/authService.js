import apiClient from '@/services/apiClient'

export default {
  status() {
    return apiClient.get('/auth/status')
  },
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  },
  startSetup(payload) {
    return apiClient.post('/auth/setup/start', payload)
  },
  verifySetup(code) {
    return apiClient.post('/auth/setup/verify', { code })
  },
  me() {
    return apiClient.get('/auth/me')
  },
  logout() {
    return apiClient.post('/auth/logout')
  }
}
