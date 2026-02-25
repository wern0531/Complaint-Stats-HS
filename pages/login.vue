<template>
  <div class="login-page min-h-screen flex items-center justify-center p-6" style="background-color: var(--color-bg);">
    <div
      class="login-card w-full max-w-md rounded-xl shadow-lg border p-8"
      style="
        background-color: var(--color-card);
        border-color: var(--color-border);
        color: var(--color-text);
      "
    >
      <h1 class="text-xl font-bold text-center mb-2" style="color: var(--color-text);">客訴統計工具</h1>
      <p class="text-sm text-center mb-6" style="color: var(--color-text-muted);">請登入以繼續</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="employeeId" class="block text-sm font-medium mb-1.5" style="color: var(--color-text-muted);">工號</label>
          <input
            id="employeeId"
            v-model="employeeId"
            type="text"
            autocomplete="username"
            class="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style="
              background-color: var(--color-input-bg);
              border-color: var(--color-input-border);
              color: var(--color-text);
            "
            placeholder="請輸入工號"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium mb-1.5" style="color: var(--color-text-muted);">密碼</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
            style="
              background-color: var(--color-input-bg);
              border-color: var(--color-input-border);
              color: var(--color-text);
            "
            placeholder="請輸入密碼"
          />
        </div>
        <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>
        <button
          type="submit"
          class="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style="background-color: var(--color-primary);"
        >
          登入
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'login' })

useHead({ title: '登入 - 客訴統計工具' })

const employeeId = ref('')
const password = ref('')
const errorMessage = ref('')

const authToken = useCookie('auth_token')

function handleLogin() {
  errorMessage.value = ''
  const id = employeeId.value.trim()
  const pwd = password.value

  if (id === '38440' && pwd === '123456') {
    authToken.value = 'logged-in'
    return navigateTo('/dashboard')
  }

  errorMessage.value = '工號或密碼錯誤，請重新輸入。'
}
</script>

<style scoped>
.login-page :deep(input:focus) {
  --tw-ring-color: var(--color-primary);
}
</style>
