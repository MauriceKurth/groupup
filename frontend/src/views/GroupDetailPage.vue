<template>
  <v-container class="py-6">
    <!-- Header du groupe -->
    <v-card class="mb-6">
      <v-card-title class="text-h4 pa-6 bg-primary text-white">
        <v-icon class="mr-3">mdi-account-group</v-icon>
        {{ group.name }}
      </v-card-title>
      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="8">
            <p class="text-body-1 mb-4">{{ group.description }}</p>
            <div class="d-flex gap-4 flex-wrap">
              <v-chip prepend-icon="mdi-account-multiple"> {{ group.memberCount }} membres </v-chip>
              <v-chip prepend-icon="mdi-calendar"> {{ group.eventCount }} événements </v-chip>
              <v-chip prepend-icon="mdi-crown" color="primary" variant="tonal">
                Rôle : {{ group.userRole }}
              </v-chip>
            </div>
          </v-col>
          <v-col cols="12" md="4" class="text-md-right">
            <v-btn
              color="secondary"
              prepend-icon="mdi-share-variant"
              @click="showInviteDialog = true"
              class="mb-2"
            >
              Inviter
            </v-btn>
            <div class="mt-2">
              <p class="text-caption text-grey">Code d'invitation</p>
              <v-chip size="large" @click="copyInviteCode">
                <v-icon start>mdi-content-copy</v-icon>
                {{ group.inviteCode }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs pour le contenu -->
    <v-card>
      <v-tabs v-model="tab" color="primary">
        <v-tab value="events">
          <v-icon start>mdi-calendar</v-icon>
          Événements
        </v-tab>
        <v-tab value="members">
          <v-icon start>mdi-account-multiple</v-icon>
          Membres
        </v-tab>
        <v-tab value="settings" v-if="isAdmin">
          <v-icon start>mdi-cog</v-icon>
          Paramètres
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <!-- Onglet Événements -->
        <v-tabs-window-item value="events">
          <v-container>
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-h6">Événements à venir</h3>
              <v-btn color="primary" prepend-icon="mdi-plus"> Créer un événement </v-btn>
            </div>

            <v-row>
              <v-col cols="12" md="6" v-for="event in events" :key="event.id">
                <v-card class="mb-4">
                  <v-card-title>{{ event.title }}</v-card-title>
                  <v-card-subtitle>
                    <v-icon small>mdi-calendar</v-icon>
                    {{ formatDate(event.date) }}
                  </v-card-subtitle>
                  <v-card-text>
                    <p class="text-body-2 mb-2">{{ event.description }}</p>
                    <div class="d-flex gap-2">
                      <v-chip size="small" color="success" variant="tonal">
                        <v-icon start size="small">mdi-check</v-icon>
                        {{ event.participantsCount.present }} présents
                      </v-chip>
                      <v-chip size="small" color="error" variant="tonal">
                        <v-icon start size="small">mdi-close</v-icon>
                        {{ event.participantsCount.absent }} absents
                      </v-chip>
                      <v-chip size="small" color="warning" variant="tonal">
                        <v-icon start size="small">mdi-help</v-icon>
                        {{ event.participantsCount.maybe }} peut-être
                      </v-chip>
                    </div>
                  </v-card-text>
                  <v-card-actions>
                    <v-btn-group variant="outlined" density="compact">
                      <v-btn color="success" @click="updateParticipation(event.id, 'present')">
                        Je viens
                      </v-btn>
                      <v-btn color="warning" @click="updateParticipation(event.id, 'maybe')">
                        Peut-être
                      </v-btn>
                      <v-btn color="error" @click="updateParticipation(event.id, 'absent')">
                        Absent
                      </v-btn>
                    </v-btn-group>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-tabs-window-item>

        <!-- Onglet Membres -->
        <v-tabs-window-item value="members">
          <v-container>
            <v-list>
              <v-list-item v-for="member in members" :key="member.id">
                <template v-slot:prepend>
                  <v-avatar color="primary">
                    <span class="text-white">
                      {{ member.firstName[0] }}{{ member.lastName[0] }}
                    </span>
                  </v-avatar>
                </template>

                <v-list-item-title>
                  {{ member.firstName }} {{ member.lastName }}
                </v-list-item-title>

                <v-list-item-subtitle>
                  {{ member.email }}
                </v-list-item-subtitle>

                <template v-slot:append>
                  <v-chip :color="getRoleColor(member.role)" size="small" variant="tonal">
                    {{ member.role }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-container>
        </v-tabs-window-item>

        <!-- Onglet Paramètres (admin seulement) -->
        <v-tabs-window-item value="settings" v-if="isAdmin">
          <v-container>
            <v-alert type="info" variant="tonal" class="mb-4">
              En tant qu'administrateur, vous pouvez modifier les paramètres du groupe.
            </v-alert>

            <v-form>
              <v-text-field
                v-model="group.name"
                label="Nom du groupe"
                variant="outlined"
                class="mb-4"
              ></v-text-field>

              <v-textarea
                v-model="group.description"
                label="Description"
                variant="outlined"
                rows="3"
                class="mb-4"
              ></v-textarea>

              <v-btn color="primary"> Enregistrer les modifications </v-btn>
            </v-form>
          </v-container>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>

    <!-- Dialog d'invitation -->
    <v-dialog v-model="showInviteDialog" max-width="500">
      <v-card>
        <v-card-title>Inviter des membres</v-card-title>
        <v-card-text>
          <p class="mb-4">Partagez ce code d'invitation :</p>
          <v-text-field
            :model-value="group.inviteCode"
            readonly
            variant="outlined"
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copyInviteCode"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showInviteDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const tab = ref('events')
const showInviteDialog = ref(false)

// Mock data - à remplacer par des vraies données API
const group = ref({
  id: route.params.id,
  name: 'Weekend entre amis',
  description: 'Organisation de nos sorties et weekends',
  inviteCode: 'ABC123',
  memberCount: 8,
  eventCount: 3,
  userRole: 'Admin',
})

const isAdmin = computed(() => group.value.userRole === 'Admin')

const events = ref([
  {
    id: 1,
    title: 'Barbecue dimanche',
    date: new Date('2024-02-25'),
    description: 'BBQ chez Pierre',
    participantsCount: { present: 5, absent: 1, maybe: 2 },
  },
  {
    id: 2,
    title: 'Soirée jeux',
    date: new Date('2024-03-02'),
    description: 'Soirée jeux de société',
    participantsCount: { present: 4, absent: 0, maybe: 4 },
  },
])

const members = ref([
  { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.fr', role: 'Admin' },
  { id: 2, firstName: 'Marie', lastName: 'Martin', email: 'marie@test.fr', role: 'Moderator' },
  { id: 3, firstName: 'Pierre', lastName: 'Bernard', email: 'pierre@test.fr', role: 'Member' },
])

function getRoleColor(role) {
  const colors = {
    Admin: 'error',
    Moderator: 'warning',
    Member: 'info',
  }
  return colors[role] || 'grey'
}

function formatDate(date) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function copyInviteCode() {
  navigator.clipboard.writeText(group.value.inviteCode)
  // TODO: Afficher un snackbar de confirmation
}

function updateParticipation(eventId, status) {
  console.log('Update participation:', eventId, status)
  // TODO: Appel API pour mettre à jour la participation
}

onMounted(() => {
  // TODO: Charger les vraies données depuis l'API
  console.log('Loading group', route.params.id)
})
</script>
