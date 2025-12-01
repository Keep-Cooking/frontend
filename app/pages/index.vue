<script setup lang="ts">
import { Button } from "@/components/ui/button"
import type { MeResponse } from '@/types/api'

const { public: { apiBase } } = useRuntimeConfig()
const user = ref<MeResponse | null>(null)

onMounted(async () => {
  try {
    const me = await $fetch<MeResponse>(`${apiBase}/me`, {
      credentials: 'include'
    })
    if (me?.authenticated) {
      user.value = me
    }
  } catch {
    // User not authenticated, ignore error
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    <Navbar :user="user || undefined" />
    
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center space-y-8 max-w-2xl px-4">
        <img class="w-[250px] mx-auto" 
             src="/KeepCookingPan.png" alt="Pan icon">
        
        <h1 class="text-7xl font-bold tracking-tight text-[#FFB448]">
          Keep Cooking
        </h1>
        
        <p class="text-xl text-muted-foreground max-w-md mx-auto">
          Your place to learn and build a community for cooking!
        </p>
        
        <!-- Show different buttons based on authentication status -->
        <div v-if="user?.authenticated" class="flex flex-col gap-4 justify-center pt-4 max-w-sm mx-auto">
          <NuxtLink to="/feed">
            <Button class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white font-medium px-8 w-full">
              Community Feed
            </Button>
          </NuxtLink>
          
          <NuxtLink to="/catalog">
            <Button class="bg-[#FFDDAA] hover:bg-[#FFC784] text-[#333333] font-medium px-8 w-full">
              Search Recipes
            </Button>
          </NuxtLink>

          <NuxtLink to="/profile">
            <Button variant="outline" class="font-medium px-8 w-full">
              My Profile
            </Button>
          </NuxtLink>
        </div>
        
        <div v-else class="flex gap-4 justify-center pt-4">
          <NuxtLink to="/login">
            <Button class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white font-medium px-8">
              Sign In
            </Button>
          </NuxtLink>
          
          <NuxtLink to="/signup">
            <Button class="bg-[#FFDDAA] hover:bg-[#FFC784] text-[#333333] font-medium px-8">
              Get Started
            </Button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>