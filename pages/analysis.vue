<template>
  <div class="p-6 lg:p-8 analysis-page">
    <div class="max-w-7xl mx-auto">
      <header class="mb-6">
        <h1 class="text-2xl font-bold page-title">分析圖表</h1>
        <p class="text-sm mt-1 page-subtitle">統計資料與圖表分析</p>
      </header>

      <!-- 目前篩選標籤 + 一鍵清除 -->
      <div v-if="hasActiveFilter" class="flex flex-wrap items-center gap-2 mb-4">
        <span class="text-sm page-subtitle">目前篩選：</span>
        <template v-for="tag in activeFilterTags" :key="tag.key">
          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm border cursor-pointer hover:opacity-90"
            style="background-color: var(--color-bg-elevated); border-color: var(--color-border); color: var(--color-text);"
            @click="removeFilter(tag.key)"
          >
            {{ tag.label }}
            <span class="text-xs" aria-hidden="true">×</span>
          </span>
        </template>
        <button
          type="button"
          class="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium border"
          style="border-color: var(--color-primary); color: var(--color-primary);"
          @click="clearFilter"
        >
          清除全部篩選
        </button>
      </div>

      <!-- 篩選列 -->
      <div class="card p-5 mb-6">
        <h4 class="text-base font-semibold page-title mb-3">篩選條件</h4>
        <div class="flex flex-wrap items-center gap-4">
          <label class="flex items-center gap-2">
            <input type="radio" v-model="filterState.period" value="all" @change="onPeriodChange" />
            <span class="text-sm page-title">全部客訴資料</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" v-model="filterState.period" value="single" @change="onPeriodChange" />
            <span class="text-sm page-title">單月份</span>
            <select v-model="filterState.monthSingle" @change="updateStats" :disabled="filterState.period !== 'single'" class="input-style">
              <option value="">選擇月份</option>
              <option v-for="m in 12" :key="m" :value="String(m - 1)">{{ m - 1 }}月</option>
            </select>
          </label>
          <label class="flex items-center gap-2">
            <input type="radio" v-model="filterState.period" value="range" @change="onPeriodChange" />
            <span class="text-sm page-title">月份範圍</span>
            <select v-model="filterState.monthStart" @change="onRangeChange" :disabled="filterState.period !== 'range'" class="input-style">
              <option value="">開始</option>
              <option v-for="m in 12" :key="m" :value="String(m - 1)">{{ m - 1 }}月</option>
            </select>
            <span class="page-subtitle">~</span>
            <select v-model="filterState.monthEnd" @change="onRangeChange" :disabled="filterState.period !== 'range'" class="input-style">
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
        <section
          class="card p-5 lg:p-6 mb-6 cursor-pointer transition-shadow hover:shadow-lg active:opacity-95"
          @click="openChartModal('line', monthlyChartData, '每月客訴數量趨勢（近 12 個月）', '依反映時間統計')"
        >
          <h2 class="text-lg font-semibold page-title mb-1">每月客訴數量趨勢（近 12 個月）</h2>
          <p class="text-sm page-subtitle mb-4">依反映時間統計</p>
          <div class="h-[280px]">
            <LineChart
              :data="monthlyChartData"
              title=""
              subtitle=""
              height="280px"
            />
          </div>
        </section>

        <!-- 類別分布：橫向長條 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            class="card p-5 cursor-pointer transition-shadow hover:shadow-lg active:opacity-95"
            @click="openChartModal('horizontalBar', channelBarData, '購買通路分布')"
          >
            <h3 class="text-base font-semibold page-title mb-4">購買通路分布</h3>
            <HorizontalBarChart
              :data="channelBarData"
              title=""
              height="260px"
            />
          </div>
          <div
            class="card p-5 cursor-pointer transition-shadow hover:shadow-lg active:opacity-95"
            @click="openChartModal('horizontalBar', statusBarData, '產品狀態分布')"
          >
            <h3 class="text-base font-semibold page-title mb-4">產品狀態分布</h3>
            <HorizontalBarChart
              :data="statusBarData"
              title=""
              height="260px"
            />
          </div>
        </div>

        <!-- 縣市：大卡片顯示全部縣市，點擊卡片可開 modal -->
        <section
          class="card p-5 mb-6 cursor-pointer transition-shadow hover:shadow-lg active:opacity-95"
          @click="openChartModal('bar', cityChartDataFull, '縣市客訴統計')"
        >
          <h3 class="text-base font-semibold page-title mb-4">縣市客訴統計</h3>
          <p class="text-xs page-subtitle mb-2">點擊長條可篩選該縣市；點擊卡片可放大檢視</p>
          <BarChart
            :data="cityChartDataFull"
            title=""
            height="260px"
            @bar-click="onCityBarClick"
          />
        </section>

        <!-- 產品統計：依機台分開，P#15 / P#13 並排，樣式一致 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            class="card p-5 cursor-pointer transition-shadow hover:shadow-lg active:opacity-95 machine-chart-card"
            @click="openChartModal('bar', p15ChartDataFull, '機台 P#15 產品客訴統計（完整）')"
          >
            <h3 class="text-base font-semibold page-title mb-4">機台 P#15 產品客訴統計</h3>
            <p class="text-xs page-subtitle mb-2">前 5 名產品，點擊長條可篩選；點擊卡片可看完整列表</p>
            <BarChart
              :data="p15ChartDataTop5"
              title=""
              height="260px"
              @bar-click="onProductBarClick"
            />
          </div>
          <div
            class="card p-5 cursor-pointer transition-shadow hover:shadow-lg active:opacity-95 machine-chart-card"
            @click="openChartModal('bar', p13ChartDataFull, '機台 P#13 產品客訴統計（完整）')"
          >
            <h3 class="text-base font-semibold page-title mb-4">機台 P#13 產品客訴統計</h3>
            <p class="text-xs page-subtitle mb-2">前 5 名產品，點擊長條可篩選；點擊卡片可看完整列表</p>
            <BarChart
              :data="p13ChartDataTop5"
              title=""
              height="260px"
              @bar-click="onProductBarClick"
            />
          </div>
        </div>

        <!-- 進階分析：柏拉圖、效期、關鍵字 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">產品品項柏拉圖</h3>
            <p class="text-xs page-subtitle mb-2">長條：客訴筆數；折線：累計百分比</p>
            <ParetoChart
              :data="paretoProductChartData"
              title=""
              height="280px"
            />
          </div>
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">原因分析柏拉圖</h3>
            <p class="text-xs page-subtitle mb-2">長條：客訴筆數；折線：累計百分比</p>
            <ParetoChart
              :data="paretoCauseChartData"
              title=""
              height="280px"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">效期分布（距到期時間）</h3>
            <p class="text-xs page-subtitle mb-2">以反映時間為基準，產品剩餘效期區間</p>
            <ShelfLifeChart
              :data="shelfLifeChartData"
              title=""
              height="260px"
            />
          </div>
          <div class="card p-5">
            <h3 class="text-base font-semibold page-title mb-4">原因分析關鍵字（前 20）</h3>
            <p class="text-xs page-subtitle mb-2">字體大小依出現次數比例</p>
            <KeywordList :keywords="keywordListItems" />
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

      <ChartZoomModal
        v-model="chartModalOpen"
        :chart-type="chartModalType"
        :data="chartModalData"
        :title="chartModalTitle"
        :subtitle="chartModalSubtitle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BarChart from '~/components/BarChart.vue'
