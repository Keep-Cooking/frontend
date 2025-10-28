<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })
</script>

<template>
    <p>Only Authed Users can access this page.</p>
</template>