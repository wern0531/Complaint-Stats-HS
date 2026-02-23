<template>
  <div class="p-6 lg:p-8 analysis-page">
    <div class="max-w-7xl mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl font-bold page-title">分析圖表</h1>
        <p class="text-sm mt-1 page-subtitle">統計資料與圖表分析</p>
      </header>

      <!-- 篩選列 -->
      <div class="card p-5 mb-6">
        <h4 class="text-base font-semibold page-title mb-3">篩選條件</h4>
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2">
            <input type="radio" v-model="selectedPeriod" value="all" @change="onPeriodChange" />
            <span class="text-sm page-title">全部客訴資料</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" v-model="selectedPeriod" value="single" @change="onPeriodChange" />
            <span class="text-sm page-title">單月份</span>
            <select v-model="selectedMonth" @change="updateStats" :disabled="selectedPeriod !== 'single'" class="input-style">
              <option value="">選擇月份</option>
              <option v-for="m in 12" :key="m" :value="String(m - 1)">{{ m - 1 }}月</option>
            </select>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" v-model="selectedPeriod" value="range" @change="onPeriodChange" />
            <span class="text-sm page-title">月份範圍</span>
            <select v-model="startMonth" @change="onRangeChange" :disabled="selectedPeriod !== 'range'" class="input-style">
              <option value="">開始</option>
              <option v-for="m in 12" :key="m" :value="String(m - 1)">{{ m - 1 }}月</option>
            </select>
            <span class="page-subtitle">~</span>
            <select v-model="endMonth" @change="onRangeChange" :disabled="selectedPeriod !== 'range'" class="input-style">
              <option value="">結束</option>
              <option v-for="m in 12" :key="m" :value="String(m - 1)">{{ m - 1 }}月</option>
            </select>
          </label>
        </div>
        <p class="mt-2 text-sm page-subtitle">{{ getFilterLabel() }} 共 {{ statsData?.total ?? 0 }} 筆</p>
      </div>

      <div v-if="statsLoading" class="card p-12 flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-transparent spinner" />
        <span class="ml-3 page-subtitle">載入統計中...</span>
      </div>

      <template v-else>
        <!-- KPI -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="card p-5">
            <p class="text-sm page-subtitle">總筆數</p>
            <p class="text-xl font-bold mt-1 accent-text">{{ statsData?.total ?? 0 }}</p>
          </div>
          <div class="card p-5">
            <p class="text-sm page-subtitle">縣市數</p>
            <p class="text-xl font-bold mt-1 accent-text">{{ (statsData?.cityStats?.length) ?? 0 }}</p>
          </div>
          <div class="card p-5">
            <p class="text-sm page-subtitle">產品品項數</p>
            <p class="text-xl font-bold mt-1 accent-text">{{ (statsData?.productStats?.length) ?? 0 }}</p>
          </div>
        </div>

        <!-- 趨勢：近 12 個月 -->
        <section class="card p-5 lg:p-6 mb-6">
          <h2 class="text-lg font-semibold page-title mb-1">每月客訴數量趨勢（近 12 個月）</h2>
          <p class="text-sm page-subtitle mb-4">依反映時間統計</p>
          <div class="h-[280px]">
            <LineChart :data="monthlyChartData" title="" subtitle="" height="280px" />
          </div>
        </section>

        <!-- 類別分布：橫向長條 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">購買通路分布</h3>
            <HorizontalBarChart :data="channelBarData" title="" height="260px" />
          </div>
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">產品狀態分布</h3>
            <HorizontalBarChart :data="statusBarData" title="" height="260px" />
          </div>
        </div>

        <!-- 縣市 / 機台：直條圖 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">縣市客訴統計</h3>
            <BarChart :data="cityChartData" title="" height="260px" />
          </div>
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">產品客訴統計</h3>
            <BarChart :data="productChartData" title="" height="260px" />
          </div>
        </div>

        <!-- 縣市分佈表格 -->
        <section class="card overflow-hidden mb-6">
          <div class="px-6 py-4 border-b card-border">
            <h3 class="text-lg font-semibold page-title">各縣市分佈</h3>
          </div>
          <div class="max-h-80 overflow-y-auto">
            <table class="w-full">
              <thead class="table-head">
                <tr>
                  <th class="table-th">縣市</th>
                  <th class="table-th">客訴數量</th>
                  <th class="table-th">比例</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr v-for="item in (statsData?.cityStats || [])" :key="item.city" class="table-row">
                  <td class="table-td">
                    <span class="inline-block w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: getCityColor(item.city) }" />
                    {{ item.city }}
                  </td>
                  <td class="table-td font-semibold">{{ item.count }} 筆</td>
                  <td class="table-td">
                    <span class="inline-flex items-center gap-2">
                      {{ Math.round((item.count / (statsData?.total || 1)) * 100) }}%
                      <span class="w-20 h-2 rounded-full overflow-hidden inline-block ml-1" style="background: var(--color-border);">
                        <span class="h-2 rounded-full block transition-all" :style="{ width: `${(item.count / (statsData?.total || 1)) * 100}%`, backgroundColor: getCityColor(item.city) }" />
                      </span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import BarChart from '~/components/BarChart.vue'