import ChartZoomModal from '~/components/common/ChartZoomModal.vue'
import LineChart from '~/components/LineChart.vue'
import HorizontalBarChart from '~/components/HorizontalBarChart.vue'
import {
  transformCityStatsToBarChart,
  transformProductStatsToBarChart,
  transformMonthlyStatsToLineChart,
  transformChannelStatsToHorizontalBar,
  transformStatusStatsToHorizontalBar,
  transformParetoToMixedChart,
  transformShelfLifeToBarChart
} from '~/utils/chartDataTransformer'
import ParetoChart from '~/components/ParetoChart.vue'
import ShelfLifeChart from '~/components/ShelfLifeChart.vue'
import KeywordList from '~/components/KeywordList.vue'
import { useComplaintFilter } from '~/composables/useComplaintFilter'

useHead({ title: '分析圖表 - 客訴統計搜尋工具' })

const {
  filterState,
  setFilter,
  clearFilter,
  hasActiveFilter,
  apiParams,
  activeFilterTags,
  removeFilter
} = useComplaintFilter()

const statsLoading = ref(false)
const statsData = ref<{
  total?: number
  cityStats?: Array<{ city: string; count: number }>
  productStats?: Array<{ product: string; count: number }>
  productStatsByMachine?: Record<string, Array<{ product: string; count: number }>>
  channelStats?: Array<{ channel: string; count: number }>
  statusStats?: Array<{ status: string; count: number }>
  monthlyStats?: Array<{ month: string; count: number }>
  paretoProduct?: { items: Array<{ item: string; count: number; cumulativePercentage: number }>; total: number }
  paretoCause?: { items: Array<{ item: string; count: number; cumulativePercentage: number }>; total: number }
  shelfLife?: { buckets: Array<{ bucket: string; count: number }>; total: number }
  keywordStats?: { keywords: Array<{ keyword: string; count: number }> }
}>({})

