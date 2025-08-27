import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApiStore } from './api'
import { useUsersStore } from './users'

export const useTeamsStore = defineStore('teams', () => {
  const api = useApiStore()
  const usersStore = useUsersStore()

  // État
  const teams = ref([])
  const currentTeam = ref(null)

  // Getters
  const userTeams = computed(() => {
    if (!usersStore.currentUser) return []

    // Teams où l'utilisateur est creator ou membre
    return teams.value.filter(
      (team) =>
        team.creator?.id === usersStore.currentUser.id ||
        team.memberships?.some((membership) => membership.member?.id === usersStore.currentUser.id),
    )
  })

  const teamStats = computed(() => {
    const userTeamsList = userTeams.value
    return {
      totalTeams: userTeamsList.length,
      createdByMe: userTeamsList.filter((t) => t.creator?.id === usersStore.currentUser?.id).length,
      memberOf: userTeamsList.filter((t) => t.creator?.id !== usersStore.currentUser?.id).length,
    }
  })

  // Actions
  async function fetchTeams() {
    try {
      const response = await api.get('/teams')

      if (response?.member && Array.isArray(response.member)) {
        teams.value.length = 0
        teams.value.push(...response.member)
      }

      return teams.value
    } catch (error) {
      console.error('Erreur lors de la récupération des teams:', error)
      throw error
    }
  }

  async function createTeam(teamData) {
    try {
      // On n'envoie PAS le creator - le TeamCreationListener backend l'assigne automatiquement
      const payload = {
        name: teamData.name,
        description: teamData.description || null,
      }

      const newTeam = await api.post('/teams', payload)

      // Ajouter à la liste locale
      teams.value.push(newTeam)

      return newTeam
    } catch (error) {
      console.error('Erreur lors de la création de team:', error)
      throw error
    }
  }

  async function fetchTeamDetails(teamId) {
    try {
      const team = await api.get(`/teams/${teamId}`)
      currentTeam.value = team
      return team
    } catch (error) {
      console.error('Erreur lors de la récupération de la team:', error)
      throw error
    }
  }

  async function updateTeam(teamId, teamData) {
    try {
      const updatedTeam = await api.put(`/teams/${teamId}`, teamData)

      // Mettre à jour dans la liste locale
      const index = teams.value.findIndex((t) => t.id === teamId)
      if (index !== -1) {
        teams.value[index] = updatedTeam
      }

      return updatedTeam
    } catch (error) {
      console.error('Erreur lors de la mise à jour de team:', error)
      throw error
    }
  }

  async function deleteTeam(teamId) {
    try {
      await api.remove(`/teams/${teamId}`)

      // Retirer de la liste locale
      teams.value = teams.value.filter((t) => t.id !== teamId)

      if (currentTeam.value?.id === teamId) {
        currentTeam.value = null
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de team:', error)
      throw error
    }
  }

  // Réinitialiser le store (utile pour la déconnexion)
  function resetStore() {
    teams.value = []
    currentTeam.value = null
  }

  return {
    // État
    teams,
    currentTeam,
    // Getters
    userTeams,
    teamStats,
    // Actions
    fetchTeams,
    createTeam,
    fetchTeamDetails,
    updateTeam,
    deleteTeam,
    resetStore,
  }
})
