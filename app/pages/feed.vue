<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { MeResponse, Post, PostsResponse } from '@/types/api'

definePageMeta({ middleware: ['auth'] })

const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const user: MeResponse = route.meta.user as MeResponse

const api = $fetch.create({
  baseURL: apiBase,
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
})

// State
const posts = ref<Post[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const page = ref(1)
const pageSize = 20
const totalPages = ref(1)
const sortBy = ref<'date_posted' | 'rating'>('rating')
const order = ref<'asc' | 'desc'>('desc')
const minRating = ref<number | null>(null)

// Load posts
const loadPosts = async (resetPage = false) => {
  if (resetPage) page.value = 1
  
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const params = new URLSearchParams({
      sort_by: sortBy.value,
      order: order.value,
      page: page.value.toString(),
      page_size: pageSize.toString(),
    })
    
    if (minRating.value !== null) {
      params.append('min_rating', minRating.value.toString())
    }
    
    const response = await api<PostsResponse>(`/posts?${params.toString()}`)
    
    if (resetPage) {
      posts.value = response.items
    } else {
      posts.value.push(...response.items)
    }
    
    totalPages.value = response.total_pages
  } catch (err: any) {
    console.error('Load posts error:', err)
    errorMessage.value = 'The community feed is temporarily unavailable. Please check back later or view your own posts.'
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  if (page.value < totalPages.value) {
    page.value++
    loadPosts()
  }
}

const deletePost = async (postId: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return
  
  try {
    await api(`/posts/${postId}`, { method: 'DELETE' })
    await navigateTo('/feed')
  } catch (err: any) {
    console.error('Delete post error:', err)
    alert(err?.data?.error || 'Failed to delete post')
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

watch([sortBy, order, minRating], () => {
  if (!errorMessage.value) {
    loadPosts(true)
  }
})

// Initial load
onMounted(() => {
  loadPosts()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar :user="user" />
    
    <div class="p-4 sm:p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="space-y-2">
          <h1 class="text-4xl font-bold tracking-tight text-[#FFB448]">Community Feed</h1>
          <p class="text-gray-400">Discover amazing recipes from the community</p>
        </div>

      <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Sort By</label>
            <select 
              v-model="sortBy"
              class="w-full px-3 py-2 bg-background border border-[#FFDDAA] rounded-md focus:outline-none focus:border-[#FFB448]"
            >
              <option value="rating">Rating</option>
              <option value="date_posted">Date Posted</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Order</label>
            <select 
              v-model="order"
              class="w-full px-3 py-2 bg-background border border-[#FFDDAA] rounded-md focus:outline-none focus:border-[#FFB448]"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium">Min Rating</label>
            <select 
              v-model.number="minRating"
              class="w-full px-3 py-2 bg-background border border-[#FFDDAA] rounded-md focus:outline-none focus:border-[#FFB448]"
            >
              <option :value="null">All</option>
              <option :value="1">1+ 🔥</option>
              <option :value="2">2+ 🔥</option>
              <option :value="3">3+ 🔥</option>
              <option :value="4">4+ 🔥</option>
              <option :value="5">5 🔥</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading && posts.length === 0" class="text-center py-12">
        <div class="animate-spin h-8 w-8 border-4 border-[#FFB448] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-400">Loading posts...</p>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="rounded-lg border border-red-500/50 bg-red-950/20 p-6">
        <h3 class="text-lg font-semibold text-red-400 mb-2">⚠️ Community Feed Unavailable</h3>
        <p class="text-sm text-gray-400 mb-4">{{ errorMessage }}</p>
        <div class="flex gap-3">
          <NuxtLink to="/my-posts">
            <Button class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white">
              View My Posts
            </Button>
          </NuxtLink>
          <NuxtLink to="/catalog">
            <Button variant="outline">
              Search Recipes
            </Button>
          </NuxtLink>
        </div>
      </div>

      <div v-if="posts.length > 0" class="space-y-6">
        <div 
          v-for="post in posts" 
          :key="post.id"
          class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm overflow-hidden hover:border-[#FFB448] transition-colors"
        >
          <div class="p-4 border-b border-[#FFDDAA]/50">
            <div class="flex items-center justify-between">
              <div>
                <Button
                    v-if="user?.admin"
                    @click="deletePost(post.id)"
                    variant="destructive"
                    size="sm"
                >
                🗑️
                </Button>
                <NuxtLink :to="`/posts/${post.id}`" class="hover:text-[#FFB448] transition-colors">
                  <h3 class="text-xl font-semibold">{{ post.recipe.title }}</h3>
                </NuxtLink>
                <p class="text-sm text-gray-400">by @{{ post.username }} • {{ formatDate(post.date_posted) }}</p>
              </div>
              <div v-if="post.rating" class="text-right">
                <div class="text-2xl">{{ '🔥'.repeat(Math.round(post.rating)) }}</div>
                <p class="text-xs text-gray-400">{{ post.rating.toFixed(1) }} rating</p>
              </div>
            </div>
          </div>

          <div v-if="post.image_url" class="aspect-video w-full bg-muted">
            <img 
              :src="post.image_url" 
              :alt="`${post.recipe.title} by ${post.username}`"
              class="w-full h-full object-cover cursor-pointer"
              @click="navigateTo(`/posts/${post.id}`)"
            />
          </div>

          <div class="p-4">
            <NuxtLink :to="`/posts/${post.id}`">
              <Button class="w-full bg-[#FFB448] hover:bg-[#FFB448]/90 text-white">
                View Recipe
              </Button>
            </NuxtLink>
          </div>
        </div>

        <div v-if="page < totalPages" class="text-center">
          <Button 
            @click="loadMore"
            :disabled="isLoading"
            class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white"
          >
            {{ isLoading ? 'Loading...' : 'Load More' }}
          </Button>
        </div>
      </div>

      <div v-else-if="!isLoading" class="text-center py-12">
        <div class="text-6xl mb-4">🍳</div>
        <h3 class="text-xl font-medium text-[#FFB448] mb-2">No Posts Yet</h3>
        <p class="text-gray-400 mb-4">Be the first to share a recipe!</p>
        <NuxtLink to="/catalog">
          <Button class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white">
            Search for Recipes
          </Button>
        </NuxtLink>
      </div>
      </div>
    </div>
  </div>
</template>
