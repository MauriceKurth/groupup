import { defineStore } from 'pinia'
import { ref } from 'vue'

// URL de base de l'API
const API_URL = 'http://localhost:8000/api' // Utilise le proxy en dev

export const useApiStore = defineStore('api', () => {
  // État de chargement global
  const loading = ref(false)
  const error = ref(null)

  // Helper pour les requêtes
  async function fetchApi(endpoint, options = {}) {
    loading.value = true
    error.value = null

    const url = `${API_URL}${endpoint}`
    console.log('Fetching:', url) // Debug

    try {
      const response = await fetch(url, {
        headers: {
          Accept: 'application/ld+json',
          ...options.headers,
        },
        ...options,
      })

      console.log('Response status:', response.status) // Debug

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Data received:', data) // Debug
      return data
    } catch (err) {
      error.value = err.message
      console.error('Fetch error:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Méthodes CRUD génériques
  const get = (endpoint) => fetchApi(endpoint)

  const post = (endpoint, data) =>
    fetchApi(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })

  const put = (endpoint, data) =>
    fetchApi(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })

  const remove = (endpoint) =>
    fetchApi(endpoint, {
      method: 'DELETE',
    })

  return {
    loading,
    error,
    get,
    post,
    put,
    remove,
    fetchApi,
  }
})
