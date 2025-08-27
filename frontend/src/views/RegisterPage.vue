<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5">
        <v-card class="pa-8">
          <div class="text-center mb-6">
            <v-icon size="48" color="primary" class="mb-4">mdi-account-plus</v-icon>
            <h1 class="text-h4">Créer un compte</h1>
            <p class="text-body-2 text-grey mt-2">Rejoignez GroupUp gratuitement</p>
          </div>

          <v-form @submit.prevent="handleRegister" ref="form">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.firstName"
                  label="Prénom"
                  variant="outlined"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.lastName"
                  label="Nom"
                  variant="outlined"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="formData.email"
              label="Email"
              type="email"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              :rules="[rules.required, rules.email]"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.password"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              :rules="[rules.required, rules.minLength]"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="formData.confirmPassword"
              label="Confirmer le mot de passe"
              :type="showPassword ? 'text' : 'password'"
              prepend-inner-icon="mdi-lock-check"
              variant="outlined"
              :rules="[rules.required, rules.passwordMatch]"
              class="mb-4"
            ></v-text-field>

            <v-checkbox v-model="formData.acceptTerms" :rules="[rules.required]" class="mb-4">
              <template v-slot:label>
                <span class="text-body-2">
                  J'accepte les
                  <a href="#" class="text-primary">conditions d'utilisation</a>
                </span>
              </template>
            </v-checkbox>

            <v-btn type="submit" color="primary" block size="large" :loading="loading">
              Créer mon compte
            </v-btn>
          </v-form>

          <v-divider class="my-6"></v-divider>

          <div class="text-center">
            <p class="text-body-2 mb-2">Déjà un compte ?</p>
            <v-btn variant="text" color="primary" @click="$router.push('/login')">
              Se connecter
            </v-btn>
          </div>

          <!-- Alert pour les erreurs -->
          <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
            {{ error }}
          </v-alert>

          <!-- Alert pour le succès -->
          <v-alert v-if="success" type="success" variant="tonal" class="mt-4">
            Compte créé avec succès ! Redirection...
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

const form = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const error = ref('')
const success = ref(false)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const rules = {
  required: (value) => !!value || 'Champ requis',
  email: (value) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Email invalide'
  },
  minLength: (value) => value.length >= 8 || 'Minimum 8 caractères',
  passwordMatch: (value) =>
    value === formData.value.password || 'Les mots de passe ne correspondent pas',
}

async function handleRegister() {
  const { valid } = await form.value.validate()

  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    // Créer le compte via l'API
    const newUser = await usersStore.createUser({
      email: formData.value.email,
      password: formData.value.password,
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
    })

    success.value = true

    // Connexion automatique après inscription
    setTimeout(async () => {
      await usersStore.login(formData.value.email, formData.value.password)
      router.push('/dashboard')
    }, 1500)
  } catch (err) {
    console.error('Registration error:', err)
    error.value = 'Erreur lors de la création du compte. Cet email est peut-être déjà utilisé.'
  } finally {
    loading.value = false
  }
}
</script>
