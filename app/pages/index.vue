<script setup lang="ts">
import { Button } from "@/components/ui/button"
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-background">
        <div class="text-center space-y-8 max-w-2xl px-4">
            <img class="w-[250px] mx-auto" 
                 src="/KeepCookingPan.png" alt="Pan icon">
            
            <h1 class="text-7xl font-bold tracking-tight text-[#FFB448]">
                Keep Cooking
            </h1>
            
            <p class="text-xl text-muted-foreground max-w-md mx-auto">
                Your place to learn and build of community for cooking!
            </p>
            
            <div class="flex gap-4 justify-center pt-4">
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
</template>