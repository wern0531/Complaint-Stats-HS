<template>
  <div class="chart-wrapper">
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
.chart-container {
  position: relative;
  height: v-bind(height);
  width: 100%;
}
</style>

