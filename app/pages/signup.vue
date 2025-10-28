<script setup lang="ts">
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
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

// Form submission handler
const handleSignup = async () => {
    errorMessage.value = ''

    if (password.value !== confirmPassword.value) {
        errorMessage.value = 'Passwords do not match'
        return
    }

    isLoading.value = true

    try {
        // POST /signup with username, email, password
        await api('/signup', {
            method: 'POST',
            body: {
                username: username.value,
                email: email.value,
                password: password.value,
            },
        })

        // redirect to home page once signed in
        await navigateTo('/')

    } catch (err: any) {
        // Show server error message if available
        const msg = err?.data?.error || 'An error occurred during signup. Please try again.'
        console.error('Signup error:', err)
        errorMessage.value = msg
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-xl border border-[#FFDDAA]">
            <div class="text-center">
                <img class="w-[300px] absolute left-1/2 transform -translate-x-1/2 -translate-y-56" 
                     src="/KeepCookingPan.png" alt="Pan icon" width="120" height="120">
                <h1 class="text-6xl font-bold tracking-tight mb-6 text-[#FFB448] relative z-10">Keep Cooking</h1>
                
                <div class="relative flex py-3">
                    <div class="absolute inset-0 flex items-center">
                        <Separator class="w-full bg-[#FFDDAA]" />
                    </div>
                </div>
                <h2 class="text-xl font-semibold tracking-tight my-4">Create your account</h2>
                <p class="text-muted-foreground mt-2">Join our cooking community to discover recipes and share your creations</p>
            </div>

            <form @submit.prevent="handleSignup" class="space-y-5">
                <!-- Username field -->
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
                    <label for="email" class="block text-sm font-medium">Email</label>
                    <Input 
                        id="email" 
                        v-model="email"
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        class="w-full border-[#FFDDAA] focus-visible:border-[#FFB448] focus-visible:ring-[#FFB448]/30"
                    />
                </div>

                <div class="space-y-2">
                    <label for="password" class="block text-sm font-medium">Password</label>
                    <Input 
                        id="password" 
                        v-model="password"
                        type="password" 
                        placeholder="••••••••" 
                        required 
                        class="w-full border-[#FFDDAA] focus-visible:border-[#FFB448] focus-visible:ring-[#FFB448]/30"
                    />
                </div>

                <div class="space-y-2">
                    <label for="confirmPassword" class="block text-sm font-medium">Confirm Password</label>
                    <Input 
                        id="confirmPassword" 
                        v-model="confirmPassword"
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
                    <span v-if="isLoading">Creating account...</span>
                    <span v-else>Sign up</span>
                </Button>
            </form>

            <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                    <Separator class="w-full bg-[#FFDDAA]" />
                </div>
                <div class="relative flex justify-center text-xs">
                    <span class="bg-card px-2 text-muted-foreground">
                        Already have an account?
                    </span>
                </div>
            </div>

            <div class="text-center">
                <NuxtLink 
                    to="/login" 
                    class="w-full inline-block py-2.5 px-4 rounded-md text-center bg-[#FFDDAA] text-[#333333] hover:bg-[#FFC784] transition-colors duration-200 font-medium"
                >
                    Sign in instead
                </NuxtLink>
            </div>
        </div>
    </div>
</template>