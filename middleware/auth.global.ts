export default defineNuxtRouteMiddleware((to) => {
  // 僅在客戶端做導向，避免 SSR/初始請求時回傳 503
  if (import.meta.server) return

  const authToken = useCookie('auth_token')
  const hasToken = !!authToken.value
  const isLoginPage = to.path === '/login'

  if (!hasToken && !isLoginPage) {
    return navigateTo('/login')
  }

  if (hasToken && isLoginPage) {
    return navigateTo('/dashboard')
  }
})
