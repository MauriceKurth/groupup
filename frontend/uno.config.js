import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(), // Classes Tailwind-like
  ],
  // Quelques raccourcis custom pour notre app
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    'flex-between': 'flex items-center justify-between',
    'card-shadow': 'shadow-md hover:shadow-lg transition-shadow',
    'gradient-primary': 'bg-gradient-to-r from-blue-500 to-blue-600',
    'gradient-success': 'bg-gradient-to-r from-green-500 to-green-600',
  },
  rules: [
    // Règles custom si besoin
  ],
  theme: {
    colors: {
      // On peut override ou ajouter des couleurs
    },
  },
})
