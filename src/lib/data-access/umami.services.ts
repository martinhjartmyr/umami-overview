import type { Website, WebsiteStats, UmamiCredentials } from './types.js'

export class UmamiService {
  private token: string = ''

  constructor(private apiUrl: string) {
    this.apiUrl = apiUrl.replace(/\/$/, '')
  }

  async login(credentials: UmamiCredentials): Promise<void> {
    if ('apiKey' in credentials) {
      this.token = credentials.apiKey
      return
    }

    const response = await fetch(`${this.apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new Error('Authentication failed')
    }

    const data = (await response.json()) as { token?: string }
    if (!data.token) {
      throw new Error('No token in response')
    }

    this.token = data.token
  }

  async fetchWebsites(): Promise<Website[]> {
    const websites: Website[] = []
    let page = 1
    const pageSize = 100

    while (true) {
      const url = `${this.apiUrl}/api/websites?page=${page}&pageSize=${pageSize}&includeTeams=true`
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.token}` },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${url}`)
      }

      const data = (await response.json()) as {
        data: Website[]
        meta?: { page: number; pageCount: number }
      }
      websites.push(...data.data)

      if (!data.meta || page >= data.meta.pageCount) {
        break
      }
      page++
    }

    if (websites.length === 0) {
      throw new Error('No websites found')
    }

    return websites
  }

  async fetchStats(websiteId: string): Promise<WebsiteStats> {
    const nowMs = Date.now()
    const startMs = nowMs - 86400 * 1000
    const prevStartMs = startMs - 86400 * 1000
    const prevEndMs = startMs

    const [current, previous] = await Promise.all([
      this.fetchStatsForPeriod(websiteId, startMs, nowMs),
      this.fetchStatsForPeriod(websiteId, prevStartMs, prevEndMs),
    ])

    return {
      ...current,
      prev_pageviews: previous.pageviews,
      prev_visitors: previous.visitors,
      prev_visits: previous.visits,
      prev_bounces: previous.bounces,
      prev_totaltime: previous.totaltime,
    }
  }

  private async fetchStatsForPeriod(
    websiteId: string,
    startAt: number,
    endAt: number,
  ): Promise<
    Omit<
      WebsiteStats,
      'prev_pageviews' | 'prev_visitors' | 'prev_visits' | 'prev_bounces' | 'prev_totaltime'
    >
  > {
    const url = `${this.apiUrl}/api/websites/${websiteId}/stats?startAt=${startAt}&endAt=${endAt}`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${url}`)
    }

    const raw = (await response.json()) as Record<string, unknown>
    return normalize(raw) as Omit<
      WebsiteStats,
      'prev_pageviews' | 'prev_visitors' | 'prev_visits' | 'prev_bounces' | 'prev_totaltime'
    >
  }

  async fetchActive(websiteId: string): Promise<number> {
    const url = `${this.apiUrl}/api/websites/${websiteId}/active`
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.token}` },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${url}`)
    }

    const data = (await response.json()) as { visitors: number }
    return data.visitors
  }

  isAuthenticated(): boolean {
    return this.token !== ''
  }
}

function normalize(raw: Record<string, unknown>): Partial<WebsiteStats> {
  const get = (key: string): number => {
    const val = raw[key]
    if (val === null || val === undefined) return 0
    if (typeof val === 'object' && 'value' in (val as Record<string, unknown>)) {
      return (val as { value: number }).value ?? 0
    }
    return (val as number) ?? 0
  }
  return {
    pageviews: get('pageviews'),
    visitors: get('visitors'),
    visits: get('visits'),
    bounces: get('bounces'),
    totaltime: get('totaltime'),
  }
}
