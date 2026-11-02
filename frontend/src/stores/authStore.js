import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const authenticated = ref(false)
  const initialized = ref(false)
  const user = ref(null)

  async function refreshSession() {
    try {
      const { data } = await authService.me()
      authenticated.value = true
      user.value = data.user
    } catch (error) {
      authenticated.value = false
      user.value = null
      if (error.response?.status !== 401) throw error
    } finally {
      initialized.value = true
    }
    return authenticated.value
  }

  async function login(credentials) {
    const { data } = await authService.login(credentials)
    authenticated.value = true
    user.value = data.user
    initialized.value = true
  }

  async function finishSetup(code) {
    const { data } = await authService.verifySetup(code)
    authenticated.value = true
    user.value = data.user
    initialized.value = true
  }

  async function logout() {
    await authService.logout()
    clearSession()
  }

  function clearSession() {
    authenticated.value = false
    user.value = null
    initialized.value = true
  }

  return { authenticated, initialized, user, refreshSession, login, finishSetup, logout, clearSession }
})
