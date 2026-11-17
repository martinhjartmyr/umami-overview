import { describe, it, expect } from 'vitest'
import { createHourlyBuckets } from './chart.js'

describe('createHourlyBuckets', () => {
  const now = new Date(2026, 10, 17, 19, 15, 0)

  it('creates 24 hourly buckets ending at the current hour', () => {
    const buckets = createHourlyBuckets({ pageviews: [], sessions: [] }, now)
    expect(buckets).toHaveLength(24)
    expect(buckets[0]?.hour).toBe('20')
    expect(buckets[22]?.hour).toBe('18')
    expect(buckets[23]?.hour).toBe('19')
  })

  it('parses space-separated timestamps (legacy Umami format)', () => {
    const buckets = createHourlyBuckets(
      {
        pageviews: [{ x: '2026-11-17 18:00:00', y: 42 }],
        sessions: [{ x: '2026-11-17 18:00:00', y: 12 }],
      },
      now,
    )
    expect(buckets[22]?.pageviews).toBe(42)
    expect(buckets[22]?.visitors).toBe(12)
  })

  it('parses ISO-8601 T-separated timestamps (Umami 3.5+ format)', () => {
    const buckets = createHourlyBuckets(
      {
        pageviews: [
          { x: '2026-11-17T18:00:00Z', y: 55 },
          { x: '2026-11-17T19:00:00.000Z', y: 10 },
        ],
        sessions: [
          { x: '2026-11-17T18:00:00Z', y: 20 },
          { x: '2026-11-17T19:00:00.000Z', y: 4 },
        ],
      },
      now,
    )
    expect(buckets[22]?.pageviews).toBe(55)
    expect(buckets[22]?.visitors).toBe(20)
    expect(buckets[23]?.pageviews).toBe(10)
    expect(buckets[23]?.visitors).toBe(4)
  })

  it('maps yesterday current hour into bucket 22 instead of merging with today', () => {
    const midnightNow = new Date(2026, 10, 17, 0, 15, 0)
    const buckets = createHourlyBuckets(
      {
        pageviews: [{ x: '2026-11-16T00:00:00Z', y: 7 }],
        sessions: [{ x: '2026-11-16T00:00:00Z', y: 3 }],
      },
      midnightNow,
    )
    expect(buckets[22]?.pageviews).toBe(7)
    expect(buckets[22]?.visitors).toBe(3)
    expect(buckets[23]?.pageviews).toBe(0)
    expect(buckets[23]?.visitors).toBe(0)
  })

  it('ignores malformed timestamp entries without throwing', () => {
    const buckets = createHourlyBuckets(
      {
        pageviews: [{ x: 'invalid', y: 10 }],
        sessions: [{ x: '2026-11-17T99:00:00Z', y: 5 }],
      },
      now,
    )
    expect(buckets.every((b) => b.pageviews === 0 && b.visitors === 0)).toBe(true)
  })
})
