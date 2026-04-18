import type { PageviewData } from '$lib/data-access/types.js'

export interface HourlyBucket {
  hour: string
  label: string
  pageviews: number
  visitors: number
}

export function createHourlyBuckets(pageviewData: PageviewData, now = new Date()): HourlyBucket[] {
  const todayDate = now.toISOString().split('T')[0]
  const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
    const datePart = x.split(' ')[0]
    const hour = parseInt(x.split(' ')[1].split(':')[0], 10)

    let offset = (hour - currentHour + 23 + 24) % 24

    if (offset === 23 && hour === currentHour && datePart === yesterdayDate) {
      offset = 22
    }

    buckets[offset]![field] += y
  }

  const last24Pageviews = pageviewData.pageviews.slice(-24)
  const last24Sessions = pageviewData.sessions.slice(-24)

  last24Pageviews.forEach((v) => addToBucket(v.x, v.y, 'pageviews'))
  last24Sessions.forEach((v) => addToBucket(v.x, v.y, 'visitors'))

  return buckets
}
