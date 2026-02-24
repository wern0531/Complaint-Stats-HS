<template>
  <div class="chart-wrapper">
    <button
      type="button"
      class="enlarge-btn"
      aria-label="放大圖表"
      @click="$emit('enlarge')"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 14.25v4.5m0-4.5h4.5m-4.5 0L9 15M14.25 3.75h4.5m0 4.5v4.5m0-4.5L15 9m5.25 5.25h-4.5m4.5 0v4.5m0-4.5L15 15" />
      </svg>
    </button>
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'

// 註冊 Chart.js 組件
Chart.register(...registerables)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

interface Props {
  data: ChartData
  title?: string
  height?: string
}

defineEmits<{ enlarge: [] }>()

const props = withDefaults(defineProps<Props>(), {
  title: '統計圖表',
  height: '400px'
})

const chartCanvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

// 創建圖表
const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  // 銷毀舊圖表
  if (chart) {
    chart.destroy()
  }

  const isDark = import.meta.client && document.documentElement.getAttribute('data-theme') === 'dark'
  const textColor = isDark ? '#cbd5e1' : '#475569'
  chart = new Chart(ctx, {
    type: 'pie',
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: !!props.title,
          text: props.title,
          font: { size: 16, weight: 'bold' },
          color: textColor
        },
        legend: {
          display: true,
          position: 'right',
          labels: { padding: 20, usePointStyle: true, color: textColor }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || ''
              const value = context.parsed
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
              const percentage = total ? ((value / total) * 100).toFixed(1) : '0'
              return `${label}: ${value} 筆 (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// 監聽數據變化
watch(() => props.data, () => {
  nextTick(() => {
    createChart()
  })
}, { deep: true })

// 組件掛載時創建圖表
onMounted(() => {
  createChart()
})

// 組件卸載時清理
onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
}
.enlarge-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border-radius: 0.5rem;
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-card, #fff);
  color: var(--color-text-muted, #6b7280);
  cursor: pointer;
  transition: opacity 0.2s, color 0.2s;
}
.enlarge-btn:hover {
  opacity: 0.9;
  color: var(--color-text, #374151);
}
.chart-container {
  position: relative;
  height: v-bind(height);
  width: 100%;
}
</style>

