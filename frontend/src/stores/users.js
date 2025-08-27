import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApiStore } from './api'

export const useUsersStore = defineStore('users', () => {
  const api = useApiStore()

  // État
  const users = ref([])
  const currentUser = ref(null)
  const token = ref(null) // ✨ NOUVEAU : On stocke le token JWT

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!currentUser.value)
  const userFullName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  })

  // ✨ NOUVEAU : Authentification JWT réelle
  async function login(email, password) {
    try {
      console.log('🔐 Tentative de connexion pour:', email)

      // 1️⃣ Étape 1: Demander le token au serveur
      const response = await fetch('http://localhost:8000/api/login_check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      if (!response.ok) {
        throw new Error('Email ou mot de passe incorrect')
      }

      const authData = await response.json()
      console.log('✅ Token reçu:', authData)

      // 2️⃣ Étape 2: Stocker le token
      token.value = authData.token
      localStorage.setItem('jwt_token', authData.token)

      // 3️⃣ Étape 3: Récupérer les infos utilisateur avec le token
      const userResponse = await fetch('http://localhost:8000/api/me', {
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: 'application/json',
        },
      })

      if (!userResponse.ok) {
        throw new Error('Impossible de récupérer les informations utilisateur')
      }

      const userData = await userResponse.json()
      console.log('👤 Données utilisateur récupérées:', userData)

      // 4️⃣ Étape 4: Stocker les données utilisateur
      currentUser.value = userData
      localStorage.setItem('currentUser', JSON.stringify(userData))

      return userData
    } catch (error) {
      console.error('❌ Erreur de connexion:', error)
      // Nettoyer en cas d'erreur
      token.value = null
      currentUser.value = null
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('currentUser')
      throw error
    }
  }

  // ✨ MODIFIÉ : Déconnexion qui nettoie le token
  function logout() {
    console.log('👋 Déconnexion...')
    currentUser.value = null
    token.value = null
    localStorage.removeItem('currentUser')
    localStorage.removeItem('jwt_token')
  }

  // ✨ MODIFIÉ : Initialisation qui récupère le token
  function initAuth() {
    console.log("🚀 Initialisation de l'authentification...")

    // Récupérer le token stocké
    const storedToken = localStorage.getItem('jwt_token')
    const storedUser = localStorage.getItem('currentUser')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        currentUser.value = JSON.parse(storedUser)
        console.log('✅ Session restaurée pour:', currentUser.value.email)
      } catch (e) {
        console.error('❌ Erreur lors de la restauration de session:', e)
        // Nettoyer si les données sont corrompues
        logout()
      }
    } else {
      console.log('ℹ️ Aucune session trouvée')
    }
  }

  // ✨ NOUVEAU : Méthode pour obtenir le token (utile pour les autres stores)
  function getAuthToken() {
    return token.value
  }

  // Méthodes existantes (à garder pour l'instant)
  async function fetchUsers() {
    try {
      const response = await api.get('/users')
      console.log('Raw API response:', response)

      if (response['hydra:member']) {
        users.value = response['hydra:member']
      } else if (Array.isArray(response)) {
        users.value = response
      } else {
        console.warn('Structure de réponse inconnue:', response)
        users.value = []
      }

      return users.value
    } catch (error) {
      console.error('Failed to fetch users:', error)
      throw error
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
    token, // ✨ NOUVEAU : Export du token
    // Getters
    isLoggedIn,
    userFullName,
    // Actions
    login,
    logout,
    initAuth,
    getAuthToken, // ✨ NOUVEAU
    fetchUsers,
    createUser,
  }
})
