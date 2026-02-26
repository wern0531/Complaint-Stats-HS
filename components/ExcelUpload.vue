<template>
  <div class="space-y-4">
    <div class="border-2 border-dashed rounded-lg p-6 text-center upload-zone">
      <svg class="mx-auto h-12 w-12 upload-icon" stroke="currentColor" fill="none" viewBox="0 0 48 48">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="mt-4">
        <label for="file-upload" class="cursor-pointer">
          <span class="mt-2 block text-sm font-medium upload-label">
            選擇 Excel 檔案
          </span>
          <span class="mt-1 block text-xs upload-hint">
            支援 .xlsx、.xls（品二課客訴統整.xlsx 等）
          </span>
        </label>
        <input
          id="file-upload"
          ref="fileInput"
          type="file"
          accept=".xlsx,.xls"
          class="sr-only"
          @change="handleFileChange"
        />
      </div>
    </div>

    <div v-if="selectedFile" class="rounded-lg p-4 file-preview">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium">{{ selectedFile.name }}</span>
        </div>
        <button type="button" class="text-red-600 hover:text-red-800 text-sm" @click="removeFile">
          移除
        </button>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        檔案大小: {{ formatFileSize(selectedFile.size) }}
      </p>
    </div>

    <div v-if="uploading" class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
      <p class="mt-2 text-sm">上傳並匯入中...</p>
    </div>

    <div v-if="result" class="rounded-lg p-4 result-box">
      <p class="font-medium result-title">{{ result.success ? '匯入完成' : '匯入失敗' }}</p>
      <p class="text-sm mt-1">{{ result.message }}</p>
      <div class="mt-2 flex gap-4 text-sm">
        <span>新增：<strong>{{ result.added ?? 0 }}</strong> 筆</span>
        <span>略過（已存在）：<strong>{{ result.skipped ?? 0 }}</strong> 筆</span>
      </div>
      <ul v-if="result.errors?.length" class="mt-2 text-xs text-red-600 list-disc list-inside">
        <li v-for="(err, i) in result.errors" :key="i">{{ err }}</li>
      </ul>
    </div>

    <div class="flex justify-end space-x-3">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium border rounded-md btn-cancel"
        @click="closeOrClear"
      >
        {{ result ? '關閉' : '取消' }}
      </button>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!selectedFile || uploading"
        @click="uploadFile"
      >
        上傳並匯入
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ImportResult {
  success: boolean
  message: string
  added?: number
  skipped?: number
  errors?: string[]
}

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const result = ref<ImportResult | null>(null)

const emit = defineEmits<{
  'upload-success': [data: { message: string; added?: number; skipped?: number }]
  'upload-error': [error: string]
}>()

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    selectedFile.value = target.files[0]
    result.value = null
  }
}

function removeFile() {
  selectedFile.value = null
  result.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function closeOrClear() {
  if (result.value) {
    emit('upload-success', {
      message: result.value.message,
      added: result.value.added,
      skipped: result.value.skipped
    })
  }
  removeFile()
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function uploadFile() {
  if (!selectedFile.value) return

  uploading.value = true
  result.value = null
  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const res = await $fetch<ImportResult>('/api/complaints/import', {
      method: 'POST',
      body: formData
    })

    result.value = res
    if (!res.success) {
      emit('upload-error', res.message || '匯入失敗')
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    result.value = {
      success: false,
      message: msg,
      added: 0,
      skipped: 0,
      errors: [msg]
    }
    emit('upload-error', msg)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.upload-zone { border-color: var(--color-border); }
.upload-icon { color: var(--color-text-muted); }
.upload-label { color: var(--color-text); }
.upload-hint { color: var(--color-text-muted); }
.file-preview { background-color: var(--color-bg-elevated); }
.result-box { background-color: var(--color-bg-elevated); border: 1px solid var(--color-border); }
.result-title { color: var(--color-text); }
.btn-cancel { border-color: var(--color-border); color: var(--color-text); }
</style>
