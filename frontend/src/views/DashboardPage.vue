<template>
  <v-container class="py-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4">Tableau de bord</h1>
        <p class="text-body-1 text-grey-darken-1">Bienvenue {{ usersStore.userFullName }} !</p>
      </v-col>
      <v-col class="text-right">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="showCreateGroupDialog = true"
          :loading="loading.create"
        >
          Créer un groupe
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="primary" size="32">mdi-account-group</v-icon>
            <div class="ml-4">
              <p class="text-caption text-grey">Mes groupes</p>
              <p class="text-h5 font-weight-bold">{{ teamsStore.teamStats.totalTeams }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="success" size="32">mdi-crown</v-icon>
            <div class="ml-4">
              <p class="text-caption text-grey">Admin de</p>
              <p class="text-h5 font-weight-bold">{{ teamsStore.teamStats.createdByMe }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="info" size="32">mdi-account</v-icon>
            <div class="ml-4">
              <p class="text-caption text-grey">Membre de</p>
              <p class="text-h5 font-weight-bold">{{ teamsStore.teamStats.memberOf }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="warning" size="32">mdi-calendar</v-icon>
            <div class="ml-4">
              <p class="text-caption text-grey">Événements</p>
              <p class="text-h5 font-weight-bold">{{ totalEvents }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading.fetch">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-3">Chargement de vos groupes...</p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="teamsStore.userTeams.length === 0">
      <v-col cols="12" class="text-center py-8">
        <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
        <h3 class="text-h6 mt-4 mb-2">Aucun groupe pour le moment</h3>
        <p class="text-grey mb-4">
          Créez votre premier groupe pour commencer à organiser vos événements !
        </p>
        <v-btn color="primary" @click="showCreateGroupDialog = true">
          Créer mon premier groupe
        </v-btn>
      </v-col>
    </v-row>

    <!-- Groups Section -->
    <v-row v-else>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Mes groupes</h2>
      </v-col>
      <v-col cols="12" md="4" v-for="team in teamsStore.userTeams" :key="team.id">
        <v-card class="pa-4">
          <v-card-title>{{ team.name }}</v-card-title>
          <v-card-subtitle v-if="team.description">{{ team.description }}</v-card-subtitle>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <v-chip
                size="small"
                :color="team.creator?.id === usersStore.currentUser?.id ? 'success' : 'primary'"
                variant="tonal"
              >
                {{ team.creator?.id === usersStore.currentUser?.id ? 'Admin' : 'Membre' }}
              </v-chip>
              <span class="text-caption text-grey"> Code: {{ team.inviteCode }} </span>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary" :to="`/groups/${team.id}`"> Voir détails </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de création de groupe -->
    <v-dialog v-model="showCreateGroupDialog" max-width="500">
      <v-card>
        <v-card-title>Créer un nouveau groupe</v-card-title>
        <v-card-text>
          <v-form ref="groupForm" @submit.prevent="createGroup">
            <v-text-field
              v-model="newGroup.name"
              label="Nom du groupe *"
              variant="outlined"
              required
              class="mb-3"
              :rules="[(v) => !!v || 'Le nom est requis']"
            ></v-text-field>

            <v-textarea
              v-model="newGroup.description"
              label="Description"
              variant="outlined"
              rows="3"
              placeholder="Décrivez l'objectif de ce groupe..."
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showCreateGroupDialog = false" :disabled="loading.create"> Annuler </v-btn>
          <v-btn color="primary" @click="createGroup" :loading="loading.create"> Créer </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar pour les notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> Fermer </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useTeamsStore } from '@/stores/teams'
import { useRouter } from 'vue-router'

const usersStore = useUsersStore()
const teamsStore = useTeamsStore()
const router = useRouter()

// États de chargement
const loading = ref({
  fetch: false,
  create: false,
})

// Dialog states
const showCreateGroupDialog = ref(false)

// Formulaire nouveau groupe
const newGroup = ref({
  name: '',
  description: '',
})

// Snackbar pour les notifications
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
})

// Computed - Stats calculées (pour l'instant événements = 0)
const totalEvents = computed(() => {
  // TODO: Calculer le nombre d'événements à partir des teams
  return 0
})

// Redirection si non connecté
onMounted(async () => {
  if (!usersStore.isLoggedIn) {
    router.push('/login')
    return
  }

  // Charger les teams de l'utilisateur
  await loadUserTeams()
})

// Méthodes
async function loadUserTeams() {
  try {
    loading.value.fetch = true
    await teamsStore.fetchTeams()
  } catch (error) {
    console.error('Erreur lors du chargement des teams:', error)
    snackbar.value = {
      show: true,
      text: 'Erreur lors du chargement des groupes',
      color: 'error',
    }
  } finally {
    loading.value.fetch = false
  }
}

async function createGroup() {
  const { valid } = await groupForm.value.validate()
  if (!valid) return

  try {
    loading.value.create = true

    const newTeam = await teamsStore.createTeam({
      name: newGroup.value.name,
      description: newGroup.value.description,
    })

    showCreateGroupDialog.value = false

    snackbar.value = {
      show: true,
      text: `Groupe "${newTeam.name}" créé avec succès !`,
      color: 'success',
    }

    // Reset form
    newGroup.value = {
      name: '',
      description: '',
    }
  } catch (error) {
    console.error('Erreur lors de la création du groupe:', error)
    snackbar.value = {
      show: true,
      text: 'Erreur lors de la création du groupe',
      color: 'error',
    }
  } finally {
    loading.value.create = false
  }
}

// Référence au formulaire
const groupForm = ref(null)
</script>