import LineChart from '~/components/LineChart.vue'
import HorizontalBarChart from '~/components/HorizontalBarChart.vue'
import {
  transformCityStatsToBarChart,
  transformProductStatsToBarChart,
  transformMonthlyStatsToLineChart,
  transformChannelStatsToHorizontalBar,
  transformStatusStatsToHorizontalBar
} from '~/utils/chartDataTransformer'

useHead({ title: '分析圖表 - 客訴統計搜尋工具' })

const statsLoading = ref(false)
const selectedPeriod = ref<'all' | 'single' | 'range'>('all')
const selectedMonth = ref('')
const startMonth = ref('')
const endMonth = ref('')
const statsData = ref<{
  total?: number
  cityStats?: Array<{ city: string; count: number }>
  productStats?: Array<{ product: string; count: number }>
  channelStats?: Array<{ channel: string; count: number }>
  statusStats?: Array<{ status: string; count: number }>
  monthlyStats?: Array<{ month: string; count: number }>
}>({})

const monthlyChartData = computed(() => {
  if (!statsData.value?.monthlyStats?.length) return { labels: [], datasets: [] }
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
const channelBarData = computed(() => {
  if (!statsData.value?.channelStats) return { labels: [], datasets: [] }
  return transformChannelStatsToHorizontalBar(statsData.value.channelStats)
})
const statusBarData = computed(() => {
  if (!statsData.value?.statusStats) return { labels: [], datasets: [] }
  return transformStatusStatsToHorizontalBar(statsData.value.statusStats)
})

function getFilterLabel() {
  if (selectedPeriod.value === 'single' && selectedMonth.value !== '') return `${selectedMonth.value}月`
  if (selectedPeriod.value === 'range' && startMonth.value !== '' && endMonth.value !== '') return `${startMonth.value}月 ~ ${endMonth.value}月`
  return '全部'
}

function getCityColor(cityName: string) {
  const municipalities = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市']
  const islands = ['澎湖縣', '金門縣', '連江縣']
  if (municipalities.includes(cityName)) return '#3b82f6'
  if (islands.includes(cityName)) return '#f97316'
  return '#22c55e'
}

async function updateStats() {
  statsLoading.value = true
  try {
    const params: Record<string, string> = {}
    if (selectedPeriod.value === 'single' && selectedMonth.value !== '') params.month = selectedMonth.value
    if (selectedPeriod.value === 'range' && startMonth.value !== '' && endMonth.value !== '') {
      const s = parseInt(startMonth.value)
      const e = parseInt(endMonth.value)
      if (s <= e) params.month = `${s}~${e}`
    }
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`/api/complaints/stats?${qs}`).then(r => r.json())
    if (res.success) statsData.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    statsLoading.value = false
  }
}

function onPeriodChange() {
  if (selectedPeriod.value !== 'single') selectedMonth.value = ''
  if (selectedPeriod.value !== 'range') { startMonth.value = ''; endMonth.value = '' }
  updateStats()
}

function onRangeChange() {
  if (startMonth.value && endMonth.value) updateStats()
}

onMounted(updateStats)
</script>

<style scoped>
.analysis-page { background-color: var(--color-bg); color: var(--color-text); min-height: 100%; }
.page-title { color: var(--color-text); }
.page-subtitle { color: var(--color-text-muted); }
.card { background-color: var(--color-card); border: 1px solid var(--color-border); border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-border { border-color: var(--color-border); }
.accent-text { color: var(--color-primary); }
.input-style { background-color: var(--color-input-bg); border: 1px solid var(--color-input-border); color: var(--color-text); padding: 0.375rem 0.75rem; border-radius: 0.375rem; }
.spinner { border-top-color: var(--color-primary); }
.table-head { background-color: var(--color-bg-elevated); }
.table-th { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; color: var(--color-text-muted); }
.table-body { background-color: var(--color-card); }
.table-row { border-bottom: 1px solid var(--color-border); }
.table-row:hover { background-color: var(--color-bg-elevated); }
.table-td { padding: 0.75rem 1.5rem; font-size: 0.875rem; color: var(--color-text); }
</style>
