<template>
  <div class="map-page p-6 lg:p-8">
    <div class="max-w-6xl mx-auto flex flex-col gap-8">
      <!-- 頂部：篩選區 -->
      <section class="w-full">
        <SearchFilters @search="onSearch" />
      </section>

      <!-- 主內容：地圖卡片 -->
      <section class="w-full flex justify-center">
        <div class="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-xl font-semibold text-gray-900">全台客訴地理分佈</h2>
            <p class="text-sm text-gray-500 mt-1">依縣市統計客訴數量，可搭配上方篩選條件查看</p>
          </div>
          <div class="p-6">
            <TaiwanMap :filters="currentFilters" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComplaintFilter } from '~/types/complaint'

const currentFilters = ref<ComplaintFilter>({})

function onSearch(filters: ComplaintFilter) {
  currentFilters.value = { ...filters }
}
</script>

<style scoped>
.map-page {
  min-height: 100%;
  background-color: var(--color-bg, #f9fafb);
}
</style>
