import { describe, it, expect } from 'vitest'
import {
  calcTrend,
  trendColor,
  bounceRateTrendColor,
  formatNumber,
  formatDuration,
} from './format.js'

describe('calcTrend', () => {
  it('returns neutral when previous is 0', () => {
    expect(calcTrend(100, 0)).toEqual({ direction: 'neutral', percent: 0 })
  })

  it('returns up direction with positive percent when current > previous', () => {
    const result = calcTrend(150, 100)
    expect(result.direction).toBe('up')
    expect(result.percent).toBe(50)
  })

  it('returns down direction with positive percent when current < previous', () => {
    const result = calcTrend(80, 100)
    expect(result.direction).toBe('down')
    expect(result.percent).toBe(20)
  })

  it('returns neutral when current equals previous', () => {
    const result = calcTrend(100, 100)
    expect(result.direction).toBe('neutral')
    expect(result.percent).toBe(0)
  })

  it('calculates correct percent for 3x increase', () => {
    const result = calcTrend(300, 100)
    expect(result.direction).toBe('up')
    expect(result.percent).toBe(200)
  })
})

describe('trendColor', () => {
  it('returns text-positive for up direction', () => {
    expect(trendColor('up')).toBe('text-positive')
  })

  it('returns text-negative for down direction', () => {
    expect(trendColor('down')).toBe('text-negative')
  })

  it('returns text-fg-subtle for neutral direction', () => {
    expect(trendColor('neutral')).toBe('text-fg-subtle')
  })
})

describe('bounceRateTrendColor', () => {
  it('returns text-negative for up direction (inverted)', () => {
    expect(bounceRateTrendColor('up')).toBe('text-negative')
  })

  it('returns text-positive for down direction (inverted)', () => {
    expect(bounceRateTrendColor('down')).toBe('text-positive')
  })

  it('returns text-fg-subtle for neutral direction', () => {
    expect(bounceRateTrendColor('neutral')).toBe('text-fg-subtle')
  })
})

describe('formatNumber', () => {
  it('formats numbers below 1000 with locale string', () => {
    expect(formatNumber(999)).toBe('999')
  })

  it('formats 1000 as 1k', () => {
    expect(formatNumber(1000)).toBe('1k')
  })

  it('formats 1500 as 1.5k', () => {
    expect(formatNumber(1500)).toBe('1.5k')
  })

  it('removes trailing .0 from whole thousands', () => {
    expect(formatNumber(2000)).toBe('2k')
  })

  it('formats 999999 as 1000k (just under 1m)', () => {
    expect(formatNumber(999999)).toBe('1000k')
  })

  it('formats 1500000 as 1.5m', () => {
    expect(formatNumber(1500000)).toBe('1.5m')
  })

  it('removes trailing .0 from whole millions', () => {
    expect(formatNumber(2000000)).toBe('2m')
  })
})

describe('formatDuration', () => {
  it('formats seconds below 60', () => {
    expect(formatDuration(45)).toBe('45s')
  })

  it('formats exactly 60 seconds as 1m', () => {
    expect(formatDuration(60)).toBe('1m')
  })

  it('formats 90 seconds as 1m 30s', () => {
    expect(formatDuration(90)).toBe('1m 30s')
  })

  it('formats exactly 3600 seconds as 1h', () => {
    expect(formatDuration(3600)).toBe('1h')
  })

  it('formats 3661 seconds as 1h 1m', () => {
    expect(formatDuration(3661)).toBe('1h 1m')
  })

  it('formats 7200 seconds as 2h', () => {
    expect(formatDuration(7200)).toBe('2h')
  })

  it('formats 7261 seconds as 2h 1m', () => {
    expect(formatDuration(7261)).toBe('2h 1m')
  })
})
