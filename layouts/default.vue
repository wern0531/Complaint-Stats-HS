<template>
  <div class="app-layout flex min-h-screen" style="background-color: var(--color-bg);">
    <!-- 左側邊欄 -->
    <aside
      class="sidebar w-64 flex-shrink-0 border-r flex flex-col"
      style="
        background-color: var(--sidebar-bg);
        border-color: var(--sidebar-border);
      "
    >
      <div class="p-5 border-b" style="border-color: var(--sidebar-border);">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 no-underline">
          <img
            src="/logo.jpg"
            alt="黑松股份有限公司"
            class="h-10 w-auto object-contain"
          />
          <div>
            <h1 class="text-lg font-bold leading-tight" style="color: var(--sidebar-text);">
              客訴統計工具
            </h1>
            <p class="text-xs" style="color: var(--sidebar-text-muted);">搜尋與分析</p>
          </div>
        </NuxtLink>
      </div>

      <nav class="flex-1 py-4 px-3 space-y-1">
        <NuxtLink
          to="/dashboard"
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          active-class="nav-link-active"
          style="color: var(--sidebar-text);"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          儀表板
        </NuxtLink>
        <NuxtLink
          to="/search"
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          active-class="nav-link-active"
          style="color: var(--sidebar-text);"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          客訴搜尋
        </NuxtLink>
        <NuxtLink
          to="/analysis"
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          active-class="nav-link-active"
          style="color: var(--sidebar-text);"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          分析圖表
        </NuxtLink>
        <NuxtLink
          to="/map"
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          active-class="nav-link-active"
          style="color: var(--sidebar-text);"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          地圖分佈
        </NuxtLink>
        <NuxtLink
          to="/settings"
          class="nav-link flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          active-class="nav-link-active"
          style="color: var(--sidebar-text);"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          設定
        </NuxtLink>
      </nav>

      <!-- 主題切換（側邊欄底部） -->
      <div class="p-3 border-t" style="border-color: var(--sidebar-border);">
        <button
          type="button"
          @click="toggleTheme"
          class="theme-toggle w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style="
            background-color: var(--color-bg-elevated);
            color: var(--color-text);
            border: 1px solid var(--color-border);
          "
        >
          <span v-if="theme === 'light'">🌙</span>
          <span v-else>☀️</span>
          {{ theme === 'light' ? '深色模式' : '淺色模式' }}
        </button>
      </div>
    </aside>

    <!-- 主內容區 -->
    <main class="flex-1 flex flex-col min-w-0 overflow-auto">
      <div class="contents">
        <slot>
          <div class="p-6 text-sm" style="color: var(--color-text-muted);">載入中...</div>
        </slot>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.nav-link:hover {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
}
.nav-link-active {
  background-color: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
}
</style>
