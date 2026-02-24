<template>
  <BaseModal
    :model-value="modelValue"
    title="篩選條件"
    content-max-width="sm:max-w-5xl"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <SearchFilters
      @search="onSearch"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/common/BaseModal.vue'
import SearchFilters from '~/components/SearchFilters.vue'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  search: [filters: Record<string, unknown>]
}>()

function onSearch(filters: Record<string, unknown>) {
  emit('search', filters)
  emit('update:modelValue', false)
}
</script>
