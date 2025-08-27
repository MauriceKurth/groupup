import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_URL = 'http://localhost:8000/api'

export const useApiStore = defineStore('api', () => {
  const loading = ref(false)
  const error = ref(null)

  function getAuthToken() {
    return localStorage.getItem('jwt_token')
  }

  async function fetchApi(endpoint, options = {}) {
    loading.value = true
    error.value = null

    const url = `${API_URL}${endpoint}`

    const headers = {
      Accept: 'application/ld+json',
      ...options.headers,
    }

    if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      headers['Content-Type'] = 'application/ld+json'
    }

    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        headers,
        ...options,
      })

      if (response.status === 401) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('currentUser')
        window.location.href = '/login'
        throw new Error('Session expirée')
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}` + `${errorText}`)
      }

      const data = await response.json()
      return { ...data }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const get = (endpoint) => fetchApi(endpoint)
  const post = (endpoint, data) =>
    fetchApi(endpoint, { method: 'POST', body: JSON.stringify(data) })
  const put = (endpoint, data) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(data) })
  const patch = (endpoint, data) =>
    fetchApi(endpoint, { method: 'PATCH', body: JSON.stringify(data) })
  const remove = (endpoint) => fetchApi(endpoint, { method: 'DELETE' })

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    remove,
    fetchApi,
    getAuthToken,
  }
})
