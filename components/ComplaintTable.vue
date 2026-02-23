<template>
  <div class="table-wrap">
    <div class="px-6 py-4 border-b table-header-wrap">
      <h3 class="text-lg font-medium table-title">客訴記錄列表</h3>
    </div>
    
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-transparent table-spinner"></div>
      <span class="ml-3 table-muted">載入中...</span>
    </div>
    
    <div v-else-if="complaints.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 table-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium table-title">沒有找到客訴記錄</h3>
      <p class="mt-1 text-sm table-muted">請嘗試調整搜尋條件</p>
    </div>
    
    <div v-else class="overflow-x-auto">
      <table class="min-w-full table-divide">
        <thead class="table-thead">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th">客訴編號</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th">產品品項</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th">製造機台</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th">縣市</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th">反映點</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th">原因分析</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th">操作</th>
          </tr>
        </thead>
        <tbody class="table-tbody">
          <tr v-for="complaint in complaints" :key="complaint._id" class="table-row">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium table-td">
              {{ complaint.complaintNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td max-w-[200px] truncate">{{ complaint.productItem }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td">{{ complaint.manufacturingMachine }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td">{{ complaint.city }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td max-w-[200px] truncate">{{ complaint.consumerReactionPoint }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td max-w-[200px] truncate">{{ complaint.causeAnalysis || '未分析' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium table-td">
              <div class="flex space-x-2">
                <button @click="$emit('view-detail', complaint)" class="link-primary">查看詳情</button>
                <button @click="$emit('edit-complaint', complaint)" class="link-secondary">編輯</button>
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

<style scoped>
.table-wrap { background-color: var(--color-card); color: var(--color-text); }
.table-header-wrap { border-color: var(--color-border); }
.table-title { color: var(--color-text); }
.table-muted { color: var(--color-text-muted); }
.table-spinner { border-top-color: var(--color-primary); }
.table-divide { border-color: var(--color-border); }
.table-thead { background-color: var(--color-bg-elevated); }
.table-th { color: var(--color-text-muted); }
.table-tbody { background-color: var(--color-card); }
.table-row { border-bottom: 1px solid var(--color-border); }
.table-row:hover { background-color: var(--color-bg-elevated); }
.table-td { color: var(--color-text); }
.link-primary { color: var(--color-primary); }
.link-primary:hover { text-decoration: underline; }
.link-secondary { color: var(--color-accent); }
.link-secondary:hover { text-decoration: underline; }
</style>

