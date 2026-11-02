import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
})

export function resolveUploadUrl(uploadPath) {
  if (!uploadPath) return ''
  const apiUrl = new URL(apiBaseUrl, window.location.href)
  return new URL(uploadPath, apiUrl).toString()
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      window.dispatchEvent(new Event('apitax:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default apiClient
