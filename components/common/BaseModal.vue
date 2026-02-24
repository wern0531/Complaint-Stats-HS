<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <!-- 遮罩 -->
        <div
          class="absolute inset-0 bg-black/50"
          aria-hidden="true"
          @click="close"
        />
        <!-- 內容容器 -->
        <div
          class="relative w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl shadow-xl flex flex-col"
          :class="contentMaxWidth"
          style="background-color: var(--color-card, #fff);"
          @click.stop
        >
          <!-- 標題列 -->
          <div
            class="flex items-center justify-between shrink-0 px-5 py-4 border-b"
            style="border-color: var(--color-border, #e5e7eb);"
          >
            <h2 class="text-lg font-semibold" style="color: var(--color-text);">
              {{ title }}
            </h2>
            <button
              type="button"
              class="p-2 rounded-lg transition-colors hover:opacity-80"
              style="color: var(--color-text-muted);"
              aria-label="關閉"
              @click="close"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- 插槽內容 -->
          <div class="flex-1 min-h-0 p-5">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
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
  { contentMaxWidth: 'max-w-2xl' }
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
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
