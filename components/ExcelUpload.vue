<template>
  <div class="space-y-4">
    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <div class="mt-4">
        <label for="file-upload" class="cursor-pointer">
          <span class="mt-2 block text-sm font-medium text-gray-900">
            選擇 Excel 檔案
          </span>
          <span class="mt-1 block text-xs text-gray-500">
            支援 .xlsx 和 .xls 格式
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

    <div v-if="selectedFile" class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</span>
        </div>
        <button
          @click="removeFile"
          class="text-red-600 hover:text-red-800 text-sm"
        >
          移除
        </button>
      </div>
      <p class="mt-1 text-xs text-gray-500">
        檔案大小: {{ formatFileSize(selectedFile.size) }}
      </p>
    </div>

    <div v-if="uploading" class="text-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-sm text-gray-600">上傳中...</p>
    </div>

    <div class="flex justify-end space-x-3">
      <button
        @click="$emit('upload-error', '取消上傳')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        取消
      </button>
      <button
        @click="uploadFile"
        :disabled="!selectedFile || uploading"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        上傳
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploading = ref(false)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    // 這裡應該實現實際的檔案上傳邏輯
    // 目前只是模擬上傳
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模擬成功上傳
    emit('upload-success', {
      message: '檔案上傳成功',
      filename: selectedFile.value.name
    })
  } catch (error) {
    emit('upload-error', '檔案上傳失敗')
  } finally {
    uploading.value = false
  }
}

const emit = defineEmits<{
  'upload-success': [data: any]
  'upload-error': [error: string]
}>()
</script>
