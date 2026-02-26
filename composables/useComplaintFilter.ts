/**
 * 客訴分析頁面用的全域篩選狀態與操作。
 * 用於 cross-filtering：縣市、產品、日期範圍等，並與 stats API 查詢參數對應。
 */
export interface ComplaintFilterState {
  city: string
  product: string
  period: 'all' | 'single' | 'range'
  monthSingle: string
  monthStart: string
  monthEnd: string
}

const defaultState: ComplaintFilterState = {
  city: '',
  product: '',
  period: 'all',
  monthSingle: '',
  monthStart: '',
  monthEnd: ''
}

export function useComplaintFilter() {
  const state = useState<ComplaintFilterState>('complaint-filter', () => ({ ...defaultState }))

  function setFilter(partial: Partial<ComplaintFilterState>) {
    if (partial.city !== undefined) state.value.city = partial.city
    if (partial.product !== undefined) state.value.product = partial.product
    if (partial.period !== undefined) state.value.period = partial.period
    if (partial.monthSingle !== undefined) state.value.monthSingle = partial.monthSingle
    if (partial.monthStart !== undefined) state.value.monthStart = partial.monthStart
    if (partial.monthEnd !== undefined) state.value.monthEnd = partial.monthEnd
  }

  function clearFilter() {
    state.value = { ...defaultState }
  }

  /** 是否有任一篩選被設定 */
  const hasActiveFilter = computed(() => {
    const s = state.value
    return !!(
      s.city ||
      s.product ||
      (s.period === 'single' && s.monthSingle !== '') ||
      (s.period === 'range' && s.monthStart !== '' && s.monthEnd !== '')
    )
  })

  /** 用於 API 的 query 參數（stats.get 使用的 month, city, product） */
  const apiParams = computed(() => {
    const s = state.value
    const params: Record<string, string> = {}
    if (s.city) params.city = s.city
    if (s.product) params.product = s.product
    if (s.period === 'single' && s.monthSingle !== '') params.month = s.monthSingle
    if (s.period === 'range' && s.monthStart !== '' && s.monthEnd !== '') {
      const start = parseInt(s.monthStart, 10)
      const end = parseInt(s.monthEnd, 10)
      if (!isNaN(start) && !isNaN(end) && start <= end) params.month = `${s.monthStart}~${s.monthEnd}`
    }
    return params
  })

  /** 用於 UI 顯示的「目前篩選」標籤列表 */
  const activeFilterTags = computed(() => {
    const tags: Array<{ key: string; label: string }> = []
    const s = state.value
    if (s.city) tags.push({ key: 'city', label: `縣市: ${s.city}` })
    if (s.product) tags.push({ key: 'product', label: `產品: ${s.product}` })
    if (s.period === 'single' && s.monthSingle !== '') {
      tags.push({ key: 'month', label: `月份: ${s.monthSingle}月` })
    }
    if (s.period === 'range' && s.monthStart !== '' && s.monthEnd !== '') {
      tags.push({ key: 'monthRange', label: `月份: ${s.monthStart}月 ~ ${s.monthEnd}月` })
    }
    return tags
  })

  /** 移除單一篩選（key 對應 activeFilterTags[].key） */
  function removeFilter(key: string) {
    if (key === 'city') state.value.city = ''
    else if (key === 'product') state.value.product = ''
    else if (key === 'month' || key === 'monthRange') {
      state.value.period = 'all'
      state.value.monthSingle = ''
      state.value.monthStart = ''
      state.value.monthEnd = ''
    }
  }

  return {
    filterState: state,
    setFilter,
    clearFilter,
    hasActiveFilter,
    apiParams,
    activeFilterTags,
    removeFilter
  }
}
