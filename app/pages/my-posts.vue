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
const errorMessage = ref('')

const loadMyPosts = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const response = await api<{ posts: MyPost[] }>('/my-posts')
    myPosts.value = response.posts
  } catch (err: any) {
    console.error('Load my posts error:', err)
    errorMessage.value = err?.data?.error || 'Failed to load your posts'
  } finally {
    isLoading.value = false
  }
}

const deletePost = async (postId: number) => {
  if (!confirm('Are you sure you want to delete this post?')) return
  
  try {
    await api(`/posts/${postId}`, { method: 'DELETE' })
    myPosts.value = myPosts.value.filter(p => p.id !== postId)
  } catch (err: any) {
    console.error('Delete post error:', err)
    alert(err?.data?.error || 'Failed to delete post')
  }
}

const publishPost = async (postId: number) => {
  if (!confirm('Publish this post to the community feed?')) return
  
  try {
    await api(`/posts/${postId}/publish`, { method: 'POST' })
    await loadMyPosts()
  } catch (err: any) {
    console.error('Publish post error:', err)
    alert(err?.data?.error || 'Failed to publish post')
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
          <h1 class="text-4xl font-bold tracking-tight text-[#FFB448]">My Posts</h1>
          <p class="text-gray-400">Manage your saved and shared recipes</p>
        </div>

      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin h-8 w-8 border-4 border-[#FFB448] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-400">Loading your posts...</p>
      </div>

      <div v-if="errorMessage" class="p-4 text-sm text-red-400 bg-red-950/50 rounded-md">
        {{ errorMessage }}
      </div>

      <div v-if="!isLoading && myPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          v-for="post in myPosts" 
          :key="post.id"
          class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm overflow-hidden hover:border-[#FFB448] transition-colors"
        >
          <NuxtLink :to="`/posts/${post.id}`">
            <div class="aspect-video w-full bg-muted flex items-center justify-center overflow-hidden">
              <img 
                v-if="post.image_url" 
                :src="post.image_url" 
                :alt="post.title"
                class="w-full h-full object-cover"
              />
              <div v-else class="text-6xl">🍳</div>
            </div>
          </NuxtLink>

          <div class="p-4 space-y-3">
            <NuxtLink :to="`/posts/${post.id}`" class="hover:text-[#FFB448] transition-colors">
              <h3 class="text-lg font-semibold">{{ post.title }}</h3>
            </NuxtLink>
            
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span v-if="post.rating">{{ '🔥'.repeat(Math.round(post.rating)) }} {{ post.rating.toFixed(1) }}</span>
              <span v-if="post.hidden" class="text-yellow-500">🔒 Hidden</span>
              <span v-else class="text-green-500">✅ Published</span>
            </div>

            <div class="flex gap-2 pt-2">
              <NuxtLink :to="`/posts/${post.id}`" class="flex-1">
                <Button variant="outline" class="w-full" size="sm">
                  View
                </Button>
              </NuxtLink>
              
              <Button 
                v-if="post.hidden"
                @click="publishPost(post.id)"
                class="flex-1 bg-[#FFB448] hover:bg-[#FFB448]/90 text-white"
                size="sm"
              >
                Publish
              </Button>
              
              <Button 
                @click="deletePost(post.id)"
                variant="destructive"
                size="sm"
              >
                🗑️
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!isLoading" class="text-center py-12">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-medium text-[#FFB448] mb-2">No Posts Yet</h3>
        <p class="text-gray-400 mb-4">Search for a recipe to get started!</p>
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
