<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
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
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  chart = new Chart(ctx, {
    type: 'bar',
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
          position: 'top',
          labels: { color: textColor, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} 筆`
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            callback: function (value) {
              return typeof value === 'number' ? value.toLocaleString() : value
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
.chart-container {
  position: relative;
  height: v-bind(height);
  width: 100%;
}
</style>

