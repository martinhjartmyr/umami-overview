export type TrendDirection = 'up' | 'down' | 'neutral'

export interface TrendResult {
  direction: TrendDirection
  percent: number
}

export function calcTrend(current: number, previous: number): TrendResult {
  if (previous === 0) return { direction: 'neutral', percent: 0 }
  const diff = ((current - previous) / previous) * 100
  return {
    direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
    percent: Math.abs(diff),
  }
}

export function trendColor(direction: TrendDirection): string {
  if (direction === 'up') return 'text-positive'
  if (direction === 'down') return 'text-negative'
  return 'text-fg-subtle'
}

export function bounceRateTrendColor(direction: TrendDirection): string {
  if (direction === 'up') return 'text-negative'
  if (direction === 'down') return 'text-positive'
  return 'text-fg-subtle'
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm'
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toLocaleString()
}

export function formatDuration(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }
  return `${seconds}s`
}