const monthlyChartData = computed(() => {
  if (!statsData.value?.monthlyStats?.length) return { labels: [], datasets: [] }
  return transformMonthlyStatsToLineChart(statsData.value.monthlyStats)
})
const emptyChartData = { labels: [] as string[], datasets: [] as unknown[] }

const cityChartDataFull = computed(() => {
  if (!statsData.value?.cityStats) return emptyChartData
  return transformCityStatsToBarChart(statsData.value.cityStats)
})

const p15Stats = computed(() => statsData.value?.productStatsByMachine?.['P#15'] ?? [])
const p13Stats = computed(() => statsData.value?.productStatsByMachine?.['P#13'] ?? [])

const p15ChartDataTop5 = computed(() => {
  if (!p15Stats.value.length) return emptyChartData
  return transformProductStatsToBarChart(p15Stats.value, 5)
})
const p15ChartDataFull = computed(() => {
  if (!p15Stats.value.length) return emptyChartData
  return transformProductStatsToBarChart(p15Stats.value)
})
const p13ChartDataTop5 = computed(() => {
  if (!p13Stats.value.length) return emptyChartData
  return transformProductStatsToBarChart(p13Stats.value, 5)
})
const p13ChartDataFull = computed(() => {
  if (!p13Stats.value.length) return emptyChartData
  return transformProductStatsToBarChart(p13Stats.value)
})
const channelBarData = computed(() => {
  if (!statsData.value?.channelStats) return { labels: [], datasets: [] }
  return transformChannelStatsToHorizontalBar(statsData.value.channelStats)
})
const statusBarData = computed(() => {
  if (!statsData.value?.statusStats) return { labels: [], datasets: [] }
  return transformStatusStatsToHorizontalBar(statsData.value.statusStats)
})

const paretoProductChartData = computed(() => {
  if (!statsData.value?.paretoProduct?.items?.length) return { labels: [], datasets: [] }
  return transformParetoToMixedChart(statsData.value.paretoProduct)
})
const paretoCauseChartData = computed(() => {
  if (!statsData.value?.paretoCause?.items?.length) return { labels: [], datasets: [] }
  return transformParetoToMixedChart(statsData.value.paretoCause)
})
const shelfLifeChartData = computed(() => {
  if (!statsData.value?.shelfLife?.buckets?.length) return { labels: [], datasets: [] }
  return transformShelfLifeToBarChart(statsData.value.shelfLife)
})
const keywordListItems = computed(() => statsData.value?.keywordStats?.keywords ?? [])

function getFilterLabel() {
  const s = filterState.value
  if (s.period === 'single' && s.monthSingle !== '') return `${s.monthSingle}月`
  if (s.period === 'range' && s.monthStart !== '' && s.monthEnd !== '') return `${s.monthStart}月 ~ ${s.monthEnd}月`
  return '全部'
}

function onCityBarClick(label: string) {
  setFilter({ city: label })
}

function onProductBarClick(label: string) {
  setFilter({ product: label })
}

const chartModalOpen = ref(false)
const chartModalType = ref<'bar' | 'line' | 'pie' | 'horizontalBar'>('line')
const chartModalData = ref<{ labels: string[]; datasets: unknown[] } | null>(null)
const chartModalTitle = ref('')
const chartModalSubtitle = ref('')

function openChartModal(
  type: 'bar' | 'line' | 'pie' | 'horizontalBar',
  data: { labels: string[]; datasets: unknown[] },
  title: string,
  subtitle?: string
) {
  chartModalType.value = type
  chartModalData.value = data
  chartModalTitle.value = title
  chartModalSubtitle.value = subtitle ?? ''
  chartModalOpen.value = true
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
    const params = { ...apiParams.value }
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
  const s = filterState.value
  if (s.period !== 'single') filterState.value.monthSingle = ''
  if (s.period !== 'range') {
    filterState.value.monthStart = ''
    filterState.value.monthEnd = ''
  }
  updateStats()
}

function onRangeChange() {
  const s = filterState.value
  if (s.monthStart && s.monthEnd) updateStats()
}

watch(apiParams, () => updateStats(), { deep: true })

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
/* P#15 / P#13 機台卡片一致高度與版面 */
.machine-chart-card { min-height: 340px; display: flex; flex-direction: column; }
.machine-chart-card h3 { flex-shrink: 0; }
.machine-chart-card p { flex-shrink: 0; }
.machine-chart-card .chart-wrapper { flex: 1; min-height: 260px; }
</style>
