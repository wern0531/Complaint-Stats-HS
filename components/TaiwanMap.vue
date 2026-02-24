<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">台灣各縣市客訴統計地圖</h3>

    <div class="relative w-full max-w-4xl mx-auto">
      <div ref="mapWrapRef" class="taiwan-map-wrap relative w-full" style="aspect-ratio: 1000/1295;">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1295"
          aria-label="台灣縣市客訴地圖"
          class="absolute inset-0 w-full h-full"
          @mousemove="onMouseMove"
          @mouseleave="tooltip = null"
        >
          <path
            v-for="loc in filteredLocations"
            :key="loc.id"
            :id="loc.id"
            :d="loc.path"
            :fill="getFillForPath(loc.id)"
            stroke="#ffffff"
            stroke-width="1"
            class="region-path transition-colors duration-200 cursor-pointer"
            :class="{ 'region-path--hover': hoverId === loc.id }"
            @mouseenter="setHover(loc.id)"
            @mouseleave="hoverId = null"
          />
        </svg>

        <!-- 浮動 Tooltip：跟隨滑鼠 -->
        <div
          v-if="tooltip"
          class="tooltip-box absolute pointer-events-none z-20 px-3 py-2 rounded-lg shadow-lg bg-white border border-gray-200 text-sm"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px', transform: 'translate(8px, 8px)' }"
        >
          <span class="font-semibold text-gray-900">{{ tooltip.name }}</span>
          <span class="text-gray-600">：{{ tooltip.count }} 件</span>
        </div>
      </div>

      <!-- 圖例 -->
      <div class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded border border-gray-300 shadow-sm" style="background-color: #ef4444"></div>
          <span class="text-gray-700">高客訴 (10+)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded border border-gray-300 shadow-sm" style="background-color: #f59e0b"></div>
          <span class="text-gray-700">中客訴 (5-9)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded border border-gray-300 shadow-sm" style="background-color: #10b981"></div>
          <span class="text-gray-700">低客訴 (1-4)</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded border border-gray-300 shadow-sm" style="background-color: #9ca3af"></div>
          <span class="text-gray-700">無客訴 (0)</span>
        </div>
      </div>
    </div>

    <!-- 統計摘要 -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-blue-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-blue-600">{{ totalComplaints }}</div>
        <div class="text-sm text-blue-800">總客訴數</div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-green-600">{{ activeCities }}</div>
        <div class="text-sm text-green-800">有客訴縣市</div>
      </div>
      <div class="bg-orange-50 p-4 rounded-lg">
        <div class="text-2xl font-bold text-orange-600">{{ topCity }}</div>
        <div class="text-sm text-orange-800">最高客訴縣市</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import taiwanMapData from '@svg-maps/taiwan'

/** 只顯示本島縣市 + 澎湖、金門、連江，其餘小島過濾掉 */
const ALLOWED_IDS = [
  'keelung-city',
  'taipei-city',
  'new-taipei-city',
  'taoyuan-city',
  'hsinchu-city',
  'hsinchu-county',
  'miaoli-county',
  'taichung-city',
  'changhua-county',
  'nantou-county',
  'yunlin-county',
  'chiayi-city',
  'chiayi-county',
  'tainan-city',
  'kaohsiung-city',
  'pingtung-county',
  'yilan-county',
  'hualien-county',
  'taitung-county',
  'penghu-county',
  'kinmen-county',
  'lienchiang-county'
] as const

const PATH_ID_TO_NAMES: Record<string, string[]> = {
  'changhua-county': ['彰化縣', '彰化'],
  'chiayi-city': ['嘉義市', '嘉義'],
  'chiayi-county': ['嘉義縣', '嘉義'],
  'hualien-county': ['花蓮縣', '花蓮'],
  'hsinchu-city': ['新竹市', '新竹'],
  'hsinchu-county': ['新竹縣', '新竹'],
  'kaohsiung-city': ['高雄市', '高雄'],
  'keelung-city': ['基隆市', '基隆'],
  'kinmen-county': ['金門縣', '金門'],
  'lienchiang-county': ['連江縣', '連江', '馬祖'],
  'miaoli-county': ['苗栗縣', '苗栗'],
  'nantou-county': ['南投縣', '南投'],
  'new-taipei-city': ['新北市', '新北'],
  'penghu-county': ['澎湖縣', '澎湖'],
  'pingtung-county': ['屏東縣', '屏東'],
  'taichung-city': ['台中市', '台中'],
  'tainan-city': ['台南市', '台南', '臺南'],
  'taipei-city': ['台北市', '台北', '臺北'],
  'taitung-county': ['台東縣', '台東', '臺東'],
  'taoyuan-city': ['桃園市', '桃園'],
  'yilan-county': ['宜蘭縣', '宜蘭'],
  'yunlin-county': ['雲林縣', '雲林']
}

const allowedSet = new Set(ALLOWED_IDS)

const mapLocations = computed(
  () => (taiwanMapData?.locations ?? []) as Array<{ id: string; name: string; path: string }>
)
const filteredLocations = computed(() =>
  mapLocations.value.filter((loc) => allowedSet.has(loc.id as (typeof ALLOWED_IDS)[number]))
)

const cityStats = ref<Array<{ city: string; count: number }>>([])
const mapWrapRef = ref<HTMLElement | null>(null)
const hoverId = ref<string | null>(null)
const tooltip = ref<{ name: string; count: number; x: number; y: number } | null>(null)

function pathIdToName(id: string): string {
  return PATH_ID_TO_NAMES[id]?.[0] ?? id
}

function getCountForPath(pathId: string): number {
  const names = PATH_ID_TO_NAMES[pathId]
  if (!names) return 0
  const stat = cityStats.value.find((s) => names.includes(s.city))
  return stat?.count ?? 0
}

function getFillForPath(pathId: string): string {
  const count = getCountForPath(pathId)
  if (count >= 10) return '#ef4444'
  if (count >= 5) return '#f59e0b'
  if (count >= 1) return '#10b981'
  return '#9ca3af'
}

function setHover(id: string) {
  hoverId.value = id
  const name = pathIdToName(id)
  const count = getCountForPath(id)
  tooltip.value = { name, count, x: 0, y: 0 }
}

function onMouseMove(e: MouseEvent) {
  if (tooltip.value && mapWrapRef.value) {
    const rect = mapWrapRef.value.getBoundingClientRect()
    tooltip.value = {
      ...tooltip.value,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }
}

const totalComplaints = computed(() =>
  cityStats.value.reduce((sum, c) => sum + c.count, 0)
)
const activeCities = computed(() =>
  cityStats.value.filter((c) => c.count > 0).length
)
const topCity = computed(() => {
  const sorted = [...cityStats.value].sort((a, b) => b.count - a.count)
  const top = sorted[0]
  return top ? `${top.city} (${top.count})` : '無'
})

async function fetchCityStats() {
  try {
    const response = await fetch('/api/complaints/stats').then((res) => res.json())
    if (response.success && response.data) {
      cityStats.value = response.data.cityStats || []
    }
  } catch (error) {
    console.error('獲取縣市統計失敗:', error)
  }
}

onMounted(() => {
  fetchCityStats()
})
</script>

<style scoped>
.taiwan-map-wrap {
  min-height: 200px;
}
.region-path--hover {
  filter: brightness(0.95);
}
.tooltip-box {
  color: #1f2937;
}
</style>
