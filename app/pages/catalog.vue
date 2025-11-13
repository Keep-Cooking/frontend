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
const searchResults = ref<Array<SearchResponse & { timestamp: number }>>([])
const errorMessage = ref('')

const api = $fetch.create({
  baseURL: apiBase,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
})

const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  errorMessage.value = ''
  isSearching.value = true
  
  try {
    const result = await api<SearchResponse>('/search', {
      method: 'GET',
      body: {
        query: searchQuery.value.trim()
      }
    })

    searchResults.value.unshift({
      message: result.message,
      image_url: result.image_url,
      video_url: result.video_url,
      timestamp: Date.now()
    })

  } catch (err: any) {
    console.error('Search error:', err)
    const msg = err?.data?.error || 'Failed to search for recipes. Please try again.'
    errorMessage.value = msg
  } finally {
    isSearching.value = false
  }
}

const clearResults = () => {
  searchResults.value = []
  errorMessage.value = ''
}

const getYouTubeId = (url: string) => {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}
</script>

<template>
  <div class="min-h-screen bg-background p-4 sm:p-8">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tight text-[#FFB448]">Recipe Catalog</h1>
        <p class="text-gray-400">Search for recipes using AI-powered recommendations</p>
      </div>

      <!-- Search Section -->
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
              <span v-else>🔍 Search</span>
            </Button>
          </form>

          <!-- Loading indicator -->
          <div v-if="isSearching" class="p-6 bg-muted rounded-md">
            <div class="flex flex-col items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="animate-spin h-6 w-6 border-3 border-[#FFB448] border-t-transparent rounded-full"></div>
                <h3 class="text-base font-medium text-[#FFB448]">AI is searching for your recipe...</h3>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-400">
                <span>🤖</span>
                <span>Analyzing ingredients, cooking methods, and finding the perfect match</span>
              </div>
              <div class="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div class="bg-[#FFB448] h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>

          <!-- Error message -->
          <div v-if="errorMessage" class="p-3 text-sm text-red-400 bg-red-950/50 bg-opacity-10 rounded-md">
            {{ errorMessage }}
          </div>

          <!-- Clear results button -->
          <div v-if="searchResults.length > 0" class="flex justify-end">
            <Button 
              @click="clearResults"
              variant="outline"
              class="text-sm"
            >
              Clear Results
            </Button>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="space-y-6">
        <h2 class="text-2xl font-semibold text-[#FFB448]">Search Results</h2>
        
        <div class="space-y-6">
          <div 
            v-for="result in searchResults" 
            :key="result.timestamp"
            class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm overflow-hidden"
          >
            <!-- Recipe Image -->
            <div v-if="result.image_url" class="aspect-video w-full bg-muted">
              <img 
                :src="result.image_url" 
                alt="Recipe image"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <!-- Recipe Content -->
            <div class="p-6 space-y-4">
              <!-- Recipe Text -->
              <div class="prose prose-sm max-w-none">
                <div class="text-foreground leading-relaxed" v-html="result.message.replace(/\*\*(.*?)\*\*/g, '<strong class=&quot;text-[#FFB448] font-semibold&quot;>$1</strong>').replace(/\n/g, '<br>')"></div>
              </div>

              <!-- Video Link -->
              <div v-if="result.video_url" class="pt-4 border-t border-[#FFDDAA]">
                <div class="flex items-center justify-between">
                  <h4 class="text-sm font-medium text-[#FFB448]">Watch Video Tutorial</h4>
                  <a 
                    :href="result.video_url" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Open on YouTube →
                  </a>
                </div>
                
                <!-- Embedded YouTube player if we have a valid YouTube ID -->
                <div v-if="getYouTubeId(result.video_url)" class="mt-3 aspect-video rounded-lg overflow-hidden">
                  <iframe
                    :src="`https://www.youtube.com/embed/${getYouTubeId(result.video_url)}`"
                    class="w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!isSearching" class="text-center py-12">
        <div class="space-y-4">
          <div class="text-6xl">🍳</div>
          <h3 class="text-xl font-medium text-[#FFB448]">Start Your Culinary Journey</h3>
          <p class="text-gray-400 max-w-md mx-auto">
            Search for any dish, ingredient, or cooking style and let our AI find the perfect recipe for you.
          </p>
        </div>
      </div>

      <!-- Navigation -->
      <div class="pt-4 flex justify-between">
        <NuxtLink 
          to="/settings" 
          class="text-sm text-gray-400 hover:text-[#FFB448] transition-colors"
        >
          ← Settings
        </NuxtLink>
        <NuxtLink 
          to="/" 
          class="text-sm text-gray-400 hover:text-[#FFB448] transition-colors"
        >
          Home →
        </NuxtLink>
      </div>
    </div>
  </div>
</template>