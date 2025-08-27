<template>
  <v-container class="py-8">
    <!-- Hero Section -->
    <v-row class="mb-8">
      <v-col cols="12" md="6">
        <h1 class="text-h2 font-weight-bold mb-4">
          Organisez vos événements <span class="text-primary">simplement</span>
        </h1>
        <p class="text-h6 text-grey-darken-1 mb-6">
          GroupUp facilite la planification d'événements entre amis, collègues ou associations.
          Créez, votez, participez !
        </p>
        <div class="d-flex gap-3">
          <v-btn color="primary" size="large" @click="$router.push('/register')">
            Commencer gratuitement
          </v-btn>
          <v-btn variant="outlined" size="large" @click="$router.push('/login')">
            Se connecter
          </v-btn>
        </div>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center">
        <v-card class="pa-8 w-100" color="primary" variant="flat">
          <v-icon size="100" color="white" class="mb-4">mdi-calendar-multiple</v-icon>
          <h3 class="text-h5 text-white">Planification collaborative</h3>
        </v-card>
      </v-col>
    </v-row>

    <!-- Features -->
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 text-center mb-8">Fonctionnalités principales</h2>
      </v-col>
      <v-col cols="12" md="4" v-for="feature in features" :key="feature.title">
        <v-card class="pa-6 h-100 text-center">
          <v-icon :icon="feature.icon" size="48" :color="feature.color" class="mb-4"></v-icon>
          <h3 class="text-h6 mb-2">{{ feature.title }}</h3>
          <p class="text-body-2 text-grey-darken-1">{{ feature.description }}</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const features = [
  {
    icon: 'mdi-account-group',
    color: 'primary',
    title: 'Gestion des groupes',
    description: "Créez et gérez vos groupes facilement avec des codes d'invitation",
  },
  {
    icon: 'mdi-vote',
    color: 'secondary',
    title: 'Votes et sondages',
    description: 'Votez pour les dates et lieux qui conviennent à tous',
  },
  {
    icon: 'mdi-bell-ring',
    color: 'accent',
    title: 'Rappels automatiques',
    description: 'Ne manquez plus aucun événement grâce aux notifications',
  },
]
</script>
