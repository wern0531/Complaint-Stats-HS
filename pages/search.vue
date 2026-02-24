<template>
  <div class="p-6 lg:p-8 search-page">
    <div class="max-w-7xl mx-auto">
      <header class="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold page-title">客訴搜尋</h1>
          <p class="text-sm mt-1 page-subtitle">依條件篩選並檢視客訴記錄</p>
          <p v-if="filterSummary" class="text-xs mt-1.5 page-subtitle">目前條件：{{ filterSummary }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button type="button" @click="filterModalOpen = true" class="btn btn-outline">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>
            篩選條件
          </button>
          <button type="button" @click="showUploadModal = true" class="btn btn-secondary">
            <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            Excel 上傳
          </button>
          <button type="button" @click="showModal = true" class="btn btn-primary">
            <svg class="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
            新增客訴
          </button>
          <NuxtLink to="/analysis" class="btn btn-outline">
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            統計圖表
          </NuxtLink>
        </div>
      </header>

      <div class="card overflow-hidden">
            <ComplaintTable
              :complaints="complaints"
              :loading="loading"
              :sort-by="sortBy"
              :sort-order="sortOrder"
              @view-detail="handleViewDetail"
              @edit-complaint="handleEditComplaint"
              @sort="handleSort"
            />
            <!-- 分頁 -->
            <div
              v-if="total > 0"
              class="flex items-center justify-between gap-4 px-6 py-3 border-t text-sm"
              style="border-color: var(--color-border);"
            >
              <span class="page-subtitle">第 {{ currentPage }} / {{ totalPages }} 頁，共 {{ total }} 筆</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style="border-color: var(--color-border); color: var(--color-text);"
                  :disabled="currentPage <= 1"
                  @click="goToPage(currentPage - 1)"
                >
                  上一頁
                </button>
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style="border-color: var(--color-border); color: var(--color-text);"
                  :disabled="currentPage >= totalPages"
                  @click="goToPage(currentPage + 1)"
                >
                  下一頁
                </button>
              </div>
            </div>
          </div>
    </div>

    <FilterModal v-model="filterModalOpen" @search="handleSearch" />

    <ComplaintModal :is-open="showModal" :edit-data="editData" @close="closeModal" @submit="handleSubmit" />

    <div v-if="showUploadModal" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showUploadModal = false" />
        <div class="inline-block align-bottom rounded-xl text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full card">
          <div class="px-6 py-4 border-b card-border flex justify-between items-center">
            <h3 class="text-lg font-medium page-title">Excel 檔案上傳</h3>
            <button type="button" @click="showUploadModal = false" class="p-1 rounded hover:opacity-80 page-subtitle"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6"><ExcelUpload @upload-success="handleUploadSuccess" @upload-error="handleUploadError" /></div>
        </div>
      </div>
    </div>

    <div v-if="showDetailModal" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="showDetailModal = false" />
        <div class="inline-block align-bottom rounded-xl text-left overflow-hidden shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full card">
          <div class="px-6 py-4 border-b card-border flex justify-between items-center">
            <h3 class="text-lg font-medium page-title">客訴詳細資料</h3>
            <button type="button" @click="showDetailModal = false" class="p-1 rounded hover:opacity-80 page-subtitle"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div v-if="detailData" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div><label class="block text-sm font-medium mb-1 page-subtitle">客訴編號</label><p class="text-sm page-title">{{ detailData.complaintNumber }}</p></div>
              <div><label class="block text-sm font-medium mb-1 page-subtitle">產品品項</label><p class="text-sm page-title">{{ detailData.productItem }}</p></div>
              <div><label class="block text-sm font-medium mb-1 page-subtitle">製造機台</label><p class="text-sm page-title">{{ detailData.manufacturingMachine || '-' }}</p></div>
              <div><label class="block text-sm font-medium mb-1 page-subtitle">消費者</label><p class="text-sm page-title">{{ detailData.consumer || '-' }}</p></div>
              <div><label class="block text-sm font-medium mb-1 page-subtitle">縣市</label><p class="text-sm page-title">{{ detailData.city || '-' }}</p></div>
              <div><label class="block text-sm font-medium mb-1 page-subtitle">產品狀態</label><p class="text-sm page-title">{{ detailData.productStatus || '-' }}</p></div>
            </div>
            <div><label class="block text-sm font-medium mb-1 page-subtitle">相關單位回覆</label><p class="text-sm page-title">{{ detailData.departmentReply || '-' }}</p></div>
            <div><label class="block text-sm font-medium mb-1 page-subtitle">原因分析</label><p class="text-sm page-title">{{ detailData.causeAnalysis || '-' }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Complaint } from '~/types/complaint'
import FilterModal from '~/components/FilterModal.vue'
import ComplaintTable from '~/components/ComplaintTable.vue'
import ComplaintModal from '~/components/ComplaintModal.vue'
import ExcelUpload from '~/components/ExcelUpload.vue'

useHead({ title: '客訴搜尋 - 客訴統計搜尋工具' })

const loading = ref(false)
const complaints = ref<Complaint[]>([])
const showModal = ref(false)
const showUploadModal = ref(false)
const showDetailModal = ref(false)
const filterModalOpen = ref(false)
const editData = ref<Complaint | null>(null)
const detailData = ref<Complaint | null>(null)

const sortBy = ref('')
const sortOrder = ref<'asc' | 'desc'>('desc')
const lastFilters = ref<Record<string, string>>({})
const PAGE_LIMIT = 10
const currentPage = ref(1)
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_LIMIT)))

