<script setup lang="ts">
import { Button } from "@/components/ui/button"
import type { MeResponse } from '@/types/api'
import { useRoute } from 'vue-router'

definePageMeta({ middleware: ['auth'] })

const { public: { apiBase } } = useRuntimeConfig()
const route = useRoute()
const user: MeResponse = route.meta.user as MeResponse
const isDeleting = ref(false)
const showDeleteDialog = ref(false)
const errorMessage = ref('')

const api = $fetch.create({
    baseURL: apiBase,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
})


const handleLogout = async () => {
    try {
        await api('/logout', { method: 'POST' })
        await navigateTo('/login')
    } catch (err: any) {
        console.error('Logout error:', err)
        errorMessage.value = 'Failed to logout. Please try again.'
    }
}

const handleDeleteAccount = async () => {
    errorMessage.value = ''
    isDeleting.value = true

    try {
        await api('/remove-account', { method: 'POST' })
        await navigateTo('/')
    } catch (err: any) {
        const msg = err?.data?.error || 'Failed to delete account. Please try again.'
        console.error('Delete account error:', err)
        errorMessage.value = msg
        isDeleting.value = false
        showDeleteDialog.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-background p-8">
        <div class="max-w-2xl mx-auto space-y-6">
            <div class="space-y-2">
                <h1 class="text-4xl font-bold tracking-tight text-[#FFB448]">Settings</h1>
                <p class="text-gray-400">Manage your account settings</p>
            </div>

            <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm">
                <div class="p-6 space-y-1.5 border-b border-[#FFDDAA]">
                    <h2 class="text-2xl font-semibold">Account Information</h2>
                    <p class="text-sm text-gray-400">Your personal details</p>
                </div>
                <div class="p-6 space-y-4">
                    <div class="space-y-1">
                        <p class="text-sm font-medium text-gray-400">Username</p>
                        <p class="text-base">{{ user?.username || 'Loading...' }}</p>
                    </div>
                    <div class="space-y-1">
                        <p class="text-sm font-medium text-gray-400">Email</p>
                        <p class="text-base">{{ user?.email || 'Loading...' }}</p>
                    </div>
                </div>
            </div>

            <div class="rounded-lg border border-[#FFDDAA] bg-card shadow-sm">
                <div class="p-6 space-y-1.5 border-b border-[#FFDDAA]">
                    <h2 class="text-2xl font-semibold">Account Actions</h2>
                    <p class="text-sm text-gray-400">Manage your session and account</p>
                </div>
                <div class="p-6 space-y-4">
                    <div class="flex flex-col gap-3">
                        <Button 
                            @click="handleLogout"
                            class="bg-[#FFB448] hover:bg-[#FFB448]/90 text-white font-medium w-full sm:w-auto"
                        >
                            Sign Out
                        </Button>

                        <Button 
                            @click="showDeleteDialog = true"
                            variant="destructive"
                            class="w-full sm:w-auto"
                        >
                            Delete Account
                        </Button>
                    </div>

                    <div v-if="errorMessage" class="p-3 text-sm text-red-400 bg-red-950/50 rounded-md">
                        {{ errorMessage }}
                    </div>
                </div>
            </div>

            <div class="pt-4">
                <NuxtLink 
                    to="/" 
                    class="text-sm text-gray-400 hover:text-[#FFB448] transition-colors"
                >
                    ← Back to home
                </NuxtLink>
            </div>
        </div>

        <!-- confirmation modal -->
        <div 
            v-if="showDeleteDialog" 
            class="fixed inset-0 z-50 flex items-center justify-center"
            @click.self="showDeleteDialog = false"
        >
            <div class="fixed inset-0 bg-black/80"></div>
            
            <div class="relative z-50 w-full max-w-lg bg-card border border-[#FFDDAA] rounded-lg shadow-xl p-6 mx-4">
                <div class="space-y-4">
                    <div class="space-y-2">
                        <h3 class="text-lg font-semibold">Are you absolutely sure?</h3>
                        <p class="text-sm text-gray-400">
                            This action cannot be undone. This will permanently delete your account
                            and remove all of your data from our servers.
                        </p>
                    </div>
                    
                    <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button 
                            @click="showDeleteDialog = false"
                            variant="outline"
                            :disabled="isDeleting"
                            class="sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button 
                            @click="handleDeleteAccount"
                            :disabled="isDeleting"
                            variant="destructive"
                            class="sm:w-auto"
                        >
                            {{ isDeleting ? 'Deleting...' : 'Delete Account' }}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
