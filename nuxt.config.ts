import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: ['shadcn-nuxt'],
  shadcn: {
    /**
     * Prefix for all the imported component
    //  */
    // prefix: 'shadcn-',
    // componentDir: '~/components/shadcn'
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE ?? 'http://localhost:8000/api'
    }
  }
})