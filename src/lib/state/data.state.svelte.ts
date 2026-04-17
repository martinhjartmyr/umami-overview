import { SvelteMap } from 'svelte/reactivity'
import type { UmamiSettings, Website, WebsiteStats, PageviewData } from '../data-access/types.js'
import { UmamiService } from '../data-access/umami.services.js'

export interface AllSettings {
  theme?: 'light' | 'dark' | 'auto'
  umami?: Partial<UmamiSettings>
  sortBy?: 'name' | 'visitors' | 'active'
  showAllWebsites?: boolean
}

const STORAGE_KEY = 'umami-overview-settings'

const MOCK_WEBSITES: Website[] = [
  { id: '1', name: 'TechBlog', domain: 'techblog.example.com' },
  { id: '2', name: 'ShopEasy', domain: 'shop.example.com' },
  { id: '3', name: 'NewsDaily', domain: 'newsdaily.example.com' },
  { id: '4', name: 'DevPortal', domain: 'devportal.example.com' },
  { id: '5', name: 'CloudApp', domain: 'cloudapp.example.com' },
  { id: '6', name: 'CryptoWatch', domain: 'cryptowatch.example.com' },
  { id: '7', name: 'FoodieHub', domain: 'foodiehub.example.com' },
  { id: '8', name: 'TravelNow', domain: 'travelnow.example.com' },
  { id: '9', name: 'FitnessPro', domain: 'fitnesspro.example.com' },
  { id: '10', name: 'GameZone', domain: 'gamezone.example.com' },
  { id: '11', name: 'BookWorld', domain: 'bookworld.example.com' },
  { id: '12', name: 'ArtGallery', domain: 'artgallery.example.com' },
]

const MOCK_STATS: Record<string, WebsiteStats> = {
  '1': {
    pageviews: 45200,
    visitors: 12450,
    visits: 18900,
    bounces: 4520,
    totaltime: 224000,
    prev_pageviews: 38900,
    prev_visitors: 11200,
    prev_visits: 17200,
    prev_bounces: 4100,
    prev_totaltime: 168000,
  },
  '2': {
    pageviews: 8900,
    visitors: 2340,
    visits: 3100,
    bounces: 890,
    totaltime: 156000,
    prev_pageviews: 11200,
    prev_visitors: 2900,
    prev_visits: 3800,
    prev_bounces: 1050,
    prev_totaltime: 142000,
  },
  '3': {
    pageviews: 127800,
    visitors: 28900,
    visits: 41200,
    bounces: 8200,
    totaltime: 2890000,
    prev_pageviews: 118000,
    prev_visitors: 27200,
    prev_visits: 38500,
    prev_bounces: 7800,
    prev_totaltime: 2450000,
  },
  '4': {
    pageviews: 3200,
    visitors: 890,
    visits: 1200,
    bounces: 420,
    totaltime: 67000,
    prev_pageviews: 3800,
    prev_visitors: 950,
    prev_visits: 1350,
    prev_bounces: 480,
    prev_totaltime: 72000,
  },
  '5': {
    pageviews: 67800,
    visitors: 15600,
    visits: 22100,
    bounces: 5100,
    totaltime: 890000,
    prev_pageviews: 54200,
    prev_visitors: 12900,
    prev_visits: 18500,
    prev_bounces: 4200,
    prev_totaltime: 720000,
  },
  '6': {
    pageviews: 1200,
    visitors: 340,
    visits: 480,
    bounces: 120,
    totaltime: 42000,
    prev_pageviews: 980,
    prev_visitors: 280,
    prev_visits: 400,
    prev_bounces: 100,
    prev_totaltime: 35000,
  },
  '7': {
    pageviews: 23400,
    visitors: 5600,
    visits: 7800,
    bounces: 1890,
    totaltime: 312000,
    prev_pageviews: 18900,
    prev_visitors: 4800,
    prev_visits: 6600,
    prev_bounces: 1600,
    prev_totaltime: 245000,
  },
  '8': {
    pageviews: 56700,
    visitors: 14200,
    visits: 19800,
    bounces: 4200,
    totaltime: 1560000,
    prev_pageviews: 48900,
    prev_visitors: 12800,
    prev_visits: 17600,
    prev_bounces: 3800,
    prev_totaltime: 1120000,
  },
  '9': {
    pageviews: 9800,
    visitors: 2100,
    visits: 3200,
    bounces: 780,
    totaltime: 189000,
    prev_pageviews: 11200,
    prev_visitors: 2400,
    prev_visits: 3600,
    prev_bounces: 890,
    prev_totaltime: 198000,
  },
  '10': {
    pageviews: 89200,
    visitors: 23400,
    visits: 31200,
    bounces: 7200,
    totaltime: 4200000,
    prev_pageviews: 76800,
    prev_visitors: 19800,
    prev_visits: 26800,
    prev_bounces: 6100,
    prev_totaltime: 3580000,
  },
  '11': {
    pageviews: 1800,
    visitors: 420,
    visits: 680,
    bounces: 180,
    totaltime: 28000,
    prev_pageviews: 2200,
    prev_visitors: 510,
    prev_visits: 820,
    prev_bounces: 220,
    prev_totaltime: 34000,
  },
  '12': {
    pageviews: 41200,
    visitors: 9800,
    visits: 14500,
    bounces: 3200,
    totaltime: 678000,
    prev_pageviews: 35600,
    prev_visitors: 8400,
    prev_visits: 12200,
    prev_bounces: 2800,
    prev_totaltime: 590000,
  },
}

