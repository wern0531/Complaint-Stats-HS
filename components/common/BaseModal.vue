<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- 背景遮罩：與 ComplaintModal 一致 -->
        <div
          class="modal-backdrop fixed inset-0 transition-opacity"
          aria-hidden="true"
          @click="close"
        />

        <!-- Modal 內容：圓角、陰影、標題列分隔線，relative z-10 確保在 backdrop 之上 -->
        <div
          class="modal-content relative z-10 inline-block align-bottom rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full"
          :class="contentMaxWidth"
          @click.stop
        >
          <!-- Header：標題 + 關閉按鈕 -->
          <div class="modal-header px-6 py-4 border-b">
            <div class="flex justify-between items-center">
              <h3 id="modal-title" class="text-lg font-medium modal-title">
                {{ title }}
              </h3>
              <button
                type="button"
                class="modal-close focus:outline-none"
                aria-label="關閉"
                @click="close"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 插槽內容 -->
          <div class="p-6">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    contentMaxWidth?: string
  }>(),
  { contentMaxWidth: 'sm:max-w-2xl', title: '' }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-backdrop {
  background: rgba(0, 0, 0, 0.5);
}
.modal-content {
  background-color: var(--color-card);
  color: var(--color-text);
}
.modal-header {
  border-color: var(--color-border);
  background-color: var(--color-card);
}
.modal-title {
  color: var(--color-text);
}
.modal-close {
  color: var(--color-text-muted);
}
.modal-close:hover {
  opacity: 0.8;
}
</style>
