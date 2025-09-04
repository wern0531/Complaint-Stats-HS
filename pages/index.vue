<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 頁面標題 -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">客訴統計搜尋工具</h1>
            <p class="text-sm text-gray-600 mt-1">客訴資料管理與統計分析系統</p>
          </div>
          <div class="flex space-x-3">
            <button
              @click="showUploadModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Excel 上傳
            </button>
            <button
              @click="showModal = true"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              新增客訴
            </button>
            <button
              @click="showStatsModal = true"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              統計資料
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要內容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 左側搜尋區 -->
        <div class="lg:col-span-1">
          <SearchFilters @search="handleSearch" />
        </div>

        <!-- 右側結果區 -->
        <div class="lg:col-span-3">
          <ComplaintTable 
            :complaints="complaints" 
            :loading="loading"
            @view-detail="handleViewDetail"
            @edit-complaint="handleEditComplaint"
          />
        </div>
      </div>
    </main>

    <!-- 新增/編輯 Modal -->
    <ComplaintModal
      :is-open="showModal"
      :edit-data="editData"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <!-- Excel 上傳 Modal -->
    <div
      v-if="showUploadModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="upload-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- 背景遮罩 -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showUploadModal = false"
        ></div>

        <!-- Modal 內容 -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900" id="upload-modal-title">
                Excel 檔案上傳
              </h3>
              <button
                @click="showUploadModal = false"
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span class="sr-only">關閉</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6">
            <ExcelUpload 
              @upload-success="handleUploadSuccess"
              @upload-error="handleUploadError"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 統計 Modal -->
    <div
      v-if="showStatsModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="stats-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- 背景遮罩 -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showStatsModal = false"
        ></div>

        <!-- Modal 內容 -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900" id="stats-modal-title">
                統計資料與地圖分佈
              </h3>
              <button
                @click="showStatsModal = false"
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span class="sr-only">關閉</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6 max-h-[80vh] overflow-y-auto">
            <!-- 統計資料內容 -->
            <div v-if="statsLoading" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span class="ml-3 text-gray-600">載入統計資料中...</span>
            </div>
            <div v-else-if="statsData" class="space-y-6">
              <!-- 月份選擇器 -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-gray-900 mb-3">篩選條件</h4>
                <div class="space-y-4">
                  <!-- 單月份選擇 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">單月份選擇</label>
                    <div class="flex items-center space-x-4">
                      <label class="flex items-center">
                        <input 
                          type="radio" 
                          v-model="selectedPeriod" 
                          value="single" 
                          class="mr-2"
                          @change="handlePeriodChange"
                        />
                        <span class="text-sm">單月份</span>
                      </label>
                      <select 
                        v-model="selectedMonth" 
                        @change="handleMonthChange"
                        :disabled="selectedPeriod !== 'single'"
                        class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">選擇月份</option>
                        <option v-for="month in 13" :key="month-1" :value="month-1">
                          {{ month-1 }}月
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- 月份範圍選擇 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">月份範圍選擇</label>
                    <div class="flex items-center space-x-4">
                      <label class="flex items-center">
                        <input 
                          type="radio" 
                          v-model="selectedPeriod" 
                          value="range" 
                          class="mr-2"
                          @change="handlePeriodChange"
                        />
                        <span class="text-sm">月份範圍</span>
                      </label>
                      <div class="flex items-center space-x-2">
                        <select 
                          v-model="startMonth" 
                          @change="handleRangeChange"
                          :disabled="selectedPeriod !== 'range'"
                          class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">開始月份</option>
                          <option v-for="month in 13" :key="month-1" :value="month-1">
                            {{ month-1 }}月
                          </option>
                        </select>
                        <span class="text-gray-500">~</span>
                        <select 
                          v-model="endMonth" 
                          @change="handleRangeChange"
                          :disabled="selectedPeriod !== 'range'"
                          class="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">結束月份</option>
                          <option v-for="month in 13" :key="month-1" :value="month-1">
                            {{ month-1 }}月
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- 全部資料 -->
                  <div>
                    <label class="flex items-center">
                      <input 
                        type="radio" 
                        v-model="selectedPeriod" 
                        value="all" 
                        class="mr-2"
                        @change="handlePeriodChange"
                      />
                      <span class="text-sm">全部客訴資料</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- 總計 -->
              <div class="bg-blue-50 rounded-lg p-4">
                <h4 class="text-lg font-semibold text-blue-900 mb-2">
                  {{ getFilterLabel() }}統計
                </h4>
                <p class="text-2xl font-bold text-blue-600">{{ statsData?.total || 0 }} 筆客訴資料</p>
              </div>

              <!-- 圖表區域 -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- 縣市客訴統計 - 長條圖 -->
                <div class="bg-white rounded-lg shadow-md p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-4">縣市客訴統計</h4>
                  <BarChart 
                    :data="cityChartData" 
                    title="縣市客訴統計"
                    height="250px"
                  />
                </div>

                <!-- 產品客訴統計 - 長條圖 -->
                <div class="bg-white rounded-lg shadow-md p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-4">產品客訴統計</h4>
                  <BarChart 
                    :data="productChartData" 
                    title="產品客訴統計"
                    height="250px"
                  />
                </div>

                <!-- 購買通路分布 - 圓餅圖 -->
                <div class="bg-white rounded-lg shadow-md p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-4">購買通路分布</h4>
                  <PieChart 
                    :data="channelChartData" 
                    title="購買通路分布"
                    height="250px"
                  />
                </div>

                <!-- 產品狀態分布 - 圓餅圖 -->
                <div class="bg-white rounded-lg shadow-md p-4">
                  <h4 class="text-lg font-medium text-gray-900 mb-4">產品狀態分布</h4>
                  <PieChart 
                    :data="statusChartData" 
                    title="產品狀態分布"
                    height="250px"
                  />
                </div>
              </div>

              <!-- 縣市分布表格 -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-4">各縣市分佈</h4>
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div class="max-h-80 overflow-y-auto">
                    <table class="w-full">
                      <thead class="bg-gray-50 sticky top-0">
                        <tr>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            縣市
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            客訴數量
                          </th>
                          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            比例
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        <tr 
                          v-for="(item, index) in (statsData?.cityStats || [])" 
                          :key="item.city"
                          class="hover:bg-gray-50 cursor-pointer"
                          @click="showCityDetail(item.city)"
                        >
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div 
                                class="w-3 h-3 rounded-full mr-3"
                                :style="{ backgroundColor: getCityColor(item.city) }"
                              ></div>
                              <div class="text-sm font-medium text-gray-900">
                                {{ item.city }}
                              </div>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm text-gray-900 font-semibold">
                              {{ item.count }} 筆
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center">
                              <div class="text-sm text-gray-500 mr-2">
                                {{ Math.round((item.count / (statsData?.total || 1)) * 100) }}%
                              </div>
                              <div class="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  class="h-2 rounded-full transition-all duration-500"
                                  :style="{ 
                                    width: `${(item.count / (statsData?.total || 1)) * 100}%`,
                                    backgroundColor: getCityColor(item.city)
                                  }"
                                ></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- 台灣地圖 -->
              <div>
                <h4 class="text-lg font-semibold text-gray-900 mb-4">台灣地圖分佈</h4>
                <div class="relative bg-gray-50 rounded-lg p-6">
                  <!-- 台灣地圖 -->
                  <div class="flex justify-center relative">
                    <div class="relative inline-block">
                      <!-- 使用 TaiwanBeez 的台灣地圖 -->
                      <div class="relative">
                        <img 
                          src="/taiwan-map-real.png.jpg"
                          alt="台灣地圖"
                          class="w-96 h-auto border border-gray-200 rounded bg-white"
                          @error="handleImageError"
                          @load="handleImageLoad"
                        />
                        
                        <!-- 備用本地 SVG 地圖 -->
                        <img 
                          ref="backupMap"
                          src="/taiwan-map.svg"
                          alt="台灣地圖 (備用)"
                          class="w-96 h-auto border border-gray-200 rounded bg-white hidden"
                        />
                        
                        <!-- 在地圖上標示各縣市位置點 -->
                        <div 
                          v-for="(item, index) in cityMapLocalData" 
                          :key="item.city"
                          class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                          :style="{ left: item.x + '%', top: item.y + '%' }"
                          @click="showCityDetail(item.city)"
                        >
                          <!-- 小圓點標記 -->
                          <div 
                            class="w-3 h-3 rounded-full border border-white shadow-md hover:scale-125 transition-transform"
                            :style="{ backgroundColor: getCityColor(item.city) }"
                          ></div>
                        </div>
                        
                        <!-- SVG 覆蓋層用於繪製箭頭線條和標籤框 -->
                        <svg 
                          class="absolute top-0 left-0 w-full h-full pointer-events-none"
                          viewBox="0 0 400 500"
                          preserveAspectRatio="xMidYMid meet"
                        >
                          <!-- 箭頭線條和標籤框 -->
                          <g v-for="(item, index) in cityMapArrowData" :key="item.city">
                            <!-- 虛線箭頭 -->
                            <line 
                              :x1="item.pointX" 
                              :y1="item.pointY" 
                              :x2="item.labelX" 
                              :y2="item.labelY" 
                              stroke="#6b7280" 
                              stroke-width="1"
                              stroke-dasharray="3,3"
                            />
                            
                            <!-- 箭頭端點 -->
                            <circle 
                              :cx="item.labelX" 
                              :cy="item.labelY" 
                              r="2" 
                              fill="#6b7280"
                            />
                            
                            <!-- 標籤框背景 -->
                            <rect 
                              :x="item.labelX - 30" 
                              :y="item.labelY - 20" 
                              width="60" 
                              height="40" 
                              fill="white" 
                              stroke="#d1d5db" 
                              rx="6"
                              filter="drop-shadow(2px 2px 4px rgba(0,0,0,0.1))"
                              class="pointer-events-auto cursor-pointer"
                              @click="showCityDetail(item.city)"
                            />
                            
                            <!-- 縣市名稱 -->
                            <text 
                              :x="item.labelX" 
                              :y="item.labelY - 8" 
                              text-anchor="middle" 
                              class="text-xs font-medium fill-gray-700 pointer-events-auto cursor-pointer"
                              @click="showCityDetail(item.city)"
                            >
                              {{ item.city }}
                            </text>
                            
                            <!-- 數量顯示 -->
                            <text 
                              :x="item.labelX" 
                              :y="item.labelY + 6" 
                              text-anchor="middle" 
                              class="text-sm font-bold fill-blue-600 pointer-events-auto cursor-pointer"
                              @click="showCityDetail(item.city)"
                            >
                              {{ item.count }}筆
                            </text>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 圖例 -->
                  <div class="mt-6 flex justify-center space-x-6 text-sm">
                    <div class="flex items-center">
                      <div class="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                      <span>直轄市</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span>縣</span>
                    </div>
                    <div class="flex items-center">
                      <div class="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                      <span>外島</span>
                    </div>
                  </div>
                  
                  <!-- 說明文字 -->
                  <div class="mt-4 text-center text-sm text-gray-600">
                    <div>點擊地圖上的圓點查看各縣市詳細資訊</div>
                    <div class="mt-2 text-xs text-gray-500">
                      地圖來源：本地圖片資源
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細資料 Modal -->
    <div
      v-if="showDetailModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="detail-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- 背景遮罩 -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="showDetailModal = false"
        ></div>

        <!-- Modal 內容 -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900" id="detail-modal-title">
                客訴詳細資料
              </h3>
              <button
                @click="showDetailModal = false"
                class="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <span class="sr-only">關閉</span>
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-6" v-if="detailData">
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700">客訴編號</label>
                  <p class="mt-1 text-sm text-gray-900">{{ detailData.complaintNumber }}</p>
                </div>
                                 <div>
                   <label class="block text-sm font-medium text-gray-700">產品品項</label>
                   <p class="mt-1 text-sm text-gray-900">{{ detailData.productItem }}</p>
                 </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">製造機台</label>
                  <p class="mt-1 text-sm text-gray-900">{{ detailData.manufacturingMachine || '-' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">消費者</label>
                  <p class="mt-1 text-sm text-gray-900">{{ detailData.consumer || '-' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">縣市</label>
                  <p class="mt-1 text-sm text-gray-900">{{ detailData.city || '-' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">產品狀態</label>
                  <p class="mt-1 text-sm text-gray-900">{{ detailData.productStatus || '-' }}</p>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">相關單位回覆</label>
                <p class="mt-1 text-sm text-gray-900">{{ detailData.departmentReply || '-' }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">原因分析</label>
                <p class="mt-1 text-sm text-gray-900">{{ detailData.causeAnalysis || '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Complaint } from '~/types/complaint'

// 組件
import SearchFilters from '~/components/SearchFilters.vue'
import ComplaintTable from '~/components/ComplaintTable.vue'
import ComplaintModal from '~/components/ComplaintModal.vue'
import ExcelUpload from '~/components/ExcelUpload.vue'
import BarChart from '~/components/BarChart.vue'
import PieChart from '~/components/PieChart.vue'

// 工具函數
import {
  transformCityStatsToBarChart,
  transformProductStatsToBarChart,
  transformChannelStatsToPieChart,
  transformStatusStatsToPieChart
} from '~/utils/chartDataTransformer'

// SEO 設定 - SPA 模式下使用 useHead
useHead({
  title: '客訴統計搜尋工具',
  meta: [
    { name: 'description', content: '客訴資料統計與搜尋管理系統' }
  ]
})

// 響應式資料
const loading = ref(false)
const complaints = ref<Complaint[]>([])
const showModal = ref(false)
const showUploadModal = ref(false)
const showStatsModal = ref(false)
const showDetailModal = ref(false)
const editData = ref<Complaint | null>(null)
const detailData = ref<Complaint | null>(null)
const statsLoading = ref(false)
const statsData = ref<any>({
  total: 0,
  cityStats: [],
  productStats: [],
  machineStats: [],
  channelStats: [],
  statusStats: [],
  monthlyStats: []
})

// 統計相關資料
const selectedPeriod = ref<string>('all')
const selectedMonth = ref<string>('')
const startMonth = ref<string>('')
const endMonth = ref<string>('')
const availableMonths = ref([
  { value: '2024-01', label: '2024年1月' },
  { value: '2024-02', label: '2024年2月' },
  { value: '2024-03', label: '2024年3月' },
  { value: '2024-04', label: '2024年4月' },
  { value: '2024-05', label: '2024年5月' },
  { value: '2024-06', label: '2024年6月' },
  { value: '2024-07', label: '2024年7月' },
  { value: '2024-08', label: '2024年8月' },
  { value: '2024-09', label: '2024年9月' },
  { value: '2024-10', label: '2024年10月' },
  { value: '2024-11', label: '2024年11月' },
  { value: '2024-12', label: '2024年12月' }
])

// 地圖相關
const mapLoaded = ref(false)
const backupMap = ref<HTMLImageElement>()

// 計算屬性
const selectedMonthLabel = computed(() => {
  if (selectedPeriod.value === 'single' && selectedMonth.value !== '' && selectedMonth.value != null) {
    const month = parseInt(selectedMonth.value.toString())
    return `${month}月`
  }
  return ''
})

const maxCityCount = computed(() => {
  if (!statsData.value?.cityStats || !Array.isArray(statsData.value.cityStats) || statsData.value.cityStats.length === 0) return 1
  return Math.max(...statsData.value.cityStats.map((item: any) => item.count || 0))
})

// 圖表數據
const cityChartData = computed(() => {
  if (!statsData.value?.cityStats) return { labels: [], datasets: [] }
  return transformCityStatsToBarChart(statsData.value.cityStats)
})

const productChartData = computed(() => {
  if (!statsData.value?.productStats) return { labels: [], datasets: [] }
  return transformProductStatsToBarChart(statsData.value.productStats)
})

const channelChartData = computed(() => {
  if (!statsData.value?.channelStats) return { labels: [], datasets: [] }
  return transformChannelStatsToPieChart(statsData.value.channelStats)
})

const statusChartData = computed(() => {
  if (!statsData.value?.statusStats) return { labels: [], datasets: [] }
  return transformStatusStatsToPieChart(statsData.value.statusStats)
})

// 使用 TaiwanBeez 和備用地圖的縣市位置座標
const cityMapLocalData = computed(() => {
  if (!statsData.value?.cityStats || !Array.isArray(statsData.value.cityStats)) return []
  
  // TaiwanBeez 地圖的縣市位置（以百分比表示）
  const taiwanBeezPositions = {
    '基隆市': { x: 48, y: 16 },
    '台北市': { x: 45, y: 20 },
    '新北市': { x: 47, y: 22 },
    '桃園市': { x: 42, y: 26 },
    '新竹市': { x: 38, y: 32 },
    '新竹縣': { x: 40, y: 34 },
    '苗栗縣': { x: 35, y: 38 },
    '台中市': { x: 35, y: 46 },
    '彰化縣': { x: 32, y: 52 },
    '南投縣': { x: 40, y: 52 },
    '雲林縣': { x: 30, y: 58 },
    '嘉義縣': { x: 28, y: 65 },
    '嘉義市': { x: 30, y: 67 },
    '台南市': { x: 26, y: 72 },
    '高雄市': { x: 30, y: 80 },
    '屏東縣': { x: 32, y: 88 },
    '宜蘭縣': { x: 58, y: 28 },
    '花蓮縣': { x: 62, y: 48 },
    '台東縣': { x: 58, y: 70 },
    '澎湖縣': { x: 15, y: 62 },
    '金門縣': { x: 8, y: 58 },
    '連江縣': { x: 25, y: 8 }
  }
  
  // 備用 SVG 地圖的縣市位置
  const svgPositions = {
    '基隆市': { x: 48, y: 12 },
    '台北市': { x: 50, y: 17 },
    '新北市': { x: 45, y: 20 },
    '桃園市': { x: 45, y: 22 },
    '新竹市': { x: 41, y: 28 },
    '新竹縣': { x: 43, y: 30 },
    '苗栗縣': { x: 38, y: 34 },
    '台中市': { x: 40, y: 40 },
    '彰化縣': { x: 36, y: 46 },
    '南投縣': { x: 44, y: 49 },
    '雲林縣': { x: 34, y: 52 },
    '嘉義縣': { x: 32, y: 58 },
    '嘉義市': { x: 34, y: 60 },
    '台南市': { x: 31, y: 64 },
    '高雄市': { x: 34, y: 70 },
    '屏東縣': { x: 39, y: 76 },
    '宜蘭縣': { x: 62, y: 28 },
    '花蓮縣': { x: 67, y: 44 },
    '台東縣': { x: 65, y: 64 },
    '澎湖縣': { x: 20, y: 56 },
    '金門縣': { x: 12, y: 50 },
    '連江縣': { x: 30, y: 10 }
  }
  
  // 在 SSR 期間或 mapLoaded 未初始化時，使用預設的 SVG 位置
  // 避免在 SSR 期間訪問 mapLoaded.value
  let cityPositions = svgPositions
  try {
    if (mapLoaded && mapLoaded.value) {
      cityPositions = taiwanBeezPositions
    }
  } catch (error) {
    // 在 SSR 期間忽略錯誤，使用預設位置
    cityPositions = svgPositions
  }
  
  return statsData.value.cityStats
    .filter((item: any) => cityPositions[item.city as keyof typeof cityPositions])
    .map((item: any) => ({
      city: item.city,
      count: item.count,
      ...cityPositions[item.city as keyof typeof cityPositions]
    }))
})

// 箭頭線條和標籤位置數據
const cityMapArrowData = computed(() => {
  if (!statsData.value?.cityStats || !Array.isArray(statsData.value.cityStats) || !cityMapLocalData.value || !Array.isArray(cityMapLocalData.value) || cityMapLocalData.value.length === 0) return []
  
  // 標籤框位置配置（地圖外圍分層排列）
  const labelPositions = {
    // 左上角區域
    '基隆市': { labelX: 80, labelY: 30 },
    '台北市': { labelX: 60, labelY: 60 },
    '新北市': { labelX: 100, labelY: 90 },
    '桃園市': { labelX: 40, labelY: 120 },
    
    // 左側區域
    '新竹市': { labelX: 30, labelY: 150 },
    '新竹縣': { labelX: 30, labelY: 180 },
    '苗栗縣': { labelX: 30, labelY: 210 },
    '台中市': { labelX: 30, labelY: 240 },
    '彰化縣': { labelX: 30, labelY: 270 },
    '雲林縣': { labelX: 30, labelY: 300 },
    '嘉義縣': { labelX: 30, labelY: 330 },
    '台南市': { labelX: 30, labelY: 360 },
    
    // 左下角區域
    '高雄市': { labelX: 50, labelY: 430 },
    '屏東縣': { labelX: 120, labelY: 470 },
    
    // 右上角區域
    '宜蘭縣': { labelX: 340, labelY: 60 },
    
    // 右側區域
    '花蓮縣': { labelX: 360, labelY: 120 },
    '台東縣': { labelX: 360, labelY: 200 },
    '南投縣': { labelX: 360, labelY: 280 },
    '嘉義市': { labelX: 340, labelY: 340 },
    
    // 外島（左外側）
    '澎湖縣': { labelX: 20, labelY: 390 },
    '金門縣': { labelX: 20, labelY: 420 },
    '連江縣': { labelX: 20, labelY: 20 }
  }
  
  // 合併圓點位置和標籤位置
  return cityMapLocalData.value
    .filter((item: any) => labelPositions[item.city as keyof typeof labelPositions])
    .map((item: any) => {
      const labelPos = labelPositions[item.city as keyof typeof labelPositions]
      // 將百分比轉換為 SVG 座標（400x500 viewBox）
      const pointX = (item.x / 100) * 400
      const pointY = (item.y / 100) * 500
      
      return {
        city: item.city,
        count: item.count,
        pointX,
        pointY,
        labelX: labelPos.labelX,
        labelY: labelPos.labelY
      }
    })
})

// 使用真實台灣地圖圖片的縣市位置座標（百分比）
const cityMapImageData = computed(() => {
  if (!statsData.value?.cityStats || !Array.isArray(statsData.value.cityStats)) return []
  
  // 根據真實台灣地圖圖片的縣市位置（以百分比表示）
  const cityPositions = {
    '基隆市': { x: 52, y: 18 },
    '台北市': { x: 48, y: 22 },
    '新北市': { x: 50, y: 25 },
    '桃園市': { x: 45, y: 28 },
    '新竹市': { x: 42, y: 32 },
    '新竹縣': { x: 45, y: 35 },
    '苗栗縣': { x: 42, y: 40 },
    '台中市': { x: 40, y: 48 },
    '彰化縣': { x: 38, y: 52 },
    '南投縣': { x: 45, y: 55 },
    '雲林縣': { x: 35, y: 58 },
    '嘉義縣': { x: 33, y: 65 },
    '嘉義市': { x: 35, y: 67 },
    '台南市': { x: 32, y: 72 },
    '高雄市': { x: 35, y: 80 },
    '屏東縣': { x: 38, y: 88 },
    '宜蘭縣': { x: 62, y: 28 },
    '花蓮縣': { x: 68, y: 50 },
    '台東縣': { x: 65, y: 75 },
    '澎湖縣': { x: 15, y: 65 },
    '金門縣': { x: 8, y: 60 },
    '連江縣': { x: 25, y: 8 }
  }
  
  return statsData.value.cityStats
    .filter((item: any) => cityPositions[item.city as keyof typeof cityPositions])
    .map((item: any) => ({
      city: item.city,
      count: item.count,
      ...cityPositions[item.city as keyof typeof cityPositions]
    }))
})

const cityMapData = computed(() => {
  if (!statsData.value?.cityStats || !Array.isArray(statsData.value.cityStats)) return []
  
  const cityPositions = {
    '台北市': { x: 250, y: 95, labelX: 150, labelY: 60 },
    '新北市': { x: 270, y: 105, labelX: 180, labelY: 80 },
    '桃園市': { x: 235, y: 120, labelX: 120, labelY: 120 },
    '台中市': { x: 200, y: 200, labelX: 100, labelY: 200 },
    '台南市': { x: 160, y: 310, labelX: 80, labelY: 320 },
    '高雄市': { x: 170, y: 350, labelX: 80, labelY: 370 },
    '基隆市': { x: 265, y: 80, labelX: 350, labelY: 50 },
    '彰化縣': { x: 185, y: 220, labelX: 400, labelY: 180 },
    '南投縣': { x: 220, y: 230, labelX: 400, labelY: 210 },
    '花蓮縣': { x: 320, y: 200, labelX: 420, labelY: 200 },
    '屏東縣': { x: 175, y: 380, labelX: 280, labelY: 420 },
    '宜蘭縣': { x: 310, y: 120, labelX: 420, labelY: 120 },
    '台東縣': { x: 310, y: 300, labelX: 420, labelY: 300 },
    '新竹市': { x: 220, y: 140, labelX: 400, labelY: 140 },
    '新竹縣': { x: 235, y: 150, labelX: 420, labelY: 160 },
    '苗栗縣': { x: 210, y: 170, labelX: 120, labelY: 160 },
    '雲林縣': { x: 175, y: 250, labelX: 80, labelY: 260 },
    '嘉義縣': { x: 165, y: 280, labelX: 80, labelY: 290 },
    '嘉義市': { x: 175, y: 285, labelX: 280, labelY: 300 },
    '澎湖縣': { x: 80, y: 280, labelX: 30, labelY: 310 },
    '金門縣': { x: 50, y: 250, labelX: 20, labelY: 220 },
    '連江縣': { x: 120, y: 40, labelX: 80, labelY: 20 }
  }
  
  return statsData.value.cityStats
    .filter((item: any) => cityPositions[item.city as keyof typeof cityPositions])
    .map((item: any) => ({
      city: item.city,
      count: item.count,
      ...cityPositions[item.city as keyof typeof cityPositions]
    }))
})

// 方法
const handleSearch = async (filters: any) => {
  loading.value = true
  try {
    const queryString = new URLSearchParams(filters).toString()
    const response = await fetch(`/api/complaints/list?${queryString}`).then(res => res.json())
    
    if (response.success) {
      complaints.value = response.data?.complaints || []
    } else {
      console.error('搜尋失敗:', response.message)
    }
  } catch (error) {
    console.error('搜尋錯誤:', error)
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (data: Partial<Complaint>) => {
  try {
    const isEdit = !!editData.value
    const url = isEdit ? `/api/complaints/${editData.value?._id}` : '/api/complaints/add'
    const method = isEdit ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json())
    
    if (response.success) {
      // 重新載入資料
      await handleSearch({})
      closeModal()
    }
  } catch (error) {
    console.error('提交失敗:', error)
  }
}

const handleViewDetail = (complaint: Complaint) => {
  detailData.value = complaint
  showDetailModal.value = true
}

const handleEditComplaint = (complaint: Complaint) => {
  editData.value = complaint
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editData.value = null
}

const handleUploadSuccess = (data: any) => {
  // 重新載入資料
  handleSearch({})
  showUploadModal.value = false
}

const handleUploadError = (error: string) => {
  console.error('上傳錯誤:', error)
}

// 統計相關方法
const updateStats = async () => {
  statsLoading.value = true
  try {
    const params: any = {}
    
    if (selectedPeriod.value === 'single' && selectedMonth.value !== '' && selectedMonth.value != null) {
      // 單月份篩選
      params.month = selectedMonth.value.toString()
    } else if (selectedPeriod.value === 'range' && startMonth.value !== '' && endMonth.value !== '' && startMonth.value != null && endMonth.value != null) {
      // 月份範圍篩選
      const start = parseInt(startMonth.value.toString())
      const end = parseInt(endMonth.value.toString())
      if (start <= end) {
        params.month = `${start}~${end}`
      }
    }
    // 如果 selectedPeriod.value === 'all'，不傳遞 month 參數
    
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`/api/complaints/stats?${queryString}`).then(res => res.json())
    if (response.success) {
      statsData.value = response.data
    }
  } catch (error) {
    console.error('載入統計資料失敗:', error)
  } finally {
    statsLoading.value = false
  }
}

const handleMonthChange = () => {
  if (selectedMonth.value) {
    selectedPeriod.value = 'single'
    updateStats()
  }
}

const handlePeriodChange = () => {
  if (selectedPeriod.value === 'single') {
    selectedMonth.value = ''
  } else if (selectedPeriod.value === 'range') {
    startMonth.value = ''
    endMonth.value = ''
  }
}

const handleRangeChange = () => {
  if (startMonth.value && endMonth.value) {
    selectedPeriod.value = 'range'
    updateStats()
  }
}

const getFilterLabel = () => {
  if (selectedPeriod.value === 'single' && selectedMonth.value !== '' && selectedMonth.value != null) {
    return `${selectedMonth.value}月`
  } else if (selectedPeriod.value === 'range' && startMonth.value !== '' && endMonth.value !== '' && startMonth.value != null && endMonth.value != null) {
    return `${startMonth.value}月 ~ ${endMonth.value}月`
  } else {
    return '全部'
  }
}

const getCityColor = (cityName: string) => {
  if (!cityName) return '#6b7280' // 預設灰色
  
  // 直轄市
  const municipalities = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市']
  // 外島
  const islands = ['澎湖縣', '金門縣', '連江縣']
  
  if (municipalities.includes(cityName)) {
    return '#3b82f6' // 藍色
  } else if (islands.includes(cityName)) {
    return '#f97316' // 橘色
  } else {
    return '#22c55e' // 綠色（縣）
  }
}

const showCityDetail = (cityName: string) => {
  if (!cityName || !statsData.value?.cityStats) return
  
  const cityData = statsData.value.cityStats.find((item: any) => item.city === cityName)
  if (cityData) {
    alert(`${cityName}：${cityData.count} 筆客訴資料`)
  } else {
    alert(`${cityName}：0 筆客訴資料`)
  }
}

const handleImageError = (event: Event) => {
  console.log('台灣地圖圖片載入失敗，使用備用 SVG 地圖')
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.display = 'none'
  }
  
  // 顯示備用地圖
  if (backupMap.value) {
    backupMap.value.classList.remove('hidden')
    mapLoaded.value = false
  }
}

const handleImageLoad = () => {
  console.log('台灣地圖圖片載入成功')
  mapLoaded.value = true
}

// 載入統計資料
watch(showStatsModal, async (newValue) => {
  if (newValue) {
    // 重置選擇
    selectedPeriod.value = 'all'
    selectedMonth.value = ''
    startMonth.value = ''
    endMonth.value = ''
    await updateStats()
  }
})

// 初始載入
onMounted(() => {
  try {
    handleSearch({})
  } catch (error) {
    console.error('初始化載入失敗:', error)
  }
})
</script>
