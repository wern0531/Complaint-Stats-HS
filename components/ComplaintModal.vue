<template>
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
        class="modal-backdrop fixed inset-0 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal 內容 -->
      <div class="modal-content inline-block align-bottom rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
        <div class="modal-header px-6 py-4 border-b">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-medium modal-title" id="modal-title">
              {{ editData ? '編輯客訴' : '新增客訴' }}
            </h3>
            <button
              @click="$emit('close')"
              type="button"
              class="modal-close focus:outline-none"
            >
              <span class="sr-only">關閉</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 客訴編號 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">客訴編號 *</label>
              <input
                v-model="form.complaintNumber"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入客訴編號"
              />
            </div>

            <!-- 產品品項 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">產品品項 *</label>
              <input
                v-model="form.productItem"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入產品品項"
              />
            </div>

            <!-- 製造機台 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">製造機台</label>
              <select
                v-model="form.manufacturingMachine"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇機台</option>
                <option value="P#15">P#15</option>
                <option value="P#13">P#13</option>
              </select>
            </div>

            <!-- 縣市 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">縣市</label>
              <input
                v-model="form.city"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入縣市"
              />
            </div>

            <!-- 消費者反映點 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">消費者反映點</label>
              <input
                v-model="form.consumerReactionPoint"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入反映點"
              />
            </div>

            <!-- 原因分析 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">原因分析</label>
              <input
                v-model="form.causeAnalysis"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="請輸入原因分析"
              />
            </div>

            <!-- 購買通路 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">購買通路</label>
              <select
                v-model="form.purchaseChannel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇通路</option>
                <option value="7-11">7-11</option>
                <option value="萊爾富">萊爾富</option>
                <option value="全家">全家</option>
                <option value="OK">OK</option>
                <option value="家樂福">家樂福</option>
                <option value="全聯">全聯</option>
                <option value="大潤發">大潤發</option>
                <option value="網購平台">網購平台</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <!-- 產品狀態 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">產品狀態</label>
              <select
                v-model="form.productStatus"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選擇狀態</option>
                <option v-for="month in 13" :key="month-1" :value="`距離有效期限${month-1}個月`">
                  {{ month-1 }}個月
                </option>
              </select>
            </div>
          </div>

          <!-- 按鈕區域 -->
          <div class="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? '提交中...' : (editData ? '更新' : '新增') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Complaint } from '~/types/complaint'

interface Props {
  isOpen: boolean
  editData: Complaint | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [data: Partial<Complaint>]
}>()

const submitting = ref(false)

// 表單數據
const form = ref({
  complaintNumber: '',
  productItem: '',
  manufacturingMachine: '',
  city: '',
  consumerReactionPoint: '',
  causeAnalysis: '',
  purchaseChannel: '',
  productStatus: ''
})

// 監聽編輯數據變化
watch(() => props.editData, (newData) => {
  if (newData) {
    // 編輯模式，填充表單
    form.value = {
      complaintNumber: newData.complaintNumber || '',
      productItem: newData.productItem || '',
      manufacturingMachine: newData.manufacturingMachine || '',
      city: newData.city || '',
      consumerReactionPoint: newData.consumerReactionPoint || '',
      causeAnalysis: newData.causeAnalysis || '',
      purchaseChannel: newData.purchaseChannel || '',
      productStatus: newData.productStatus || ''
    }
  } else {
    // 新增模式，清空表單
    form.value = {
      complaintNumber: '',
      productItem: '',
      manufacturingMachine: '',
      city: '',
      consumerReactionPoint: '',
      causeAnalysis: '',
      purchaseChannel: '',
      productStatus: ''
    }
  }
}, { immediate: true })

// 提交表單
const handleSubmit = async () => {
  submitting.value = true
  try {
    await emit('submit', { ...form.value })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-backdrop { background: rgba(0, 0, 0, 0.5); }
.modal-content { background-color: var(--color-card); color: var(--color-text); }
.modal-header { border-color: var(--color-border); background-color: var(--color-card); }
.modal-title { color: var(--color-text); }
.modal-close { color: var(--color-text-muted); }
.modal-close:hover { opacity: 0.8; }
.modal-content :deep(label) { color: var(--color-text-muted); }
.modal-content :deep(input),
.modal-content :deep(select),
.modal-content :deep(textarea) {
  background-color: var(--color-input-bg);
  border-color: var(--color-input-border);
  color: var(--color-text);
}
</style>
