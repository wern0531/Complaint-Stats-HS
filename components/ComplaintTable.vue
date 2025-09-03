<template>
  <div class="bg-white rounded-lg shadow-md">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">客訴記錄列表</h3>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">載入中...</span>
    </div>
    
    <div v-else-if="complaints.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">沒有找到客訴記錄</h3>
      <p class="mt-1 text-sm text-gray-500">請嘗試調整搜尋條件</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客訴編號</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">產品品項</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">製造機台</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">縣市</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">反映點</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">原因分析</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="complaint in complaints" :key="complaint._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ complaint.complaintNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate">
              {{ complaint.productItem }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ complaint.manufacturingMachine }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ complaint.city }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate">
              {{ complaint.consumerReactionPoint }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-[200px] truncate">
              {{ complaint.causeAnalysis || '未分析' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button 
                  @click="$emit('view-detail', complaint)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  查看詳情
                </button>
                <button 
                  @click="$emit('edit-complaint', complaint)"
                  class="text-green-600 hover:text-green-900"
                >
                  編輯
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Complaint } from '~/types/complaint'

interface Props {
  complaints: Complaint[]
  loading: boolean
}

defineProps<Props>()

defineEmits<{
  'view-detail': [complaint: Complaint]
  'edit-complaint': [complaint: Complaint]
}>()
</script>

