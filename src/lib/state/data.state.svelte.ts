import { SvelteMap } from 'svelte/reactivity'
import type { UmamiSettings, Website, WebsiteStats } from '../data-access/types.js'
import { UmamiService } from '../data-access/umami.services.js'

export interface AllSettings {
  theme?: 'light' | 'dark' | 'auto'
  umami?: Partial<UmamiSettings>
  sortBy?: 'name' | 'visitors' | 'active'
  showAllWebsites?: boolean
}

const STORAGE_KEY = 'umami-overview-settings'

let settings: UmamiSettings | null = $state(null)
let service: UmamiService | null = $state(null)
let websites: Website[] = $state([])
let stats: SvelteMap<string, WebsiteStats> = new SvelteMap()
let active: SvelteMap<string, number> = new SvelteMap()
let isLoading: boolean = $state(false)
let error: string | null = $state(null)
let showAllWebsitesState: boolean = $state(false)

function resetState() {
  settings = null
  service = null
  websites = []
  stats = new SvelteMap()
  active = new SvelteMap()
  isLoading = false
  error = null
}

export const dataStore = {
  get settings() {
    return settings
  },
  get service() {
    return service
  },
  get websites() {
    return websites
  },
  get stats() {
    return stats
  },
  get active() {
    return active
  },
  get isLoading() {
    return isLoading
  },
  get error() {
    return error
  },
  get showAllWebsites() {
    return showAllWebsitesState
  },

  async init(): Promise<void> {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const allSettings = JSON.parse(stored)
      showAllWebsitesState = allSettings.showAllWebsites ?? false
      const s = allSettings.umami as UmamiSettings
      settings = s
      service = new UmamiService(s.apiUrl)
      await service.login(
        s.apiKey ? { apiKey: s.apiKey } : { username: s.username!, password: s.password! },
      )
      await this.fetchAll()
    }
  },

  async saveSettings(s: UmamiSettings): Promise<void> {
    settings = s
    const existingStored = localStorage.getItem(STORAGE_KEY)
    const existing = existingStored ? JSON.parse(existingStored) : {}
    const merged = {
      ...existing,
      umami: s,
      showAllWebsites: existing.showAllWebsites ?? false,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    service = new UmamiService(s.apiUrl)
    if (s.apiKey) {
      await service.login({ apiKey: s.apiKey })
    } else if (s.username && s.password) {
      await service.login({ username: s.username, password: s.password })
    }
    await this.fetchAll()
  },

  clearSettings(): void {
    localStorage.removeItem(STORAGE_KEY)
    resetState()
  },

  setShowAllWebsites(value: boolean): void {
    const existingStored = localStorage.getItem(STORAGE_KEY)
    const existing = existingStored ? JSON.parse(existingStored) : {}
    const merged = {
      ...existing,
      showAllWebsites: value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    showAllWebsitesState = value
  },

  async fetchAll(): Promise<void> {
    if (!service) {
      error = 'Not authenticated'
      return
    }

    isLoading = true
    error = null

    try {
      const allWebsites = await service.fetchWebsites()
      websites = allWebsites

      const statsResults = await Promise.all(
        allWebsites.map(async (w) => {
          const [websiteStats, websiteActive] = await Promise.all([
            service!.fetchStats(w.id),
            service!.fetchActive(w.id),
          ])
          return { id: w.id, stats: websiteStats, active: websiteActive }
        }),
      )

      const newStats = new SvelteMap<string, WebsiteStats>()
      const newActive = new SvelteMap<string, number>()
      for (const r of statsResults) {
        newStats.set(r.id, r.stats)
        newActive.set(r.id, r.active)
      }
      stats = newStats
      active = newActive
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isLoading = false
    }
  },
}

export function exportSettings(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return '{}'
  return stored
}

export async function importSettings(json: string): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = JSON.parse(json)
    if (!parsed.umami?.apiUrl) {
      return { success: false, error: 'apiUrl is required' }
    }
    const existingStored = localStorage.getItem(STORAGE_KEY)
    const existing = existingStored ? JSON.parse(existingStored) : {}

    const merged = {
      theme: parsed.theme ?? existing.theme,
      sortBy: parsed.sortBy ?? existing.sortBy,
      showAllWebsites: parsed.showAllWebsites ?? existing.showAllWebsites ?? false,
      umami: {
        apiUrl: parsed.umami.apiUrl,
        username: parsed.umami.username ?? existing.umami?.username,
        password: parsed.umami.password ?? existing.umami?.password,
        apiKey: parsed.umami.apiKey ?? existing.umami?.apiKey,
      },
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    showAllWebsitesState = merged.showAllWebsites

    const umamiSettings: UmamiSettings = {
      apiUrl: merged.umami.apiUrl,
      username: merged.umami.username,
      password: merged.umami.password,
      apiKey: merged.umami.apiKey,
    }

    settings = umamiSettings
    service = new UmamiService(umamiSettings.apiUrl)
    if (umamiSettings.apiKey) {
      await service.login({ apiKey: umamiSettings.apiKey })
    } else if (umamiSettings.username && umamiSettings.password) {
      await service.login({ username: umamiSettings.username, password: umamiSettings.password })
    }

    if (!service) {
      return { success: false, error: 'Service not initialized' }
    }

    isLoading = true
    error = null

    const allWebsites = await service.fetchWebsites()
    websites = allWebsites

    const statsResults = await Promise.all(
      allWebsites.map(async (w) => {
        const [websiteStats, websiteActive] = await Promise.all([
          service!.fetchStats(w.id),
          service!.fetchActive(w.id),
        ])
        return { id: w.id, stats: websiteStats, active: websiteActive }
      }),
    )

    const newStats = new SvelteMap<string, WebsiteStats>()
    const newActive = new SvelteMap<string, number>()
    for (const r of statsResults) {
      newStats.set(r.id, r.stats)
      newActive.set(r.id, r.active)
    }
    stats = newStats
    active = newActive

    return { success: true }
  } catch {
    return { success: false, error: 'Invalid settings format' }
  } finally {
    isLoading = false
  }
}
