<template>
  <BaseModal
    :model-value="modelValue"
    :title="modalTitle"
    content-max-width="max-w-4xl"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div v-if="modelValue && chartData" class="chart-zoom-content">
      <BarChart
        v-if="chartType === 'bar'"
        :data="chartData"
        :title="chartTitle"
        height="60vh"
      />
      <LineChart
        v-else-if="chartType === 'line'"
        :data="chartData"
        :title="chartTitle"
        :subtitle="subtitle"
        height="60vh"
      />
      <PieChart
        v-else-if="chartType === 'pie'"
        :data="chartData"
        :title="chartTitle"
        height="60vh"
      />
      <HorizontalBarChart
        v-else-if="chartType === 'horizontalBar'"
        :data="chartData"
        :title="chartTitle"
        :subtitle="subtitle"
        height="60vh"
      />
      <p v-else class="text-sm py-8 text-center" style="color: var(--color-text-muted);">
        不支援的圖表類型
      </p>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import BarChart from '~/components/BarChart.vue'
import LineChart from '~/components/LineChart.vue'
import PieChart from '~/components/PieChart.vue'
import HorizontalBarChart from '~/components/HorizontalBarChart.vue'

type ChartType = 'bar' | 'line' | 'pie' | 'horizontalBar'

interface ChartDataGeneric {
  labels: string[]
  datasets: unknown[]
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    chartType?: ChartType
    data?: ChartDataGeneric | null
    title?: string
    subtitle?: string
  }>(),
  {
    chartType: 'bar',
    data: null,
    title: '',
    subtitle: ''
  }
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const modalTitle = computed(() => props.title || '圖表放大')
const chartTitle = computed(() => props.title || '')
const chartData = computed(() => props.data ?? null)
</script>

<style scoped>
.chart-zoom-content {
  min-height: 400px;
}
</style>
