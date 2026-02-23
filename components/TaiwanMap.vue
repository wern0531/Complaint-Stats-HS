<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">台灣各縣市客訴統計地圖</h3>
    
    <!-- 地圖容器 -->
    <div class="relative w-full max-w-4xl mx-auto">
      <!-- 台灣地圖圖片 -->
      <div class="relative inline-block">
        <img 
          src="/taiwan-map-real.png.jpg" 
          alt="台灣地圖" 
          class="w-full h-auto max-w-4xl border border-gray-200 rounded-lg shadow-lg"
          @error="handleImageError"
        />
        
        <!-- 縣市標籤覆蓋層 -->
        <div class="absolute top-0 left-0 w-full h-full">
          <div 
            v-for="city in cityData" 
            :key="city.city"
            class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            :style="{ left: city.x + '%', top: city.y + '%' }"
            @click="showCityDetail(city.city)"
          >
            <!-- 縣市標記點 -->
            <div 
              class="w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-125"
              :style="{ backgroundColor: getCountColor(city.count) }"
            ></div>
            
            <!-- 客訴數量標籤 -->
            <div 
              class="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10"
              :style="{ 
                backgroundColor: getCountColor(city.count) + '20',
                borderColor: getCountColor(city.count)
              }"
            >
              <div class="text-xs font-bold" :style="{ color: getCountColor(city.count) }">
                {{ city.city }}: {{ city.count }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 圖例 -->
      <div class="mt-6 flex justify-center space-x-6 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md"></div>
          <span class="text-gray-700">高客訴 (10+)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow-md"></div>
          <span class="text-gray-700">中客訴 (5-9)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
          <span class="text-gray-700">低客訴 (1-4)</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow-md"></div>
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

    <!-- 縣市位置調整工具 -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="text-md font-medium text-gray-900 mb-3">縣市位置調整工具</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div 
          v-for="city in cityCoordinates" 
          :key="city.city"
          class="flex items-center space-x-2 p-2 bg-white rounded border"
        >
          <span class="text-sm font-medium text-gray-700 min-w-[60px]">{{ city.city }}</span>
          <input 
            v-model.number="city.x" 
            type="number" 
            min="0" 
            max="100" 
            class="w-16 px-2 py-1 text-xs border rounded"
            placeholder="X %"
          />
          <input 
            v-model.number="city.y" 
            type="number" 
            min="0" 
            max="100" 
            class="w-16 px-2 py-1 text-xs border rounded"
            placeholder="Y %"
          />
        </div>
      </div>
      <div class="mt-3 flex space-x-2">
        <button 
          @click="resetCoordinates" 
          class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          重置座標
        </button>
        <button 
          @click="saveCoordinates" 
          class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          儲存座標
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// 縣市座標和名稱定義（可調整）
const cityCoordinates = ref([
  // 北部地區
  { city: '台北市', x: 50, y: 22 },
  { city: '新北市', x: 47, y: 25 },
  { city: '基隆市', x: 52, y: 18 },
  { city: '桃園市', x: 45, y: 28 },
  { city: '新竹市', x: 42, y: 32 },
  { city: '新竹縣', x: 45, y: 35 },
  { city: '苗栗縣', x: 42, y: 40 },
  
  // 中部地區
  { city: '台中市', x: 40, y: 48 },
  { city: '彰化縣', x: 38, y: 52 },
  { city: '南投縣', x: 45, y: 55 },
  { city: '雲林縣', x: 35, y: 58 },
  
  // 南部地區
  { city: '嘉義縣', x: 33, y: 65 },
  { city: '嘉義市', x: 35, y: 67 },
  { city: '台南市', x: 32, y: 72 },
  { city: '高雄市', x: 35, y: 80 },
  { city: '屏東縣', x: 38, y: 88 },
  
  // 東部地區
  { city: '宜蘭縣', x: 62, y: 28 },
  { city: '花蓮縣', x: 68, y: 50 },
  { city: '台東縣', x: 65, y: 75 },
  
  // 離島地區
  { city: '澎湖縣', x: 15, y: 65 },
  { city: '金門縣', x: 8, y: 60 },
  { city: '連江縣', x: 25, y: 8 }
])

// 縣市統計數據
const cityStats = ref<Array<{ city: string; count: number }>>([])
const loading = ref(true)

// 計算屬性
const cityData = computed(() => {
  return cityCoordinates.value.map(coord => {
    const stats = cityStats.value.find(s => s.city === coord.city)
    return {
      ...coord,
      count: stats?.count || 0
    }
  })
})

const totalComplaints = computed(() => {
  return cityStats.value.reduce((sum, city) => sum + city.count, 0)
})

const activeCities = computed(() => {
  return cityStats.value.filter(city => city.count > 0).length
})

const topCity = computed(() => {
  const top = cityStats.value.sort((a, b) => b.count - a.count)[0]
  return top ? `${top.city} (${top.count})` : '無'
})

// 根據數量獲取顏色
const getCountColor = (count: number) => {
  if (count >= 10) return '#ef4444' // 紅色
  if (count >= 5) return '#f59e0b' // 黃色
  if (count >= 1) return '#10b981' // 綠色
  return '#9ca3af' // 灰色
}

// 獲取縣市統計數據
const fetchCityStats = async () => {
  try {
    loading.value = true
    const response = await fetch('/api/complaints/stats').then(res => res.json())
    if (response.success && response.data) {
      cityStats.value = response.data.cityStats || []
    }
  } catch (error) {
    console.error('獲取縣市統計失敗:', error)
  } finally {
    loading.value = false
  }
}

// 圖片錯誤處理
const handleImageError = () => {
  console.error('台灣地圖圖片載入失敗')
}

// 顯示縣市詳情
const showCityDetail = (cityName: string) => {
  const cityData = cityStats.value.find((item: any) => item.city === cityName)
  if (cityData) {
    alert(`${cityName}：${cityData.count} 筆客訴資料`)
  } else {
    alert(`${cityName}：0 筆客訴資料`)
  }
}

// 重置座標到預設值
const resetCoordinates = () => {
  cityCoordinates.value = [
    { city: '台北市', x: 50, y: 22 },
    { city: '新北市', x: 47, y: 25 },
    { city: '基隆市', x: 52, y: 18 },
    { city: '桃園市', x: 45, y: 28 },
    { city: '新竹市', x: 42, y: 32 },
    { city: '新竹縣', x: 45, y: 35 },
    { city: '苗栗縣', x: 42, y: 40 },
    { city: '台中市', x: 40, y: 48 },
    { city: '彰化縣', x: 38, y: 52 },
    { city: '南投縣', x: 45, y: 55 },
    { city: '雲林縣', x: 35, y: 58 },
    { city: '嘉義縣', x: 33, y: 65 },
    { city: '嘉義市', x: 35, y: 67 },
    { city: '台南市', x: 32, y: 72 },
    { city: '高雄市', x: 35, y: 80 },
    { city: '屏東縣', x: 38, y: 88 },
    { city: '宜蘭縣', x: 62, y: 28 },
    { city: '花蓮縣', x: 68, y: 50 },
    { city: '台東縣', x: 65, y: 75 },
    { city: '澎湖縣', x: 15, y: 65 },
    { city: '金門縣', x: 8, y: 60 },
    { city: '連江縣', x: 25, y: 8 }
  ]
}

// 儲存座標到 localStorage
const saveCoordinates = () => {
  try {
    localStorage.setItem('taiwan-map-coordinates', JSON.stringify(cityCoordinates.value))
    alert('座標已儲存！')
  } catch (error) {
    console.error('儲存座標失敗:', error)
    alert('儲存座標失敗')
  }
}

// 從 localStorage 載入座標
const loadCoordinates = () => {
  try {
    const saved = localStorage.getItem('taiwan-map-coordinates')
    if (saved) {
      cityCoordinates.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('載入座標失敗:', error)
  }
}

// 組件掛載時獲取數據和載入座標
onMounted(() => {
  fetchCityStats()
  loadCoordinates()
})
</script>

<style scoped>
/* 自定義樣式 */
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-medium {
  font-weight: 500;
}

.font-bold {
  font-weight: 700;
}
</style>
