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

Chart.register(...registerables)

interface ParetoChartData {
  labels: string[]
  datasets: Array<{
    type: 'bar' | 'line'
    label: string
    data: number[]
    yAxisID: string
    backgroundColor?: string
    borderColor?: string
    borderWidth?: number
    fill?: boolean
    tension?: number
    pointBackgroundColor?: string
    pointBorderColor?: string
    pointBorderWidth?: number
  }>
}

interface Props {
  data: ParetoChartData
  title?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '柏拉圖分析',
  height: '320px'
})

const chartCanvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value || !props.data?.labels?.length) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  if (chart) chart.destroy()

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
            label: (ctx) => {
              if (ctx.dataset.yAxisID === 'yPercent') return `${ctx.dataset.label}: ${ctx.parsed.y}%`
              return `${ctx.dataset.label}: ${ctx.parsed.y} 筆`
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, maxRotation: 45 }
        },
        y: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor, callback: (v) => (typeof v === 'number' ? v.toLocaleString() : v) }
        },
        yPercent: {
          type: 'linear',
          position: 'right',
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false },
          ticks: { color: textColor, callback: (v) => (typeof v === 'number' ? `${v}%` : v) }
        }
      }
    }
  })
}

watch(() => [props.data, props.title], () => nextTick(createChart), { deep: true })
onMounted(createChart)
onUnmounted(() => { if (chart) chart.destroy() })
</script>

<style scoped>
.chart-wrapper { position: relative; width: 100%; }
.chart-container { position: relative; height: v-bind(height); width: 100%; }
</style>
