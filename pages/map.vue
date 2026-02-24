<template>
  <div class="map-page p-6 lg:p-8">
    <div class="max-w-6xl mx-auto flex flex-col gap-6">
      <!-- 頂部：標題 + 篩選按鈕 -->
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">全台客訴地理分佈</h1>
          <p class="text-sm text-gray-500 mt-1">依縣市統計客訴數量，可搭配篩選條件查看</p>
          <p v-if="filterSummary" class="text-xs mt-1.5" style="color: var(--color-text-muted);">
            目前條件：{{ filterSummary }}
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors shrink-0"
          style="border-color: var(--color-border); color: var(--color-text); background: var(--color-card);"
          @click="filterModalOpen = true"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          篩選條件
        </button>
      </header>

      <!-- 主內容：地圖卡片 -->
      <section class="w-full flex justify-center flex-1 min-h-0">
        <div class="w-[70%] min-w-[280px] mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-0">
          <div class="px-6 py-4 border-b border-gray-100 shrink-0">
            <h2 class="text-lg font-semibold text-gray-900">各縣市客訴熱力</h2>
          </div>
          <div class="p-6 flex-1 min-h-0">
            <TaiwanMap :filters="currentFilters" />
          </div>
        </div>
      </section>
    </div>

    <FilterModal
      v-model="filterModalOpen"
      @search="onSearch"
    />
  </div>
</template>

<script setup lang="ts">
import type { ComplaintFilter } from '~/types/complaint'
import FilterModal from '~/components/FilterModal.vue'

const filterModalOpen = ref(false)
const currentFilters = ref<ComplaintFilter>({})

function onSearch(filters: ComplaintFilter) {
  currentFilters.value = { ...filters }
}

const filterSummary = computed(() => {
  const f = currentFilters.value
  const parts: string[] = []
  if (f.startDate) parts.push(f.startDate)
  if (f.endDate) parts.push(f.endDate)
  if (f.city) parts.push(f.city)
  if (f.product) parts.push(f.product)
  if (f.channel) parts.push(f.channel)
  if (f.machine) parts.push(f.machine)
  if (!parts.length) return ''
  return parts.join('、')
})
</script>

<style scoped>
.map-page {
  min-height: 100%;
  background-color: var(--color-bg, #f9fafb);
}
</style>
