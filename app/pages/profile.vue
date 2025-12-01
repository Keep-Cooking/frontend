<script setup lang="ts">
import { Button } from "@/components/ui/button"
import type { MeResponse, MyPost } from '@/types/api'

definePageMeta({ middleware: ['auth'] })

const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const user: MeResponse = route.meta.user as MeResponse

const api = $fetch.create({
  baseURL: apiBase,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
})

const myPosts = ref<MyPost[]>([])
const isLoading = ref(false)
const userPoints = ref(0)
const userLevel = ref(1)

// Stats computed from posts
const stats = computed(() => {
  const publishedPosts = myPosts.value.filter(p => !p.hidden)
  const ratedPosts = myPosts.value.filter(p => p.rating !== null)
  const totalRating = myPosts.value.reduce((sum, p) => sum + (p.rating || 0), 0)
  const avgRating = ratedPosts.length > 0 ? totalRating / ratedPosts.length : 0
  
  // Calculate points from ratings (1 flame = 1 point)
  userPoints.value = Math.floor(totalRating)
  userLevel.value = Math.floor(userPoints.value / 20)
  
  return {
    totalPosts: myPosts.value.length,
    publishedPosts: publishedPosts.length,
    recipesAttempted: ratedPosts.length,
    averageRating: avgRating,
    totalVotes: myPosts.value.reduce((sum, p) => sum + p.votes, 0),
  }
})

// Calculate progress to next level (20 points per level)
const levelProgress = computed(() => {
  return {
    currentLevel: userLevel.value,
    pointsInLevel: userPoints.value % 20,
    pointsToNextLevel: 20,
    percentage: (userPoints.value % 20) / 20 * 100
  }
})