const MOCK_ACTIVE: Record<string, number> = {
  '1': 142,
  '2': 0,
  '3': 423,
  '4': 0,
  '5': 89,
  '6': 0,
  '7': 12,
  '8': 67,
  '9': 0,
  '10': 234,
  '11': 0,
  '12': 45,
}

function generateMockPageviews(): Record<string, PageviewData> {
  const now = new Date()
  const currentHour = now.getHours()
  const result: Record<string, PageviewData> = {}

  const hourlyMultiplier: Record<number, number> = {
    0: 0.2,
    1: 0.15,
    2: 0.1,
    3: 0.08,
    4: 0.1,
    5: 0.15,
    6: 0.3,
    7: 0.5,
    8: 0.7,
    9: 0.85,
    10: 0.95,
    11: 1.0,
    12: 0.9,
    13: 0.95,
    14: 1.0,
    15: 0.9,
    16: 0.8,
    17: 0.7,
    18: 0.6,
    19: 0.5,
    20: 0.4,
    21: 0.35,
    22: 0.3,
    23: 0.25,
  }

  for (const w of MOCK_WEBSITES) {
    const baseVisitors = MOCK_ACTIVE[w.id] ?? 10
    const scale = Math.max(baseVisitors / 100, 0.5)
    const pageviews: { x: string; y: number }[] = []
    const sessions: { x: string; y: number }[] = []

    for (let i = 0; i < 24; i++) {
      const hour = (currentHour - 23 + i + 24) % 24
      const date = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const timeStr = hour.toString().padStart(2, '0')
      const x = `${dateStr} ${timeStr}:00`

      const variation = 0.7 + Math.random() * 0.6
      const pv = Math.round(baseVisitors * hourlyMultiplier[hour]! * scale * variation * 10)
      const ss = Math.round(pv * (0.3 + Math.random() * 0.2))

      pageviews.push({ x, y: pv })
      sessions.push({ x, y: ss })
    }

    result[w.id] = { pageviews, sessions }
  }

  return result
}

function isMockMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).has('mock')
}

let settings: UmamiSettings | null = $state(null)
let service: UmamiService | null = $state(null)
let websites: Website[] = $state([])
let stats: SvelteMap<string, WebsiteStats> = new SvelteMap()
let active: SvelteMap<string, number> = new SvelteMap()
let pageviews: SvelteMap<string, PageviewData> = new SvelteMap()
let timezone: string = $state('')
let isLoading: boolean = $state(false)
let error: string | null = $state(null)
let showAllWebsitesState: boolean = $state(false)

