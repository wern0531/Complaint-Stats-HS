// 圖表顏色配置
const CHART_COLORS = [
  '#3B82F6', // 藍色
  '#EF4444', // 紅色
  '#10B981', // 綠色
  '#F59E0B', // 黃色
  '#8B5CF6', // 紫色
  '#F97316', // 橙色
  '#06B6D4', // 青色
  '#84CC16', // 青綠色
  '#EC4899', // 粉紅色
  '#6366F1', // 靛藍色
  '#14B8A6', // 藍綠色
  '#F43F5E'  // 玫瑰色
]

// 長條圖數據轉換
export const transformToBarChartData = (
  stats: Array<{ [key: string]: any; count: number }>,
  labelKey: string,
  title: string = '統計圖表'
) => {
  const labels = stats.map(item => item[labelKey] || '未知')
  const data = stats.map(item => item.count)
  
  // 生成顏色
  const backgroundColor = data.map((_, index) => 
    CHART_COLORS[index % CHART_COLORS.length]
  )
  const borderColor = backgroundColor.map(color => 
    color + '80' // 添加透明度
  )

  return {
    labels,
    datasets: [{
      label: title,
      data,
      backgroundColor: backgroundColor as string[],
      borderColor: borderColor as string[],
      borderWidth: 1
    }]
  }
}

// 圓餅圖數據轉換
export const transformToPieChartData = (
  stats: Array<{ [key: string]: any; count: number }>,
  labelKey: string,
  title: string = '統計圖表'
) => {
  const labels = stats.map(item => item[labelKey] || '未知')
  const data = stats.map(item => item.count)
  
  // 生成顏色
  const backgroundColor = data.map((_, index) => 
    CHART_COLORS[index % CHART_COLORS.length]
  )
  const borderColor = backgroundColor.map(color => 
    color + '80' // 添加透明度
  )

  return {
    labels,
    datasets: [{
      label: title,
      data,
      backgroundColor: backgroundColor as string[],
      borderColor: borderColor as string[],
      borderWidth: 1
    }]
  }
}

// 縣市統計轉換為長條圖
export const transformCityStatsToBarChart = (cityStats: Array<{ city: string; count: number }>) => {
  return transformToBarChartData(cityStats, 'city', '縣市客訴統計')
}

// 產品統計轉換為長條圖
export const transformProductStatsToBarChart = (productStats: Array<{ product: string; count: number }>) => {
  return transformToBarChartData(productStats, 'product', '產品客訴統計')
}

// 機台統計轉換為長條圖
export const transformMachineStatsToBarChart = (machineStats: Array<{ machine: string; count: number }>) => {
  return transformToBarChartData(machineStats, 'machine', '製造機台客訴統計')
}

// 通路統計轉換為圓餅圖（只取前5名）
export const transformChannelStatsToPieChart = (channelStats: Array<{ channel: string; count: number }>) => {
  return transformToPieChartData(channelStats.slice(0, 5), 'channel', '購買通路分布')
}

// 狀態統計轉換為圓餅圖（只取前5名）
export const transformStatusStatsToPieChart = (statusStats: Array<{ status: string; count: number }>) => {
  return transformToPieChartData(statusStats.slice(0, 5), 'status', '產品狀態分布')
}

// 異常原因分析統計轉換為圓餅圖（只取前5名）
export const transformCauseStatsToPieChart = (causeStats: Array<{ cause: string; count: number }>) => {
  return transformToPieChartData(causeStats.slice(0, 5), 'cause', '異常原因分析分布')
}

// 月份統計轉換為長條圖
export const transformMonthlyStatsToBarChart = (monthlyStats: Array<{ month: string; count: number }>) => {
  return transformToBarChartData(monthlyStats, 'month', '月份客訴統計')
}

// 月份統計轉換為折線圖（近 12 個月趨勢）
export const transformMonthlyStatsToLineChart = (monthlyStats: Array<{ month: string; count: number }>) => {
  const labels = monthlyStats.map(item => {
    const [y, m] = item.month.split('-')
    return `${parseInt(m)}月`
  })
  const data = monthlyStats.map(item => item.count)
  return {
    labels,
    datasets: [{
      label: '客訴數量',
      data,
      borderColor: CHART_COLORS[0],
      backgroundColor: CHART_COLORS[0] + '20',
      fill: true,
      tension: 0.3,
      pointBackgroundColor: CHART_COLORS[0],
      pointBorderColor: '#fff',
      pointBorderWidth: 1
    }]
  }
}

// 類別分布轉為橫向長條圖（label 在左、數值在右）
export const transformToHorizontalBarChart = (
  stats: Array<{ [key: string]: any; count: number }>,
  labelKey: string,
  title: string = '統計'
) => {
  const labels = stats.map(item => item[labelKey] || '未知')
  const data = stats.map(item => item.count)
  const backgroundColor = data.map((_, i) => CHART_COLORS[i % CHART_COLORS.length])
  const borderColor = backgroundColor.map(c => c + '80')
  return {
    labels,
    datasets: [{
      label: title,
      data,
      backgroundColor,
      borderColor,
      borderWidth: 1
    }]
  }
}

export const transformChannelStatsToHorizontalBar = (channelStats: Array<{ channel: string; count: number }>) => {
  return transformToHorizontalBarChart(channelStats.slice(0, 8), 'channel', '購買通路')
}

export const transformStatusStatsToHorizontalBar = (statusStats: Array<{ status: string; count: number }>) => {
  return transformToHorizontalBarChart(statusStats.slice(0, 8), 'status', '產品狀態')
}