const loadMyPosts = async () => {
  isLoading.value = true
  
  try {
    const response = await api<{ posts: MyPost[] }>('/my-posts')
    myPosts.value = response.posts
  } catch (err: any) {
    console.error('Load my posts error:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadMyPosts()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar :user="user" />
    
    <div class="p-4 sm:p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="space-y-2">
          <h1 class="text-4xl font-bold tracking-tight text-[#FFB448]">My Profile</h1>
          <p class="text-gray-400">Track your culinary journey</p>
        </div>

      <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-6">
        <div class="flex items-center gap-6">
          <div class="w-24 h-24 rounded-full bg-[#FFB448]/20 flex items-center justify-center text-center text-4xl">👨‍🍳</div>
          <div class="flex-1 space-y-2">
            <h2 class="text-2xl font-bold">@{{ user.username }}</h2>
            <p class="text-gray-400">{{ user.email }}</p>
            <div class="flex items-center gap-4 text-sm">
              <span class="px-3 py-1 rounded-full bg-[#FFB448]/20 text-[#FFB448] font-semibold">
                Level {{ levelProgress.currentLevel }}
              </span>
              <span class="text-gray-400">
                ⭐ {{ userPoints }} points
              </span>
            </div>
          </div>
          <div>
            <NuxtLink to="/settings">
              <Button variant="outline" class="border-[#FFDDAA]">
                Settings
              </Button>
            </NuxtLink>
          </div>
        </div>

        <div class="mt-6 space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-400">Progress to Level {{ levelProgress.currentLevel + 1 }}</span>
            <span class="text-[#FFB448] font-semibold">{{ levelProgress.pointsInLevel }}/{{ levelProgress.pointsToNextLevel }} points</span>
          </div>
          <div class="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div 
              class="bg-[#FFB448] h-2.5 rounded-full transition-all duration-500"
              :style="{ width: `${levelProgress.percentage}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-4 text-center">
          <div class="text-3xl font-bold text-[#FFB448]">{{ stats.totalPosts }}</div>
          <p class="text-sm text-gray-400 mt-1">Total Recipes</p>
        </div>
        
        <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-4 text-center">
          <div class="text-3xl font-bold text-[#FFB448]">{{ stats.recipesAttempted }}</div>
          <p class="text-sm text-gray-400 mt-1">Dishes Attempted</p>
        </div>
        
        <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-4 text-center">
          <div class="text-3xl font-bold text-[#FFB448]">{{ stats.publishedPosts }}</div>
          <p class="text-sm text-gray-400 mt-1">Published</p>
        </div>
        
        <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-4 text-center">
          <div class="text-3xl font-bold text-[#FFB448]">{{ stats.averageRating.toFixed(1) }}</div>
          <p class="text-sm text-gray-400 mt-1">Avg Rating 🔥</p>
        </div>
      </div>

      <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm">
        <div class="p-6 border-b border-[#FFDDAA]/50">
          <h3 class="text-xl font-semibold text-[#FFB448]">Recent Activity</h3>
        </div>
        
        <div v-if="isLoading" class="p-12 text-center">
          <div class="animate-spin h-8 w-8 border-4 border-[#FFB448] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-gray-400">Loading activity...</p>
        </div>
        
        <div v-else-if="myPosts.length > 0" class="p-6 space-y-4">
          <div 
            v-for="post in myPosts.slice(0, 5)" 
            :key="post.id"
            class="flex items-center justify-between p-4 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
          >
            <div class="flex-1">
              <NuxtLink :to="`/posts/${post.id}`" class="hover:text-[#FFB448] transition-colors">
                <h4 class="font-semibold">{{ post.title }}</h4>
              </NuxtLink>
              <div class="flex items-center gap-3 text-sm text-gray-400 mt-1">
                <span v-if="post.rating">{{ '🔥'.repeat(Math.round(post.rating)) }} {{ post.rating.toFixed(1) }}</span>
                <span>👍 {{ post.votes }}</span>
                <span v-if="post.hidden" class="text-yellow-500">🔒 Hidden</span>
              </div>
            </div>
            <NuxtLink :to="`/posts/${post.id}`">
              <Button variant="outline" size="sm">
                View
              </Button>
            </NuxtLink>
          </div>
          
          <NuxtLink to="/my-posts" class="block text-center">
            <Button variant="outline" class="w-full">
              View All Posts
            </Button>
          </NuxtLink>
        </div>
        
        <div v-else class="p-12 text-center">
          <div class="text-4xl mb-4">🍳</div>
          <p class="text-gray-400 mb-4">No activity yet</p>
          <NuxtLink to="/catalog">
            <Button class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white">
              Start Cooking
            </Button>
          </NuxtLink>
        </div>
      </div>

      <!-- Achievements Section -->
      <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-6">
        <h3 class="text-xl font-semibold text-[#FFB448] mb-4">Achievements</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            :class="[
              'p-4 rounded-lg text-center transition-all',
              stats.totalPosts >= 1 ? 'bg-[#FFB448]/20 border-2 border-[#FFB448]' : 'bg-muted opacity-50'
            ]"
          >
            <div class="text-3xl mb-2">🥚</div>
            <p class="text-xs font-semibold">First Recipe</p>
          </div>
          
          <div 
            :class="[
              'p-4 rounded-lg text-center transition-all',
              stats.recipesAttempted >= 5 ? 'bg-[#FFB448]/20 border-2 border-[#FFB448]' : 'bg-muted opacity-50'
            ]"
          >
            <div class="text-3xl mb-2">🍳</div>
            <p class="text-xs font-semibold">5 Dishes Made</p>
          </div>
          
          <div 
            :class="[
              'p-4 rounded-lg text-center transition-all',
              stats.publishedPosts >= 3 ? 'bg-[#FFB448]/20 border-2 border-[#FFB448]' : 'bg-muted opacity-50'
            ]"
          >
            <div class="text-3xl mb-2">📢</div>
            <p class="text-xs font-semibold">3 Published</p>
          </div>
          
          <div 
            :class="[
              'p-4 rounded-lg text-center transition-all',
              stats.averageRating >= 4 ? 'bg-[#FFB448]/20 border-2 border-[#FFB448]' : 'bg-muted opacity-50'
            ]"
          >
            <div class="text-3xl mb-2">⭐</div>
            <p class="text-xs font-semibold">4+ Avg Rating</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
