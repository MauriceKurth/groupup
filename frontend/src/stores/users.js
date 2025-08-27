import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApiStore } from './api'

export const useUsersStore = defineStore('users', () => {
  const api = useApiStore()

  // État
  const users = ref([])
  const currentUser = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!currentUser.value)
  const userFullName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  })

  async function fetchUsers() {
    try {
      const response = await api.get('/users')
      console.log('Raw API response:', response) // Debug

      // Vérifie les différentes structures possibles
      if (response['hydra:member']) {
        users.value = response['hydra:member']
      } else if (Array.isArray(response)) {
        users.value = response
      } else if (response.member) {
        users.value = response.member
      } else {
        console.warn('Structure de réponse inconnue:', response)
        users.value = []
      }

      console.log('Users loaded:', users.value) // Debug
      return users.value
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
    }
  }

  async function login(email) {
    // Pour l'instant, on simule une connexion
    // On récupère juste l'utilisateur par email
    try {
      const allUsers = await fetchUsers()
      const user = allUsers.find((u) => u.email === email)

      if (user) {
        currentUser.value = user
        // On stocke dans localStorage pour persister la session
        localStorage.setItem('currentUser', JSON.stringify(user))
        return user
      } else {
        throw new Error('Utilisateur non trouvé')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  function initAuth() {
    // Récupère l'utilisateur depuis localStorage au démarrage
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
    }
  }

  async function createUser(userData) {
    try {
      const newUser = await api.post('/users', userData)
      users.value.push(newUser)
      return newUser
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }

  return {
    // État
    users,
    currentUser,
    // Getters
    isLoggedIn,
    userFullName,
    // Actions
    fetchUsers,
    login,
    logout,
    initAuth,
    createUser,
  }
})
