<template>
  <div
    class="dashboard-page flex flex-col p-4 lg:p-5 max-w-7xl mx-auto"
    style="color: var(--color-text); height: calc(100vh - 2rem); max-height: calc(100vh - 2rem);"
  >
    <!-- Header：標題 + 連結按鈕群 -->
    <header class="flex items-center justify-between gap-4 shrink-0 mb-4">
      <div>
        <h1 class="text-xl font-bold" style="color: var(--color-text);">儀表板</h1>
        <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">客訴總覽與關鍵指標</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/search"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors shrink-0"
          style="background-color: var(--color-primary);"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          搜尋
        </NuxtLink>
        <NuxtLink
          to="/analysis"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors shrink-0"
          style="border-color: var(--color-border); color: var(--color-text);"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          分析
        </NuxtLink>
        <NuxtLink
          to="/map"
          class="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors shrink-0"
          style="border-color: var(--color-border); color: var(--color-text);"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
          地圖
        </NuxtLink>
      </div>
    </header>

    <!-- KPI 卡片：緊湊 -->
    <div
      class="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 mb-4"
      style="color: var(--color-text);"
    >
      <div
        class="rounded-lg px-4 py-3 border shadow-sm"
        style="background-color: var(--color-card); border-color: var(--color-border);"
      >
        <p class="text-xs font-medium" style="color: var(--color-text-muted);">總客訴筆數</p>
        <p class="mt-1 text-xl font-bold" style="color: var(--color-primary);">{{ statsData?.total ?? '—' }}</p>
      </div>
      <div
        class="rounded-lg px-4 py-3 border shadow-sm"
        style="background-color: var(--color-card); border-color: var(--color-border);"
      >
        <p class="text-xs font-medium" style="color: var(--color-text-muted);">近 12 月筆數</p>
        <p class="mt-1 text-xl font-bold" style="color: var(--color-primary);">{{ last12Total }}</p>
      </div>
      <div
        class="rounded-lg px-4 py-3 border shadow-sm"
        style="background-color: var(--color-card); border-color: var(--color-border);"
      >
        <p class="text-xs font-medium" style="color: var(--color-text-muted);">縣市分布數</p>
        <p class="mt-1 text-xl font-bold" style="color: var(--color-primary);">{{ (statsData?.cityStats?.length) ?? 0 }}</p>
      </div>
      <div
        class="rounded-lg px-4 py-3 border shadow-sm"
        style="background-color: var(--color-card); border-color: var(--color-border);"
      >
        <p class="text-xs font-medium" style="color: var(--color-text-muted);">產品品項數</p>
        <p class="mt-1 text-xl font-bold" style="color: var(--color-primary);">{{ (statsData?.productStats?.length) ?? 0 }}</p>
      </div>
    </div>

    <!-- 趨勢圖：flex-1 佔滿剩餘空間 -->
    <section
      class="rounded-xl border shadow-sm flex flex-col flex-1 min-h-0 px-4 py-3"
      style="background-color: var(--color-card); border-color: var(--color-border);"
    >
      <div class="flex items-center justify-between gap-2 mb-2 shrink-0">
        <div>
          <h2 class="text-base font-semibold" style="color: var(--color-text);">每月客訴數量趨勢</h2>
          <p class="text-xs" style="color: var(--color-text-muted);">近 12 個月客訴筆數（依反映時間）</p>
        </div>
      </div>
      <div
        v-if="statsLoading"
        class="flex-1 flex items-center justify-center min-h-0"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-transparent"
          style="border-top-color: var(--color-primary);"
        />
        <span class="ml-3 text-sm" style="color: var(--color-text-muted);">載入中...</span>
      </div>
      <div
        v-else-if="monthlyChartData.labels?.length"
        class="flex-1 min-h-0 flex flex-col"
      >
        <LineChart
          :data="monthlyChartData"
          title=""
          subtitle=""
          class="flex-1 min-h-0"
          style="height: 100%;"
          @enlarge="openChartModal"
        />
      </div>
      <div
        v-else
        class="flex-1 flex items-center justify-center text-sm min-h-0"
        style="color: var(--color-text-muted);"
      >
        尚無近 12 個月資料
      </div>
    </section>

    <!-- 圖表放大 Modal -->
    <ChartZoomModal
      v-model="chartModalOpen"
      chart-type="line"
      :data="monthlyChartData"
      title="每月客訴數量趨勢"
      subtitle="近 12 個月客訴筆數（依反映時間）"
    />
  </div>
</template>

<script setup lang="ts">
import LineChart from '~/components/LineChart.vue'
import ChartZoomModal from '~/components/common/ChartZoomModal.vue'
import { transformMonthlyStatsToLineChart } from '~/utils/chartDataTransformer'

useHead({ title: '儀表板 - 客訴統計搜尋工具' })

const statsLoading = ref(false)
const statsData = ref<{
  total?: number
  cityStats?: Array<{ city: string; count: number }>
  productStats?: Array<{ product: string; count: number }>
  monthlyStats?: Array<{ month: string; count: number }>
}>({})

const monthlyChartData = computed(() => {
  if (!statsData.value?.monthlyStats?.length) {
    return { labels: [] as string[], datasets: [] as unknown[] }
  }
  return transformMonthlyStatsToLineChart(statsData.value.monthlyStats)
})

const last12Total = computed(() => {
  const m = statsData.value?.monthlyStats
  if (!m?.length) return '—'
  return m.reduce((sum, i) => sum + i.count, 0)
})

const chartModalOpen = ref(false)

function openChartModal() {
  chartModalOpen.value = true
}

async function fetchStats() {
  statsLoading.value = true
  try {
    const res = await fetch('/api/complaints/stats').then(r => r.json())
    if (res.success) statsData.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    statsLoading.value = false
  }
}

onMounted(fetchStats)
</script>

<style scoped>
.dashboard-page {
  overflow: hidden;
}
/* LineChart 在 flex-1 容器內需能縮放 */
.flex-1.min-h-0 :deep(.chart-wrapper) {
  min-height: 0;
  height: 100%;
}
.flex-1.min-h-0 :deep(.chart-container) {
  height: 100% !important;
}
</style>
