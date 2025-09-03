<template>
  <!-- Modal 遮罩 -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal 內容 -->
      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
        <!-- Modal 標題 -->
        <div class="bg-white px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900" id="modal-title">
              客訴詳細資料
            </h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <span class="sr-only">關閉</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal 內容 -->
        <div class="bg-white px-6 py-4 max-h-96 overflow-y-auto">
          <div class="space-y-6">
            <!-- 基本資訊 -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">基本資訊</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">客訴編號</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.complaintNumber }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">產品品項</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.productItem }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">製造機台</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.manufacturingMachine }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">有效日期</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.expiryDate || '未提供' }}</p>
                </div>
              </div>
            </div>

            <!-- 客訴內容 -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">客訴內容</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">消費者反映點</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.consumerReactionPoint }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">反映時間</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.reactionTime || '未提供' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">產品狀態</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.productStatus }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">存放時間</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.storageMonths || '未提供' }}</p>
                </div>
              </div>
            </div>

            <!-- 分析與回覆 -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">分析與回覆</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">相關單位回覆</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[60px]">{{ complaint.departmentReply || '未回覆' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">原因分析</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md min-h-[60px]">{{ complaint.causeAnalysis || '未分析' }}</p>
                </div>
              </div>
            </div>

            <!-- 銷售資訊 -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">銷售資訊</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">經銷商</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.distributor || '未提供' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">購買通路</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.purchaseChannel || '未提供' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">消費者</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.consumer }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">區域地址</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.regionAddress || '未提供' }}</p>
                </div>
              </div>
            </div>

            <!-- 統計資訊 -->
            <div>
              <h4 class="text-md font-medium text-gray-900 mb-3">統計資訊</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">客訴件數</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.complaintQuantity || 1 }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">百分比</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.complaintPercentage ? (complaint.complaintPercentage * 100).toFixed(2) + '%' : '未提供' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">累計百分比</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.cumulativePercentage ? (complaint.cumulativePercentage * 100).toFixed(2) + '%' : '未提供' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">軌數</label>
                  <p class="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{{ complaint.trackNumber || '未提供' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal 底部 -->
        <div class="bg-gray-50 px-6 py-3 flex justify-end">
          <button
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Complaint } from '~/types/complaint'

// Props
const props = defineProps<{
  isOpen: boolean
  complaint: Complaint
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// 關閉Modal
const closeModal = () => {
  emit('close')
}
</script>
