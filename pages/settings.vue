<template>
  <div class="p-6 lg:p-8 settings-page">
    <div class="max-w-2xl mx-auto">
      <header class="mb-8">
        <h1 class="text-2xl font-bold page-title">設定</h1>
        <p class="text-sm mt-1 page-subtitle">外觀與偏好設定</p>
      </header>

      <div class="card p-6 space-y-6">
        <section>
          <h2 class="text-lg font-semibold page-title mb-2">主題</h2>
          <p class="text-sm page-subtitle mb-4">切換淺色 / 深色模式，設定會儲存於本機。</p>
          <div class="flex flex-wrap gap-3">
            <button
              type="button"
              :class="['theme-btn', { active: theme === 'light' }]"
              @click="setTheme('light')"
            >
              ☀️ 淺色模式
            </button>
            <button
              type="button"
              :class="['theme-btn', { active: theme === 'dark' }]"
              @click="setTheme('dark')"
            >
              🌙 深色模式
            </button>
          </div>
        </section>

        <div class="border-t pt-6 card-border">
          <p class="text-sm page-subtitle">客訴統計搜尋工具 · 資料與 API 維持不變，僅調整介面與圖表。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { theme, setTheme } = useTheme()
useHead({ title: '設定 - 客訴統計搜尋工具' })
</script>

<style scoped>
.settings-page { background-color: var(--color-bg); color: var(--color-text); min-height: 100%; }
.page-title { color: var(--color-text); }
.page-subtitle { color: var(--color-text-muted); }
.card { background-color: var(--color-card); border: 1px solid var(--color-border); border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-border { border-color: var(--color-border); }
.theme-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 2px solid var(--color-border);
  background-color: var(--color-bg-elevated);
  color: var(--color-text);
  transition: border-color 0.2s, background-color 0.2s;
}
.theme-btn:hover { border-color: var(--color-primary); }
.theme-btn.active {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: white;
}
</style>
