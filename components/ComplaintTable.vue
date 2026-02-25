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
            <th
              v-for="col in sortableColumns"
              :key="col.field"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider table-th sortable-th"
              :class="{ 'sortable-th--active': sortBy === col.field }"
              @click="col.sortable ? handleSortClick(col.field) : null"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="col.sortable" class="sort-icon">
                  <span v-if="sortBy !== col.field" class="sort-icon-both" aria-hidden="true">⇅</span>
                  <span v-else class="sort-icon-direction" :class="sortOrder === 'asc' ? 'sort-asc' : 'sort-desc'" aria-hidden="true">
                    {{ sortOrder === 'asc' ? '↑' : '↓' }}
                  </span>
                </span>
              </span>
            </th>
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
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td">{{ formatReactionTime(complaint.reactionTime) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td max-w-[200px] truncate">{{ complaint.consumerReactionPoint }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm table-td max-w-[200px] truncate">{{ complaint.causeAnalysis || '未分析' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium table-td">
              <div class="flex items-center gap-2">
                <button type="button" @click="$emit('view-detail', complaint)" class="link-primary">查看詳情</button>
                <button type="button" class="table-action-btn" aria-label="編輯" @click="$emit('edit', complaint)">✏️</button>
                <button type="button" class="table-action-btn table-action-btn--danger" aria-label="刪除" @click="$emit('delete', complaint._id ?? complaint.id ?? '')">🗑️</button>
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

type SortOrder = 'asc' | 'desc'

interface Props {
  complaints: Complaint[]
  loading: boolean
  sortBy?: string
  sortOrder?: SortOrder
}

const props = withDefaults(defineProps<Props>(), {
  sortBy: '',
  sortOrder: 'desc'
})

const emit = defineEmits<{
  'view-detail': [complaint: Complaint]
  edit: [complaint: Complaint]
  delete: [id: string]
  sort: [payload: { sortBy: string; sortOrder: SortOrder }]
}>()

const sortableColumns = [
  { field: 'complaintNumber', label: '客訴編號', sortable: true },
  { field: 'productItem', label: '產品品項', sortable: true },
  { field: 'manufacturingMachine', label: '製造機台', sortable: true },
  { field: 'city', label: '縣市', sortable: true },
  { field: 'reactionTime', label: '日期', sortable: true }
]

function handleSortClick(field: string) {
  const nextOrder: SortOrder =
    props.sortBy === field && props.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('sort', { sortBy: field, sortOrder: nextOrder })
}

function formatReactionTime(value?: string): string {
  if (!value) return '—'
  if (value.length === 8) {
    return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)}`
  }
  return value
}
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
.sortable-th { cursor: pointer; user-select: none; }
.sortable-th:hover { color: var(--color-text); }
.sortable-th--active { color: var(--color-primary); }
.sort-icon { opacity: 0.7; font-size: 0.75rem; }
.sortable-th--active .sort-icon { opacity: 1; }
.sort-icon-both { font-size: 0.7rem; }
.sort-icon-direction { display: inline-block; }
.table-tbody { background-color: var(--color-card); }
.table-row { border-bottom: 1px solid var(--color-border); }
.table-row:hover { background-color: var(--color-bg-elevated); }
.table-td { color: var(--color-text); }
.link-primary { color: var(--color-primary); }
.link-primary:hover { text-decoration: underline; }
.link-secondary { color: var(--color-accent); }
.link-secondary:hover { text-decoration: underline; }
.table-action-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: opacity 0.2s;
}
.table-action-btn:hover { opacity: 0.85; }
.table-action-btn--danger:hover { filter: brightness(0.95); }
</style>

