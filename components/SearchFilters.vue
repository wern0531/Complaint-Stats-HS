<template>
  <div class="search-filters-theme rounded-lg p-4">
    <h3 class="text-base font-medium mb-3 filter-title">搜尋篩選</h3>
    <form @submit.prevent="handleSearch" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
      <div>
        <label class="block text-xs font-medium mb-1 filter-label">縣市</label>
        <select v-model="filters.city" @change="applyFilters" class="w-full px-2 py-1.5 rounded-lg filter-input text-sm">
          <option value="">全部縣市</option>
          <option v-for="city in cityOptions" :key="city" :value="city">{{ city }}</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium mb-1 filter-label">產品品項</label>
        <input v-model="filters.product" @input="applyFilters" type="text" placeholder="關鍵字" class="w-full px-2 py-1.5 rounded-lg filter-input text-sm" />
      </div>
      <div>
        <label class="block text-xs font-medium mb-1 filter-label">製造機台</label>
        <select v-model="filters.machine" @change="applyFilters" class="w-full px-2 py-1.5 rounded-lg filter-input text-sm">
          <option value="">全部機台</option>
          <option value="P#15">P#15</option>
          <option value="P#13">P#13</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium mb-1 filter-label">購買通路</label>
        <select v-model="filters.channel" @change="applyFilters" class="w-full px-2 py-1.5 rounded-lg filter-input text-sm">
          <option value="">全部通路</option>
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
      <div>
        <label class="block text-xs font-medium mb-1 filter-label">距離有效期限</label>
        <select v-model="filters.status" @change="applyFilters" class="w-full px-2 py-1.5 rounded-lg filter-input text-sm">
          <option value="">全部狀態</option>
          <option v-for="month in 13" :key="month-1" :value="month-1">{{ month-1 }}月</option>
        </select>
      </div>
      <div>
        <label class="block text-xs font-medium mb-1 filter-label">開始日期</label>
        <input v-model="filters.startDate" @change="applyFilters" type="date" class="w-full px-2 py-1.5 rounded-lg filter-input text-sm" />
      </div>
      <div>
        <label class="block text-xs font-medium mb-1 filter-label">結束日期</label>
        <input v-model="filters.endDate" @change="applyFilters" type="date" class="w-full px-2 py-1.5 rounded-lg filter-input text-sm" />
      </div>
      <div class="col-span-2 sm:col-span-3 lg:col-span-4 flex gap-2 pt-2">
        <button type="button" @click="clearFilters" class="px-4 py-2 text-sm font-medium rounded-lg btn-clear">清除篩選</button>
        <button type="submit" class="px-4 py-2 text-sm font-medium rounded-lg btn-submit">搜尋</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface SearchFilters {
  city?: string
  product?: string
  machine?: string
  channel?: string
  status?: string
  startDate?: string
  endDate?: string
}

const emit = defineEmits<{
  search: [filters: SearchFilters]
}>()

// 篩選條件
const filters = ref<SearchFilters>({
  city: '',
  product: '',
  machine: '',
  channel: '',
  status: '',
  startDate: '',
  endDate: ''
})

// 縣市選項
const cityOptions = ref([
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市',
  '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣',
  '屏東縣', '台東縣', '花蓮縣', '宜蘭縣',
  '澎湖縣', '金門縣', '連江縣'
])

// 應用篩選
const applyFilters = () => {
  emit('search', { ...filters.value })
}

// 清除篩選
const clearFilters = () => {
  filters.value = {
    city: '',
    product: '',
    machine: '',
    channel: '',
    status: '',
    startDate: '',
    endDate: ''
  }
  applyFilters()
}

// 處理搜尋
const handleSearch = () => {
  applyFilters()
}

onMounted(() => {})
</script>

<style scoped>
.search-filters-theme { background-color: var(--color-card); color: var(--color-text); }
.filter-title { color: var(--color-text); }
.filter-label { color: var(--color-text-muted); }
.filter-input {
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-input-border);
  color: var(--color-text);
  outline: none;
}
.filter-input:focus { box-shadow: 0 0 0 2px var(--color-primary); }
.btn-clear {
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
.btn-clear:hover { opacity: 0.9; }
.btn-submit {
  background-color: var(--color-primary);
  color: white;
  border: none;
}
.btn-submit:hover { opacity: 0.9; }
</style>

