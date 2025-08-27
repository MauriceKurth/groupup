<template>
  <v-app>
    <!-- Navigation Bar -->
    <v-app-bar color="white" elevation="1">
      <v-container class="d-flex align-center">
        <v-app-bar-title class="font-weight-bold cursor-pointer" @click="$router.push('/')">
          <v-icon color="primary" class="mr-2">mdi-calendar-check</v-icon>
          GroupUp
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <!-- Navigation pour utilisateur non connecté -->
        <template v-if="!usersStore.isLoggedIn">
          <v-btn variant="text" @click="$router.push('/login')"> Connexion </v-btn>
          <v-btn color="primary" variant="flat" @click="$router.push('/register')" class="ml-2">
            S'inscrire
          </v-btn>
        </template>

        <!-- Navigation pour utilisateur connecté -->
        <template v-else>
          <v-btn variant="text" @click="$router.push('/dashboard')"> Tableau de bord </v-btn>

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon v-bind="props" class="ml-2">
                <v-avatar color="primary" size="32">
                  <span class="text-white">
                    {{ usersStore.currentUser?.firstName?.[0]
                    }}{{ usersStore.currentUser?.lastName?.[0] }}
                  </span>
                </v-avatar>
              </v-btn>
            </template>
            <v-list>
              <v-list-item>
                <v-list-item-title>{{ usersStore.userFullName }}</v-list-item-title>
                <v-list-item-subtitle>{{ usersStore.currentUser?.email }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider></v-divider>
              <v-list-item @click="handleLogout">
                <template v-slot:prepend>
                  <v-icon>mdi-logout</v-icon>
                </template>
                <v-list-item-title>Déconnexion</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-container>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Footer -->
    <v-footer color="grey-lighten-4" class="text-center py-4">
      <v-container>
        <p class="text-caption text-grey">
          © 2024 GroupUp - Application de planification d'événements
        </p>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useRouter } from 'vue-router'

const usersStore = useUsersStore()
const router = useRouter()

onMounted(() => {
  // Initialise l'authentification au chargement
  usersStore.initAuth()
})

function handleLogout() {
  usersStore.logout()
  router.push('/')
}
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}
</style>
