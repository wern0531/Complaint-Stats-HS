<template>
  <BaseModal
    :model-value="isOpen"
    :title="editData ? '編輯客訴' : '新增客訴'"
    content-max-width="sm:max-w-2xl"
    @update:model-value="$emit('close')"
  >
    <form @submit.prevent="handleSubmit">
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
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseModal from '~/components/common/BaseModal.vue'
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
:deep(label) { color: var(--color-text-muted); }
:deep(input),
:deep(select),
:deep(textarea) {
  background-color: var(--color-input-bg);
  border-color: var(--color-input-border);
  color: var(--color-text);
}
</style>
