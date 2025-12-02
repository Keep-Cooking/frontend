<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MeResponse, SearchResponse } from '@/types/api'

definePageMeta({ middleware: ['auth'] })

const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const user: MeResponse = route.meta.user as MeResponse

const searchQuery = ref('')
const isSearching = ref(false)
const errorMessage = ref('')

// silly loading messages
const cookingMessages = [
  "Hunting for the perfect ingredients...",
  "Consulting with master chefs...",
  "Flipping through ancient recipe scrolls...",
  "Sprinkling some culinary magic...",
  "Heating up the AI kitchen...",
  "Stirring up something delicious...",
  "Adding the perfect seasonings...",
  "Calculating flavor combinations...",
  "Targeting your taste preferences...",
  "Perfecting the recipe just for you...",
  "Gathering fresh ingredients...",
  "Supercharging the flavor database...",
  "Mixing culinary science with art...",
  "Painting the perfect flavor profile...",
  "Exploring global cuisine traditions...",
]

const currentCookingMessage = ref(cookingMessages[0])
let messageInterval: NodeJS.Timeout | null = null

const api = $fetch.create({
  baseURL: apiBase,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
})

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  errorMessage.value = ''
  isSearching.value = true
  
  let messageIndex = 0
  currentCookingMessage.value = cookingMessages[messageIndex]
  
  messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % cookingMessages.length
    currentCookingMessage.value = cookingMessages[messageIndex]
  }, 3500)
  
  try {
    const result = await api<SearchResponse>('/search', {
      method: 'POST',
      body: {
        query: searchQuery.value.trim()
      }
    })

    await navigateTo(`/posts/${result.post_id}`)

  } catch (err: any) {
    console.error('Search error:', err)
    const msg = err?.data?.error || 'Failed to search for recipes. Please try again.'
    errorMessage.value = msg
  } finally {
    isSearching.value = false
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar :user="user" />
    
    <div class="p-4 sm:p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="space-y-2">
          <h1 class="text-4xl font-bold tracking-tight text-[#FFB448]">Recipe Catalog</h1>
          <p class="text-gray-400">Search for recipes using AI-powered recommendations</p>
        </div>

      <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm">
        <div class="p-6 space-y-4">
          <form @submit.prevent="handleSearch" class="flex gap-3">
            <Input 
              v-model="searchQuery"
              type="text"
              placeholder="Search for recipes... (e.g., 'chicken pasta', 'beef with onions', 'chocolate cake')"
              :disabled="isSearching"
              class="flex-1 border-[#FFDDAA] focus-visible:border-[#FFB448] focus-visible:ring-[#FFB448]/30"
            />
            <Button 
              type="submit"
              :disabled="isSearching || !searchQuery.trim()"
              class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white font-medium px-6 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSearching" class="flex items-center gap-2">
                <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Searching...
              </span>
              <span v-else>Search</span>
            </Button>
          </form>

          <div v-if="isSearching" class="p-6 bg-muted rounded-md">
            <div class="flex flex-col items-center gap-4">
              <div class="animate-spin h-12 w-12 border-4 border-[#FFB448] border-t-transparent rounded-full"></div>
              <div class="text-sm text-gray-400 text-center">
                {{ currentCookingMessage }}
              </div>
            </div>
          </div>

          <div v-if="errorMessage" class="p-3 text-sm text-red-400 bg-red-950/50 bg-opacity-10 rounded-md">
            {{ errorMessage }}
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-6">
        <h3 class="text-lg font-semibold text-[#FFB448] mb-3">How It Works</h3>
        <ul class="space-y-2 text-sm text-gray-400">
          <li>Search for any recipe using natural language</li>
          <li>Our AI will find the perfect recipe from TheMealDB</li>
          <li>A new post will be created with your recipe</li>
          <li>Upload a photo of your creation to get rated</li>
          <li>Earn points and level up as you cook!</li>
          <li>Publish your best dishes to the community feed</li>
        </ul>
      </div>
      </div>
    </div>
  </div>
</template>
