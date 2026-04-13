export interface Website {
  id: string
  name: string
  domain: string
  favicon?: string
}

export interface WebsiteStats {
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
  prev_pageviews: number
  prev_visitors: number
  prev_visits: number
  prev_bounces: number
  prev_totaltime: number
}

export interface ActiveStats {
  visitors: number
}

export interface UmamiSettings {
  apiUrl: string
  apiKey?: string
  username?: string
  password?: string
  mockMode?: boolean
}

export type UmamiCredentials = { apiKey: string } | { username: string; password: string }