function resetState() {
  settings = null
  service = null
  websites = []
  stats = new SvelteMap()
  active = new SvelteMap()
  pageviews = new SvelteMap()
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
  get pageviews() {
    return pageviews
  },
  get timezone() {
    return timezone
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
    if (isMockMode()) {
      websites = MOCK_WEBSITES
      const newStats = new SvelteMap<string, WebsiteStats>()
      const newActive = new SvelteMap<string, number>()
      const newPageviews = new SvelteMap<string, PageviewData>()
      const mockPageviews = generateMockPageviews()
      for (const w of MOCK_WEBSITES) {
        newStats.set(w.id, MOCK_STATS[w.id])
        newActive.set(w.id, MOCK_ACTIVE[w.id])
        newPageviews.set(w.id, mockPageviews[w.id])
      }
      stats = newStats
      active = newActive
      pageviews = newPageviews
      isLoading = false
      error = null
      return
    }

    if (!service) {
      error = 'Not authenticated'
      return
    }

    await this.fetchWebsitesList()
    if (error || websites.length === 0) return
    await this.fetchStatsAndActive()
    if (error) return
    await this.fetchPageviewsData()
  },

  async fetchWebsitesList(): Promise<void> {
    if (!service) {
      error = 'Not authenticated'
      return
    }

    isLoading = true
    error = null

    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const allWebsites = await service.fetchWebsites()
      websites = allWebsites
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isLoading = false
    }
  },

  async fetchStatsAndActive(): Promise<void> {
    if (!service || websites.length === 0) return

    try {
      const statsResults = await Promise.all(
        websites.map(async (w) => {
          const [websiteStats, websiteActive] = await Promise.all([
            service!.fetchStats(w.id),
            service!.fetchActive(w.id),
          ])
          return {
            id: w.id,
            stats: websiteStats,
            active: websiteActive,
          }
        }),
      )

      for (const r of statsResults) {
        stats.set(r.id, r.stats)
        active.set(r.id, r.active)
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error'
    }
  },

  async fetchPageviewsData(): Promise<void> {
    if (!service || websites.length === 0) return

    try {
      const now = Date.now()
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

      const pageviewResults = await Promise.all(
        websites.map(async (w) => {
          const websitePageviews = await service!.fetchPageviews(
            w.id,
            twentyFourHoursAgo,
            now,
            timezone,
          )
          return { id: w.id, pageviews: websitePageviews }
        }),
      )

      for (const r of pageviewResults) {
        pageviews.set(r.id, r.pageviews)
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error'
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

    try {
      const allWebsites = await service.fetchWebsites()
      websites = allWebsites
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error'
      return { success: false, error: error }
    } finally {
      isLoading = false
    }

    try {
      const statsResults = await Promise.all(
        websites.map(async (w) => {
          const [websiteStats, websiteActive] = await Promise.all([
            service!.fetchStats(w.id),
            service!.fetchActive(w.id),
          ])
          return { id: w.id, stats: websiteStats, active: websiteActive }
        }),
      )

      for (const r of statsResults) {
        stats.set(r.id, r.stats)
        active.set(r.id, r.active)
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error'
    }

    try {
      const now = Date.now()
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

      const pageviewResults = await Promise.all(
        websites.map(async (w) => {
          const websitePageviews = await service!.fetchPageviews(
            w.id,
            twentyFourHoursAgo,
            now,
            timezone,
          )
          return { id: w.id, pageviews: websitePageviews }
        }),
      )

      for (const r of pageviewResults) {
        pageviews.set(r.id, r.pageviews)
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error'
    }

    if (error) {
      return { success: false, error }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'Invalid settings format' }
  } finally {
    isLoading = false
  }
}
