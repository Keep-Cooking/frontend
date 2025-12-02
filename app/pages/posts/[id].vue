<script setup lang="ts">
import { Button } from "@/components/ui/button"
import type { MeResponse, PostDetail, RatingResponse } from '@/types/api'

definePageMeta({ middleware: ['auth'] })

const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const user: MeResponse = route.meta.user as MeResponse
const postId = computed(() => parseInt(route.params.id as string))

const api = $fetch.create({
  baseURL: apiBase,
  credentials: 'include',
})

const post = ref<PostDetail | null>(null)
const isLoading = ref(false)
const isUploading = ref(false)
const errorMessage = ref('')
const selectedImage = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const showLevelUpModal = ref(false)
const ratingResponse = ref<RatingResponse | null>(null)

const loadPost = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    post.value = await api<PostDetail>(`/posts/${postId.value}`)
  } catch (err: any) {
    console.error('Load post error:', err)
    errorMessage.value = err?.data?.error || 'Failed to load post'
  } finally {
    isLoading.value = false
  }
}

const handleImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    if (!file.type.startsWith('image/')) {
      errorMessage.value = 'Please select an image file'
      return
    }
    
    selectedImage.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

const uploadAndRate = async () => {
  if (!selectedImage.value || !post.value) return
  
  isUploading.value = true
  errorMessage.value = ''
  
  try {
    const formData = new FormData()
    formData.append('image', selectedImage.value)
    
    const response = await $fetch<RatingResponse>(`${apiBase}/posts/${postId.value}/generate-rating`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    
    ratingResponse.value = response
    
    if (response.level_up) {
      showLevelUpModal.value = true
    }
    
    await loadPost()
    
    selectedImage.value = null
    imagePreview.value = null
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    
  } catch (err: any) {
    console.error('Upload error:', err)
    const errMsg = err?.data?.error || err?.message || 'Failed to upload and rate image'
    errorMessage.value = errMsg
  } finally {
    isUploading.value = false
  }
}

const deletePost = async () => {
  if (!confirm('Are you sure you want to delete this post?')) return
  
  try {
    await api(`/posts/${postId.value}`, { method: 'DELETE' })
    await navigateTo('/my-posts')
  } catch (err: any) {
    console.error('Delete post error:', err)
    alert(err?.data?.error || 'Failed to delete post')
  }
}

const publishPost = async () => {
  if (!post.value) return
  
  if (!post.value.rating) {
    errorMessage.value = 'Please upload and rate your creation before publishing!'
    return
  }
  
  if (!confirm('Publish this post to the community feed? Everyone will be able to see it.')) return
  
  try {
    errorMessage.value = ''
    await api(`/posts/${postId.value}/publish`, { method: 'POST' })
    await loadPost()
    // Success message
    setTimeout(() => {
      errorMessage.value = ''
    }, 3000)
  } catch (err: any) {
    console.error('Publish post error:', err)
    errorMessage.value = err?.data?.error || 'Failed to publish post'
  }
}

const getYouTubeId = (url: string | null) => {
  if (!url) return null
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

const clearImageSelection = () => {
  imagePreview.value = null
  selectedImage.value = null
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  if (input) input.value = ''
}

onMounted(() => {
  loadPost()
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <Navbar :user="user" />
    
    <div class="p-4 sm:p-8">
      <div class="max-w-4xl mx-auto space-y-6">
        <div v-if="isLoading" class="text-center py-12">
          <div class="animate-spin h-8 w-8 border-4 border-[#FFB448] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p class="text-gray-400">Loading recipe...</p>
        </div>

        <div v-if="errorMessage" class="p-4 text-sm rounded-md" :class="errorMessage.includes('successfully') || errorMessage.includes('Published') ? 'text-green-400 border-green-500 bg-green-400/20' : 'text-red-400 border-red-500 bg-red-400/20'">
          {{ errorMessage }}
        </div>

        <div v-if="post" class="space-y-6">
          <div class="space-y-2">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h1 class="text-4xl font-bold tracking-tight text-[#FFB448]">{{ post.recipe.title }}</h1>
                <p class="text-gray-400 mt-2">by @{{ post.username }}</p>
              </div>
              <div v-if="post.rating" class="text-right">
                <div class="text-4xl">{{ '🔥'.repeat(Math.round(post.rating)) }}</div>
                <p class="text-sm text-gray-400">{{ post.rating.toFixed(1) }} rating</p>
              </div>
          </div>

          <div class="flex items-center gap-2">
            <span v-if="post.hidden" class="text-sm px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
              🔒 Hidden - Only you can see this
            </span>
            <span v-else class="text-sm px-3 py-1 rounded-full bg-green-500/20 text-green-500">
              ✅ Published
            </span>
          </div>
        </div>

        <div v-if="post.recipe.image_url" class="rounded-lg overflow-hidden">
          <img 
            :src="post.recipe.image_url" 
            :alt="post.recipe.title"
            class="w-full aspect-video object-cover"
          />
        </div>

        <div v-if="post.image_url" class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm overflow-hidden">
          <div class="p-4 border-b border-[#FFDDAA]/50">
            <h3 class="font-semibold text-[#FFB448]">Your Creation</h3>
          </div>
          <img 
            :src="post.image_url" 
            :alt="`${post.recipe.title} by ${post.username}`"
            class="w-full aspect-video object-cover"
          />
        </div>

        <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-6">
          <div class="prose prose-sm max-w-none">
            <div class="text-foreground leading-relaxed whitespace-pre-wrap">{{ post.recipe.message }}</div>
          </div>
        </div>

        <div v-if="post.recipe.video_url" class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm overflow-hidden">
          <div class="p-4 border-b border-[#FFDDAA]/50">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-[#FFB448]">Watch Video Tutorial</h4>
              <a 
                :href="post.recipe.video_url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Open on YouTube →
              </a>
            </div>
          </div>
          
          <div v-if="getYouTubeId(post.recipe.video_url)" class="aspect-video">
            <iframe
              :src="`https://www.youtube.com/embed/${getYouTubeId(post.recipe.video_url)}`"
              class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <div v-if="post.user_id === user.user_id && !post.image_url" class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm p-6 space-y-4">
          <div class="space-y-2">
            <h3 class="text-xl font-semibold text-[#FFB448]">Share Your Creation</h3>
            <p class="text-sm text-gray-400">Upload a photo of your finished dish to get AI-powered feedback and earn points!</p>
          </div>

          <div v-if="imagePreview" class="relative">
            <img :src="imagePreview" alt="Preview" class="w-full aspect-video object-cover rounded-lg" />
            <Button 
              @click="clearImageSelection"
              variant="destructive"
              size="sm"
              class="absolute top-2 right-2"
            >
              ✕ Remove
            </Button>
          </div>

          <div class="space-y-3">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-300">Choose an image file</label>
              <input
                type="file"
                accept="image/*"
                @change="handleImageSelect"
                :disabled="isUploading"
                class="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#FFB448] file:text-white
                  hover:file:bg-[#FFB448]/90
                  file:cursor-pointer cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p class="text-xs text-gray-500">Accepted formats: JPG, PNG, GIF, WebP</p>
            </div>
            
            <Button 
              @click="uploadAndRate"
              :disabled="!selectedImage || isUploading"
              class="w-full bg-[#FFB448] hover:bg-[#FFB448]/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isUploading" class="flex items-center justify-center gap-2">
                <div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Analyzing your dish...
              </span>
              <span v-else>Upload & Get AI Rating</span>
            </Button>
          </div>

          <div v-if="ratingResponse" class="p-4 border border-green-500/30 rounded-md space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-green-400">AI Feedback</h4>
              <div class="text-2xl">{{ '🔥'.repeat(Math.round(ratingResponse.rating)) }}</div>
            </div>
            <p class="text-sm text-gray-300">{{ ratingResponse.message }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span>{{ ratingResponse.user_points }} points</span>
              <span>Level {{ ratingResponse.user_level }}</span>
              <span v-if="ratingResponse.level_up" class="text-green-400 font-semibold">🎉 Level Up!</span>
            </div>
          </div>
        </div>

       

        <div v-if="post.user_id === user.user_id" class="space-y-3">
          <div v-if="post.hidden && post.rating" class="rounded-lg border-2 border-[#FFB448] bg-[#FFB448]/10 p-4">
            <div class="flex items-start gap-3 mb-3">
              <div class="text-2xl">📢</div>
              <div class="flex-1">
                <h4 class="font-semibold text-[#FFB448] mb-1">Ready to Share?</h4>
                <p class="text-sm text-gray-400">Your creation has been rated! Publish it to the community feed to share with others.</p>
              </div>
            </div>
            <Button 
              @click="publishPost"
              class="w-full bg-[#FFB448] hover:bg-[#FFB448]/90 text-white font-semibold"
            >
              Publish to Community Feed
            </Button>
          </div>

          <div v-if="errorMessage" class="p-4 text-sm rounded-md" :class="errorMessage.includes('successfully') || errorMessage.includes('Published') ? 'text-green-400 border-green-500 bg-green-400/20' : 'text-red-400 border-red-500 bg-red-400/20'">
            {{ errorMessage }}
          </div>

          <div v-if="post.hidden && !post.rating" class="p-4 bg-muted rounded-md border border-[#FFDDAA]/30">
            <p class="text-sm text-gray-800 text-center">
              Must upload and rate your creation before you can publish!
            </p>
          </div>

          <div class="flex gap-3">
            <Button 
              @click="deletePost"
              variant="outline"
              class="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              Delete Post
            </Button>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Level Up Modal -->
    <div 
      v-if="showLevelUpModal && ratingResponse" 
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="showLevelUpModal = false"
    >
      <div class="fixed inset-0 bg-black/80"></div>
      
      <div class="relative z-50 w-full max-w-md bg-card border border-[#FFDDAA] rounded-lg shadow-xl p-8 mx-4 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h3 class="text-2xl font-bold text-[#FFB448] mb-2">Level Up!</h3>
        <p class="text-lg mb-4">You've reached Level {{ ratingResponse.user_level }}!</p>
        <p class="text-sm text-gray-400 mb-6">Keep cooking to unlock more achievements!</p>
        <Button 
          @click="showLevelUpModal = false"
          class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white"
        >
          Awesome!
        </Button>
      </div>
    </div>
  </div>
</template>
