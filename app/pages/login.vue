<script setup lang="ts">
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Form data
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

// Form submission handler
const handleLogin = async () => {
    errorMessage.value = ''
    isLoading.value = true

    try {
        console.log('Login attempted with:', { username: username.value, password: password.value })        
        // api call to login
    } catch (error) {
        console.error('Login error:', error)
        errorMessage.value = 'An error occurred during login. Please try again.'
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-background">
        <div class="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border border-border">
            <div class="text-center">
                <h1 class="text-7xl font-bold tracking-tight mb-10">Keep Cooking</h1>
                <Separator class="w-full" />
                <h2 class="text-xl font-semibold tracking-tight my-2">Sign in to your account</h2>
                <p class="text-muted-foreground mt-2">Enter your Username below to sign in to your account</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div class="space-y-2">
                    <label for="username" class="block text-sm font-medium">Username</label>
                    <Input 
                        id="username" 
                        v-model="username"
                        type="username" 
                        placeholder="user123" 
                        required 
                        class="w-full"
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
                        class="w-full"
                    />
                </div>

                <div v-if="errorMessage" class="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                    {{ errorMessage }}
                </div>

                <Button type="submit" class="w-full" :disabled="isLoading">
                    <span v-if="isLoading">Signing in...</span>
                    <span v-else>Sign in</span>
                </Button>
            </form>

            <div class="text-center text-sm mt-4">
                <p class="text-muted-foreground">
                    Don't have an account?
                    <NuxtLink to="/signup" class="font-medium text-primary hover:underline">
                        Sign up
                    </NuxtLink>
                </p>
            </div>
        </div>
    </div>
</template> 