import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UmamiService } from './umami.services.js'

const BASE_URL = 'https://umami.example.com'
const NOW_MS = 1700000000000

function createFetchMock() {
  return vi.spyOn(globalThis, 'fetch')
}

describe('UmamiService', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW_MS)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('strips trailing slash from apiUrl', () => {
      const service = new UmamiService('https://umami.example.com/')
      expect((service as unknown as { apiUrl: string }).apiUrl).toBe('https://umami.example.com')
    })

    it('keeps url without trailing slash unchanged', () => {
      const service = new UmamiService('https://umami.example.com')
      expect((service as unknown as { apiUrl: string }).apiUrl).toBe('https://umami.example.com')
    })
  })

  describe('login', () => {
    it('sets token directly when using apiKey', async () => {
      const service = new UmamiService(BASE_URL)
      const fetch = createFetchMock()

      await service.login({ apiKey: 'test-api-key' })

      expect(fetch).not.toHaveBeenCalled()
      expect(service.isAuthenticated()).toBe(true)
    })

    it('posts to auth/login when using username/password', async () => {
      const service = new UmamiService(BASE_URL)
      const fetch = createFetchMock().mockResolvedValueOnce(
        new Response(JSON.stringify({ token: 'returned-token' }), { status: 200 }),
      )

      await service.login({ username: 'user', password: 'pass' })

      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'user', password: 'pass' }),
      })
      expect(service.isAuthenticated()).toBe(true)
    })

    it('throws "Authentication failed" on non-ok response', async () => {
      const service = new UmamiService(BASE_URL)
      createFetchMock().mockResolvedValueOnce(new Response('', { status: 401 }))

      await expect(service.login({ username: 'user', password: 'pass' })).rejects.toThrow(
        'Authentication failed',
      )
    })

    it('throws "No token in response" when token missing', async () => {
      const service = new UmamiService(BASE_URL)
      createFetchMock().mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }))

      await expect(service.login({ username: 'user', password: 'pass' })).rejects.toThrow(
        'No token in response',
      )
    })
  })

  describe('fetchWebsites', () => {
    it('throws "No websites found" when response data is empty', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      createFetchMock().mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [], meta: { page: 1, pageCount: 1 } }), {
          status: 200,
        }),
      )

      await expect(service.fetchWebsites()).rejects.toThrow('No websites found')
    })

    it('fetches single page and returns websites', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      const websites = [
        { id: '1', name: 'Site 1', domain: 'site1.com' },
        { id: '2', name: 'Site 2', domain: 'site2.com' },
      ]
      createFetchMock().mockResolvedValueOnce(
        new Response(JSON.stringify({ data: websites, meta: { page: 1, pageCount: 1 } }), {
          status: 200,
        }),
      )

      const result = await service.fetchWebsites()

      expect(result).toEqual(websites)
    })

    it('fetches multiple pages until pageCount reached', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      const page1 = [{ id: '1', name: 'Site 1', domain: 'site1.com' }]
      const page2 = [{ id: '2', name: 'Site 2', domain: 'site2.com' }]
      const fetch = createFetchMock()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: page1, meta: { page: 1, pageCount: 2 } }), {
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: page2, meta: { page: 2, pageCount: 2 } }), {
            status: 200,
          }),
        )

      const result = await service.fetchWebsites()

      expect(result).toEqual([...page1, ...page2])
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('fetchStats', () => {
    it('makes two API calls for current and previous periods', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      const fetch = createFetchMock()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              pageviews: 100,
              visitors: 50,
              visits: 80,
              bounces: 10,
              totaltime: 3600,
            }),
            { status: 200 },
          ),
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              pageviews: 80,
              visitors: 40,
              visits: 70,
              bounces: 8,
              totaltime: 3000,
            }),
            { status: 200 },
          ),
        )

      const result = await service.fetchStats('website-1')

      expect(fetch).toHaveBeenCalledTimes(2)
      expect(result.pageviews).toBe(100)
      expect(result.visitors).toBe(50)
      expect(result.prev_pageviews).toBe(80)
      expect(result.prev_visitors).toBe(40)
    })

    it('normalizes flat stat format', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      createFetchMock()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ pageviews: 100, visitors: 50 }), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ pageviews: 80, visitors: 40 }), { status: 200 }),
        )

      const result = await service.fetchStats('website-1')

      expect(result.pageviews).toBe(100)
      expect(result.visitors).toBe(50)
      expect(result.prev_pageviews).toBe(80)
      expect(result.prev_visitors).toBe(40)
    })

    it('normalizes nested stat format', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      createFetchMock()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ pageviews: { value: 100 }, visitors: { value: 50 } }), {
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ pageviews: { value: 80 }, visitors: { value: 40 } }), {
            status: 200,
          }),
        )

      const result = await service.fetchStats('website-1')

      expect(result.pageviews).toBe(100)
      expect(result.visitors).toBe(50)
      expect(result.prev_pageviews).toBe(80)
      expect(result.prev_visitors).toBe(40)
    })

    it('handles null and undefined fields', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      createFetchMock()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ pageviews: null, visitors: undefined }), {
            status: 200,
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ pageviews: null, visitors: undefined }), {
            status: 200,
          }),
        )

      const result = await service.fetchStats('website-1')

      expect(result.pageviews).toBe(0)
      expect(result.visitors).toBe(0)
      expect(result.prev_pageviews).toBe(0)
      expect(result.prev_visitors).toBe(0)
    })
  })

  describe('fetchActive', () => {
    it('returns visitors count from response', async () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'
      createFetchMock().mockResolvedValueOnce(
        new Response(JSON.stringify({ visitors: 42 }), { status: 200 }),
      )

      const result = await service.fetchActive('website-1')

      expect(result).toBe(42)
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token is set', () => {
      const service = new UmamiService(BASE_URL)
      ;(service as unknown as { token: string }).token = 'test-token'

      expect(service.isAuthenticated()).toBe(true)
    })

    it('returns false when token is empty', () => {
      const service = new UmamiService(BASE_URL)

      expect(service.isAuthenticated()).toBe(false)
    })
  })
})
