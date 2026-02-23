<template>
  <div class="p-6 lg:p-8" style="color: var(--color-text);">
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-2xl font-bold" style="color: var(--color-text);">儀表板</h1>
        <p class="mt-1 text-sm" style="color: var(--color-text-muted);">客訴總覽與關鍵指標</p>
      </header>

      <!-- KPI 卡片 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          class="rounded-xl p-5 border shadow-sm"
          style="background-color: var(--color-card); border-color: var(--color-border);"
        >
          <p class="text-sm font-medium" style="color: var(--color-text-muted);">總客訴筆數</p>
          <p class="mt-2 text-2xl font-bold" style="color: var(--color-primary);">
            {{ statsData?.total ?? '—' }}
          </p>
          <p class="text-xs mt-1" style="color: var(--color-text-muted);">全部資料</p>
        </div>
        <div
          class="rounded-xl p-5 border shadow-sm"
          style="background-color: var(--color-card); border-color: var(--color-border);"
        >
          <p class="text-sm font-medium" style="color: var(--color-text-muted);">近 12 月筆數</p>
          <p class="mt-2 text-2xl font-bold" style="color: var(--color-primary);">
            {{ last12Total }}
          </p>
          <p class="text-xs mt-1" style="color: var(--color-text-muted);">趨勢區間</p>
        </div>
        <div
          class="rounded-xl p-5 border shadow-sm"
          style="background-color: var(--color-card); border-color: var(--color-border);"
        >
          <p class="text-sm font-medium" style="color: var(--color-text-muted);">縣市分布數</p>
          <p class="mt-2 text-2xl font-bold" style="color: var(--color-primary);">
            {{ (statsData?.cityStats?.length) ?? 0 }}
          </p>
          <p class="text-xs mt-1" style="color: var(--color-text-muted);">有資料的縣市</p>
        </div>
        <div
          class="rounded-xl p-5 border shadow-sm"
          style="background-color: var(--color-card); border-color: var(--color-border);"
        >
          <p class="text-sm font-medium" style="color: var(--color-text-muted);">產品品項數</p>
          <p class="mt-2 text-2xl font-bold" style="color: var(--color-primary);">
            {{ (statsData?.productStats?.length) ?? 0 }}
          </p>
          <p class="text-xs mt-1" style="color: var(--color-text-muted);">前 10 品項</p>
        </div>
      </div>

      <!-- 主要圖表：近 12 個月趨勢 -->
      <section
        class="rounded-xl p-5 lg:p-6 border shadow-sm mb-8"
        style="background-color: var(--color-card); border-color: var(--color-border);"
      >
        <h2 class="text-lg font-semibold mb-1" style="color: var(--color-text);">
          每月客訴數量趨勢
        </h2>
        <p class="text-sm mb-4" style="color: var(--color-text-muted);">
          近 12 個月客訴筆數（依反映時間）
        </p>
        <div v-if="statsLoading" class="flex items-center justify-center py-12">
          <div
            class="animate-spin rounded-full h-8 w-8 border-2 border-transparent"
            style="border-top-color: var(--color-primary);"
          />
          <span class="ml-3" style="color: var(--color-text-muted);">載入中...</span>
        </div>
        <div v-else-if="monthlyChartData.labels?.length" class="h-[280px]">
          <LineChart :data="monthlyChartData" title="" subtitle="" height="280px" />
        </div>
        <div v-else class="h-[280px] flex items-center justify-center text-sm" style="color: var(--color-text-muted);">
          尚無近 12 個月資料
        </div>
      </section>

      <!-- 次要圖表：縣市、產品 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div
          class="rounded-xl p-5 border shadow-sm"
          style="background-color: var(--color-card); border-color: var(--color-border);"
        >
          <h3 class="text-base font-semibold mb-4" style="color: var(--color-text);">
            縣市客訴統計
          </h3>
          <BarChart :data="cityChartData" title="" height="260px" />
        </div>
        <div
          class="rounded-xl p-5 border shadow-sm"
          style="background-color: var(--color-card); border-color: var(--color-border);"
        >
          <h3 class="text-base font-semibold mb-4" style="color: var(--color-text);">
            產品客訴統計
          </h3>
          <BarChart :data="productChartData" title="" height="260px" />
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <NuxtLink
          to="/search"
          class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style="background-color: var(--color-primary);"
        >
          前往搜尋客訴
        </NuxtLink>
        <NuxtLink
          to="/analysis"
          class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
          style="border-color: var(--color-border); color: var(--color-text);"
        >
          完整分析圖表
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BarChart from '~/components/BarChart.vue'
import LineChart from '~/components/LineChart.vue'
import {
  transformCityStatsToBarChart,
  transformProductStatsToBarChart,
  transformMonthlyStatsToLineChart
} from '~/utils/chartDataTransformer'

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
    return { labels: [], datasets: [] }
  }
  return transformMonthlyStatsToLineChart(statsData.value.monthlyStats)
})

const cityChartData = computed(() => {
  if (!statsData.value?.cityStats) return { labels: [], datasets: [] }
  return transformCityStatsToBarChart(statsData.value.cityStats)
})

const productChartData = computed(() => {
  if (!statsData.value?.productStats) return { labels: [], datasets: [] }
  return transformProductStatsToBarChart(statsData.value.productStats)
})

const last12Total = computed(() => {
  const m = statsData.value?.monthlyStats
  if (!m?.length) return '—'
  return m.reduce((sum, i) => sum + i.count, 0)
})

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
