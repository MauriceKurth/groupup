<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-8">
          <div class="text-center mb-6">
            <v-icon size="48" color="primary" class="mb-4">mdi-calendar-check</v-icon>
            <h1 class="text-h4">Connexion</h1>
            <p class="text-body-2 text-grey mt-2">Connectez-vous à votre compte GroupUp</p>
          </div>

          <v-form @submit.prevent="handleLogin" ref="form">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              :rules="[rules.required, rules.email]"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              :rules="[rules.required]"
              class="mb-4"
            ></v-text-field>

            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Se connecter
            </v-btn>
          </v-form>

          <v-divider class="my-6"></v-divider>

          <div class="text-center">
            <p class="text-body-2 mb-2">Pas encore de compte ?</p>
            <v-btn variant="text" color="primary" @click="$router.push('/register')">
              Créer un compte
            </v-btn>
          </div>

          <!-- Message de test -->
          <v-alert type="info" variant="tonal" class="mt-4" density="compact">
            <strong>Compte de test :</strong><br />
            Email: test@groupup.fr<br />
            Mot de passe: password123
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '@/stores/users'

const router = useRouter()
const usersStore = useUsersStore()

const email = ref('test@groupup.fr')
const password = ref('password123')
const showPassword = ref(false)
const loading = ref(false)
const form = ref(null)

const rules = {
  required: (value) => !!value || 'Champ requis',
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email invalide'
  },
}

async function handleLogin() {
  const { valid } = await form.value.validate()

  if (!valid) return

  loading.value = true

  try {
    // Pour l'instant, on simule la connexion
    await usersStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    // TODO: Afficher une erreur
  } finally {
    loading.value = false
  }
}
</script>
