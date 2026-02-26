<template>
  <div class="chart-wrapper">
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue'
import { Chart, registerables, type ChartConfiguration } from 'chart.js'

Chart.register(...registerables)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor?: string
    backgroundColor?: string
    fill?: boolean
    tension?: number
    pointBackgroundColor?: string
    pointBorderColor?: string
    pointBorderWidth?: number
  }[]
}

interface Props {
  data: ChartData
  title?: string
  subtitle?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '趨勢圖',
  height: '280px'
})

const chartCanvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const getChartOptions = (): ChartConfiguration<'line'>['options'] => {
  const isDark = import.meta.client && document.documentElement.getAttribute('data-theme') === 'dark'
  const textColor = isDark ? '#cbd5e1' : '#475569'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: [props.title, props.subtitle].filter(Boolean),
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
        ticks: { color: textColor, maxRotation: 45 }
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, callback: (v) => (typeof v === 'number' ? v.toLocaleString() : v) }
      }
    }
  }
}

const createChart = () => {
  if (!chartCanvas.value || !props.data?.labels?.length) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return
  if (chart) chart.destroy()
  chart = new Chart(ctx, {
    type: 'line',
    data: props.data,
    options: getChartOptions()
  })
}

watch(() => [props.data, props.title], () => nextTick(createChart), { deep: true })
onMounted(createChart)
onUnmounted(() => { if (chart) chart.destroy() })
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
