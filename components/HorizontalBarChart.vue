<template>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'
import { Chart, registerables, type ChartConfiguration } from 'chart.js'

Chart.register(...registerables)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

interface Props {
  data: ChartData
  title?: string
  subtitle?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '分布圖',
  height: '280px'
})

const chartCanvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const getChartOptions = (): ChartConfiguration<'bar'>['options'] => {
  const isDark = import.meta.client && document.documentElement.getAttribute('data-theme') === 'dark'
  const textColor = isDark ? '#cbd5e1' : '#475569'
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  return {
    indexAxis: 'y',
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
        display: false
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed.x} 筆`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: textColor, callback: (v) => (typeof v === 'number' ? v.toLocaleString() : v) }
      },
      y: {
        grid: { display: false },
        ticks: { color: textColor }
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
    type: 'bar',
    data: props.data,
    options: getChartOptions()
  })
}

watch(() => [props.data, props.title], () => nextTick(createChart), { deep: true })
onMounted(createChart)
onUnmounted(() => { if (chart) chart.destroy() })
</script>

<style scoped>
.chart-container {
  position: relative;
  height: v-bind(height);
  width: 100%;
}
</style>
