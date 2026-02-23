const THEME_KEY = 'complaint-stats-theme'
type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>('light')

  const setTheme = (value: Theme) => {
    theme.value = value
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', value)
      try {
        localStorage.setItem(THEME_KEY, value)
      } catch (_) {}
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const initTheme = () => {
    if (import.meta.client) {
      try {
        const stored = localStorage.getItem(THEME_KEY) as Theme | null
        const preferred: Theme = stored === 'dark' || stored === 'light' ? stored : 'light'
        setTheme(preferred)
      } catch (_) {
        setTheme('light')
      }
    }
  }

  if (import.meta.client) {
    initTheme()
  }
  onMounted(() => {
    initTheme()
  })

  return { theme, setTheme, toggleTheme, initTheme }
}
