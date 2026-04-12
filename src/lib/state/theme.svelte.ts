type Theme = 'light' | 'dark' | 'auto'

export const STORAGE_KEY = 'umami-overview-settings'

class ThemeState {
  theme = $state<Theme>('auto')

  get resolvedTheme(): Theme {
    if (this.theme === 'auto') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return this.theme
  }

  setTheme(newTheme: Theme) {
    this.theme = newTheme
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      const existing = stored ? JSON.parse(stored) : {}
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, theme: newTheme }))
    }

    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      if (newTheme === 'dark') {
        root.classList.add('dark')
      } else if (newTheme === 'auto') {
        root.classList.add(this.resolvedTheme)
      }
    }
  }

  init() {
    if (typeof localStorage === 'undefined') return

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { theme?: Theme }
        if (parsed.theme && ['light', 'dark', 'auto'].includes(parsed.theme)) {
          this.setTheme(parsed.theme)
        } else {
          this.setTheme('auto')
        }
      } catch {
        this.setTheme('auto')
      }
    } else {
      this.setTheme('auto')
    }

    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme === 'auto') {
          this.setTheme('auto')
        }
      })
    }
  }
}

export const themeState = new ThemeState()
