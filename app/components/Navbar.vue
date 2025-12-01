<script setup lang="ts">
import { Button } from "@/components/ui/button"
import type { MeResponse } from '@/types/api'

const props = defineProps<{
  user?: MeResponse
}>()

const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const isLoggingOut = ref(false)

const isActive = (path: string) => {
  return route.path === path
}

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await $fetch(`${apiBase}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    await navigateTo('/login')
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    isLoggingOut.value = false
  }
}
</script>

<template>
  <nav class="border-b border-[#FFDDAA] bg-card shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <NuxtLink to="/" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span class="text-2xl">🍳</span>
          <span class="text-xl font-bold text-[#FFB448]">KeepCooking</span>
        </NuxtLink>

        <!-- Unauthenticated Navigation -->
        <div v-if="!user?.authenticated" class="flex items-center gap-4">
          <NuxtLink 
            to="/login"
            :class="[
              'text-sm font-medium transition-colors',
              isActive('/login') ? 'text-[#FFB448]' : 'text-gray-400 hover:text-[#FFB448]'
            ]"
          >
            Login
          </NuxtLink>
          <NuxtLink 
            to="/signup"
            :class="[
              'text-sm font-medium transition-colors',
              isActive('/signup') ? 'text-[#FFB448]' : 'text-gray-400 hover:text-[#FFB448]'
            ]"
          >
            Sign Up
          </NuxtLink>
        </div>

        <!-- Authenticated Navigation -->
        <div v-else class="flex items-center gap-6">
          <NuxtLink 
            to="/feed"
            :class="[
              'text-sm font-medium transition-colors',
              isActive('/feed') ? 'text-[#FFB448]' : 'text-gray-400 hover:text-[#FFB448]'
            ]"
          >
            Feed
          </NuxtLink>
          <NuxtLink 
            to="/catalog"
            :class="[
              'text-sm font-medium transition-colors',
              isActive('/catalog') ? 'text-[#FFB448]' : 'text-gray-400 hover:text-[#FFB448]'
            ]"
          >
            Search
          </NuxtLink>
          <NuxtLink 
            to="/my-posts"
            :class="[
              'text-sm font-medium transition-colors',
              isActive('/my-posts') ? 'text-[#FFB448]' : 'text-gray-400 hover:text-[#FFB448]'
            ]"
          >
            My Posts
          </NuxtLink>
          <NuxtLink 
            to="/profile"
            :class="[
              'text-sm font-medium transition-colors',
              isActive('/profile') ? 'text-[#FFB448]' : 'text-gray-400 hover:text-[#FFB448]'
            ]"
          >
            Profile
          </NuxtLink>
          
          <div class="h-6 w-px bg-[#FFDDAA]/30"></div>
          
          <!-- User info & logout -->
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-400">@{{ user.username }}</span>
              <span class="text-xs px-2 py-1 rounded-full bg-[#FFB448]/20 text-[#FFB448]">
                Lv {{ user.level }}
              </span>
            </div>
            <Button
              @click="handleLogout"
              :disabled="isLoggingOut"
              variant="outline"
              size="sm"
              class="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <span v-if="isLoggingOut">...</span>
              <span v-else>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