const filterSummary = computed(() => {
  const f = lastFilters.value
  const parts: string[] = []
  if (f.startDate) parts.push(f.startDate)
  if (f.endDate) parts.push(f.endDate)
  if (f.city) parts.push(f.city)
  if (f.product) parts.push(f.product)
  if (f.channel) parts.push(f.channel)
  if (f.machine) parts.push(f.machine)
  if (!parts.length) return ''
  return parts.join('、')
})

const buildParams = () => {
  const p: Record<string, string> = { ...lastFilters.value }
  if (sortBy.value) p.sortBy = sortBy.value
  if (sortOrder.value) p.sortOrder = sortOrder.value
  p.limit = String(PAGE_LIMIT)
  p.page = String(currentPage.value)
  return p
}

async function fetchList() {
  const params = buildParams()
  loading.value = true
  try {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`/api/complaints/list?${queryString}`).then(res => res.json())
    if (response.success) {
      complaints.value = response.data?.complaints || []
      total.value = response.data?.total ?? 0
    } else console.error('搜尋失敗:', response.message)
  } catch (e) {
    console.error('搜尋錯誤:', e)
  } finally {
    loading.value = false
  }
}

const handleSearch = async (filters: Record<string, string>) => {
  lastFilters.value = { ...filters }
  currentPage.value = 1
  await fetchList()
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  fetchList()
}

const handleSort = (payload: { sortBy: string; sortOrder: 'asc' | 'desc' }) => {
  sortBy.value = payload.sortBy
  sortOrder.value = payload.sortOrder
  currentPage.value = 1
  fetchList()
}

const handleSubmit = async (data: Partial<Complaint>) => {
  try {
    const isEdit = !!editData.value
    const url = isEdit ? `/api/complaints/${editData.value?._id}` : '/api/complaints/add'
    const method = isEdit ? 'PUT' : 'POST'
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(res => res.json())
    if (response.success) {
      await handleSearch({})
      closeModal()
    }
  } catch (e) {
    console.error('提交失敗:', e)
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

const handleUploadSuccess = () => {
  lastFilters.value = {}
  currentPage.value = 1
  fetchList()
  showUploadModal.value = false
}

const handleUploadError = (err: string) => {
  console.error('上傳錯誤:', err)
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.search-page { background-color: var(--color-bg); color: var(--color-text); min-height: 100%; }
.page-title { color: var(--color-text); }
.page-subtitle { color: var(--color-text-muted); }
.card { background-color: var(--color-card); border: 1px solid var(--color-border); border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.card-border { border-color: var(--color-border); }
.btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; display: inline-flex; align-items: center; transition: opacity 0.2s; }
.btn-primary { background-color: var(--color-primary); color: white; }
.btn-primary:hover { opacity: 0.9; }
.btn-secondary { background-color: var(--color-secondary); color: white; }
.btn-secondary:hover { opacity: 0.9; }
.btn-outline { border: 1px solid var(--color-border); color: var(--color-text); }
.btn-outline:hover { background-color: var(--color-bg-elevated); }
</style>
