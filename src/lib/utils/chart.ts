import type { PageviewData } from '$lib/data-access/types.js'

export interface HourlyBucket {
  hour: string
  label: string
  pageviews: number
  visitors: number
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createHourlyBuckets(pageviewData: PageviewData, now = new Date()): HourlyBucket[] {
  const todayDate = formatLocalDate(now)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayDate = formatLocalDate(yesterday)
  const currentHour = now.getHours()

  const buckets: HourlyBucket[] = []

  for (let i = 0; i < 24; i++) {
    const hour = (currentHour - 23 + i + 24) % 24
    const timeStr = hour.toString().padStart(2, '0')
    const isToday = i === 23
    const dateStr = isToday ? todayDate : yesterdayDate
    const label = `${dateStr} ${timeStr}:00`
    buckets.push({ hour: timeStr, label, pageviews: 0, visitors: 0 })
  }

  const addToBucket = (x: string, y: number, field: 'pageviews' | 'visitors') => {
    const [datePart, timePart] = x.split(/[T ]/)
    if (!datePart || !timePart) return

    const hour = parseInt(timePart.split(':')[0], 10)
    if (Number.isNaN(hour) || hour < 0 || hour > 23) return

    let offset = (hour - currentHour + 23 + 24) % 24

    if (offset === 23 && hour === currentHour && datePart === yesterdayDate) {
      offset = 22
    }

    const value = Number(y)
    if (!Number.isFinite(value)) return

    buckets[offset]![field] += value
  }

  const last24Pageviews = pageviewData.pageviews.slice(-24)
  const last24Sessions = pageviewData.sessions.slice(-24)

  last24Pageviews.forEach((v) => addToBucket(v.x, v.y, 'pageviews'))
  last24Sessions.forEach((v) => addToBucket(v.x, v.y, 'visitors'))

  return buckets
}
