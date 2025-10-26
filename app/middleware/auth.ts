export default defineNuxtRouteMiddleware(async () => {
    // Skip SSR: API-domain HttpOnly cookie isn't available to the frontend server
    if (import.meta.server) return

    const { public: { apiBase } } = useRuntimeConfig()

    try {
        // Get the result of /me (returns dict with authenticated boolean)
        const me = await $fetch<{ authenticated: boolean }>(`${apiBase}/me`, {
            credentials: 'include'
        })

        // if the user isn't authenticated, go to the login page
        if (!me?.authenticated) {
            return navigateTo('/login')
        }
    } catch {
        // if there's an error, go to the login page
        return navigateTo('/login')
    }
})
