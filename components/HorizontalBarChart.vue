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

defineEmits<{ enlarge: [] }>()

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
.chart-wrapper { position: relative; width: 100%; }
.enlarge-btn {
  position: absolute; top: 0.5rem; right: 0.5rem; z-index: 1;
  display: flex; align-items: center; justify-content: center; padding: 0.375rem;
  border-radius: 0.5rem; border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-card, #fff); color: var(--color-text-muted, #6b7280);
  cursor: pointer; transition: opacity 0.2s, color 0.2s;
}
.enlarge-btn:hover { opacity: 0.9; color: var(--color-text, #374151); }
.chart-container { position: relative; height: v-bind(height); width: 100%; }
</style>
