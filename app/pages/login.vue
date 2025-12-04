<script setup lang="ts">
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// grab apiBase from nuxt.config runtimeConfig
const { public: { apiBase } } = useRuntimeConfig()

// create a $fetch instance with baseURL + credentials
const api = $fetch.create({
    baseURL: apiBase,
    credentials: 'include', // httpOnly
    headers: { 'Content-Type': 'application/json' },
})

const handleLogin = async () => {
    errorMessage.value = ''
    isLoading.value = true

    try {
        // POST /login with username + password
        await api('/login', {
            method: 'POST',
            body: {
                username: username.value,
                password: password.value,
            },
        })

        // redirect to feed page once signed in
        await navigateTo('/feed')

    } catch (err: any) {
        // Show server error message if available
        const msg = err?.data?.error || 'An error occurred during login. Please try again.'
        console.error('Login error:', err)
        errorMessage.value = msg
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-background">
    
    <div class="flex-1 flex items-center justify-center">
      <div class="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-xl border border-[#FFDDAA]">
        <div class="text-center">
            <NuxtLink to="/">
                <img class="w-[300px] absolute left-1/2 transform -translate-x-1/2 -translate-y-56" 
               src="/KeepCookingPan.png" alt="Pan icon" width="120" height="120">
            </NuxtLink>
                <h1 class="text-6xl font-bold tracking-tight mb-6 text-[#FFB448] relative z-10">Keep Cooking</h1>
                <div class="relative flex py-3">
                    <div class="absolute inset-0 flex items-center">
                        <Separator class="w-full bg-[#FFDDAA]" />
                    </div>
                </div>
                <h2 class="text-xl font-semibold tracking-tight my-4">Sign in to your account</h2>
                <p class="text-muted-foreground mt-2">Enter your username below to sign in</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div class="space-y-2">
                    <label for="username" class="block text-sm font-medium">Username</label>
                    <Input 
                        id="username" 
                        v-model="username"
                        type="text" 
                        placeholder="user123" 
                        required 
                        class="w-full border-[#FFDDAA] focus-visible:border-[#FFB448] focus-visible:ring-[#FFB448]/30"
                    />
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <label for="password" class="block text-sm font-medium">Password</label>
                    </div>
                    <Input 
                        id="password" 
                        v-model="password"
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        class="w-full border-[#FFDDAA] focus-visible:border-[#FFB448] focus-visible:ring-[#FFB448]/30"
                    />
                </div>

                <div v-if="errorMessage" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {{ errorMessage }}
                </div>

                <Button 
                    type="submit" 
                    class="w-full bg-[#FFB448] hover:bg-[#FFB448]/90 text-white font-medium"
                    :class="{'opacity-80': isLoading}"
                    :disabled="isLoading"
                >
                    <span v-if="isLoading">Signing in...</span>
                    <span v-else>Sign in</span>
                </Button>
            </form>

            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <Separator class="w-full bg-[#FFDDAA]" />
                </div>
                <div class="relative flex justify-center text-xs">
                    <span class="bg-card px-2 text-muted-foreground">
                        New to Keep Cooking?
                    </span>
                </div>
        </div>

        <div class="text-center">
          <NuxtLink 
            to="/signup" 
            class="w-full inline-block py-2.5 px-4 rounded-md text-center bg-[#FFDDAA] text-[#333333] hover:bg-[#FFC784] transition-colors duration-200 font-medium"
          >
            Create an account
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template> 