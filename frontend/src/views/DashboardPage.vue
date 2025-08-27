<template>
  <v-container class="py-6">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col>
        <h1 class="text-h4">Tableau de bord</h1>
        <p class="text-body-1 text-grey-darken-1">Bienvenue {{ usersStore.userFullName }} !</p>
      </v-col>
      <v-col class="text-right">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateGroupDialog = true">
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
              <p class="text-h5 font-weight-bold">{{ stats.groups }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="secondary" size="32">mdi-calendar</v-icon>
            <div class="ml-4">
              <p class="text-caption text-grey">Événements à venir</p>
              <p class="text-h5 font-weight-bold">{{ stats.upcomingEvents }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="warning" size="32">mdi-clock-outline</v-icon>
            <div class="ml-4">
              <p class="text-caption text-grey">En attente</p>
              <p class="text-h5 font-weight-bold">{{ stats.pending }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="success" size="32">mdi-account-multiple</v-icon>
            <div class="ml-4">
              <p class="text-caption text-grey">Membres total</p>
              <p class="text-h5 font-weight-bold">{{ stats.totalMembers }}</p>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Groups Section -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Mes groupes</h2>
      </v-col>
      <v-col cols="12" md="4" v-for="group in mockGroups" :key="group.id">
        <v-card class="pa-4">
          <v-card-title>{{ group.name }}</v-card-title>
          <v-card-subtitle>{{ group.memberCount }} membres</v-card-subtitle>
          <v-card-text>
            <v-chip size="small" color="primary" variant="tonal">
              {{ group.role }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary" :to="`/groups/${group.id}`"> Voir détails </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog de création de groupe -->
    <v-dialog v-model="showCreateGroupDialog" max-width="500">
      <v-card>
        <v-card-title>Créer un nouveau groupe</v-card-title>
        <v-card-text>
          <v-form ref="groupForm">
            <v-text-field
              v-model="newGroup.name"
              label="Nom du groupe"
              variant="outlined"
              required
              class="mb-3"
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
          <v-btn @click="showCreateGroupDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="createGroup">Créer</v-btn>
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
import { ref, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const usersStore = useUsersStore()
const router = useRouter()

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

// Redirection si non connecté
onMounted(() => {
  if (!usersStore.isLoggedIn) {
    router.push('/login')
  }
})

const stats = ref({
  groups: 3,
  upcomingEvents: 5,
  pending: 2,
  totalMembers: 24,
})

const mockGroups = ref([
  { id: 1, name: 'Weekend entre amis', memberCount: 8, role: 'Admin' },
  { id: 2, name: 'Sorties Strasbourg', memberCount: 12, role: 'Membre' },
  { id: 3, name: 'Team Building Entreprise', memberCount: 4, role: 'Modérateur' },
])

// Méthodes
function createGroup() {
  console.log('Creating group:', newGroup.value)
  // TODO: Appel API pour créer le groupe

  // Simulation de création
  mockGroups.value.push({
    id: mockGroups.value.length + 1,
    name: newGroup.value.name,
    memberCount: 1,
    role: 'Admin',
  })

  showCreateGroupDialog.value = false

  // Notification
  snackbar.value = {
    show: true,
    text: 'Groupe créé avec succès !',
    color: 'success',
  }

  // Reset form
  newGroup.value = {
    name: '',
    description: '',
  }
}
</script>
