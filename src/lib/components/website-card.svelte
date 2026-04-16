<script lang="ts">
  import { dataStore } from '$lib/state/data.state.svelte.js'
  import type { Website, WebsiteStats, PageviewData } from '$lib/data-access/types.js'
  import {
    calcTrend,
    trendColor,
    bounceRateTrendColor,
    formatNumber,
    formatDuration,
  } from '$lib/utils/format.js'
  import { BarChart, Tooltip } from 'layerchart'

  let {
    website,
    stats,
    active,
    pageviewData,
  }: { website: Website; stats: WebsiteStats; active: number; pageviewData: PageviewData } =
    $props()

  const chartData = $derived.by(() => {
    const now = new Date()
    const todayDate = now.toISOString().split('T')[0]
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const currentHour = now.getHours()

    const buckets: { hour: string; label: string; pageviews: number; visitors: number }[] = []

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

    // Only use last 24 entries (API may return 25 due to timezone/inclusive end)
    const last24Pageviews = pageviewData.pageviews.slice(-24)
    const last24Sessions = pageviewData.sessions.slice(-24)

    last24Pageviews.forEach((v) => addToBucket(v.x, v.y, 'pageviews'))
    last24Sessions.forEach((v) => addToBucket(v.x, v.y, 'visitors'))

    return buckets
  })

  const umamiBaseUrl = $derived(dataStore.settings?.apiUrl?.replace(/\/$/, '') ?? '')
  const faviconUrl = $derived(`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`)

  const bounceRate = $derived(stats.visits > 0 ? (stats.bounces / stats.visits) * 100 : 0)
  const prevBounceRate = $derived(
    stats.prev_visits > 0 ? (stats.prev_bounces / stats.prev_visits) * 100 : 0,
  )
  const bounceRateTrend = $derived(calcTrend(bounceRate, prevBounceRate))

  const pageviewsTrend = $derived(calcTrend(stats.pageviews, stats.prev_pageviews))
  const visitorsTrend = $derived(calcTrend(stats.visitors, stats.prev_visitors))
  const visitsTrend = $derived(calcTrend(stats.visits, stats.prev_visits))
  const totaltimeTrend = $derived(calcTrend(stats.totaltime, stats.prev_totaltime))

  const avgDurationPerVisitor = $derived(
    stats.visitors > 0 ? Math.round(stats.totaltime / stats.visitors) : 0,
  )
  const prevAvgDuration = $derived(
    stats.prev_visitors > 0 ? Math.round(stats.prev_totaltime / stats.prev_visitors) : 0,
  )
</script>

<div class="grid w-full rounded-2xl bg-primary p-4 sm:p-6 lg:gap-3 xl:p-6 2xl:p-5">
  <div class="mb-4 flex items-start justify-between sm:mb-6 xl:mb-6 2xl:mb-5">
    <div class="flex min-w-0 flex-col gap-1">
      <div class="flex min-w-0 items-center gap-2 sm:gap-3 xl:gap-3 2xl:gap-2">
        <img
          src={faviconUrl}
          alt=""
          class="size-4 shrink-0 rounded-sm sm:size-6 xl:size-6 2xl:size-5"
          onerror={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <h2
          class="min-w-0 truncate text-base font-bold text-fg sm:text-2xl xl:text-2xl 2xl:text-2xl"
        >
          <a
            href="{umamiBaseUrl}/websites/{website.id}"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline">{website.name}</a
          >
        </h2>
      </div>
      <p class="text-xs text-fg-subtle sm:text-sm">
        <a
          href="https://{website.domain}"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:underline">{website.domain}</a
        >
      </p>
    </div>

    {#if active > 0}
      <div class="text-right">
        <p class="text-base font-bold text-fg sm:text-2xl xl:text-2xl 2xl:text-xl">
          {active.toLocaleString()}
        </p>
        <p
          class="mt-0.5 text-xs tracking-wide text-positive sm:text-sm xl:mt-1 xl:text-xs 2xl:mt-0.5 2xl:text-[10px]"
        >
          Active
        </p>
      </div>
    {/if}
  </div>

  <div class="mb-4 h-[100px]">
    <BarChart
      data={chartData}
      x="hour"
      y="visitors"
      height={100}
      axis={true}
      grid={false}
      rule={false}
      props={{
        bars: { stroke: 'var(--color-border)', strokeWidth: 1 },
        yAxis: {
          format: (value: number) => Math.round(value).toString(),
        },
      }}
    >
      {#snippet tooltip({ context })}
        {@const tooltipData = context.tooltip?.data}
        {#if tooltipData}
          <Tooltip.Root>
            <Tooltip.Header>Hour: {tooltipData.hour}</Tooltip.Header>
            <Tooltip.List>
              <Tooltip.Item label="visitors" color="var(--color-fg-subtle)">
                {tooltipData.visitors}
              </Tooltip.Item>
            </Tooltip.List>
          </Tooltip.Root>
        {/if}
      {/snippet}
    </BarChart>
  </div>

  <div class="grid grid-cols-3 gap-4 sm:gap-6 xl:grid-cols-5 xl:gap-5 2xl:gap-4">
    <div>
      <p
        class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm xl:text-xs 2xl:text-xs"
      >
        Visitors
      </p>
      <p
        class="mt-0.5 text-base font-bold text-fg sm:text-2xl xl:mt-1 xl:text-xl 2xl:mt-0 2xl:text-xl"
      >
        {formatNumber(stats.visitors)}
      </p>
      <p
        class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm xl:mt-1 xl:text-xs 2xl:mt-0 2xl:text-xs"
      >
        <span>{formatNumber(stats.prev_visitors)}</span>
        <span class={trendColor(visitorsTrend.direction)}>
          {visitorsTrend.direction === 'up' ? '↑' : visitorsTrend.direction === 'down' ? '↓' : '—'}
          {visitorsTrend.percent.toFixed(1)}%
        </span>
      </p>
    </div>

    <div class="hidden md:block">
      <p
        class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm xl:text-xs 2xl:text-xs"
      >
        Visits
      </p>
      <p
        class="mt-0.5 text-base font-bold text-fg sm:text-2xl xl:mt-1 xl:text-xl 2xl:mt-0 2xl:text-xl"
      >
        {formatNumber(stats.visits)}
      </p>
      <p
        class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm xl:mt-1 xl:text-xs 2xl:mt-0 2xl:text-xs"
      >
        <span>{formatNumber(stats.prev_visits)}</span>
        <span class={trendColor(visitsTrend.direction)}>
          {visitsTrend.direction === 'up' ? '↑' : visitsTrend.direction === 'down' ? '↓' : '—'}
          {visitsTrend.percent.toFixed(1)}%
        </span>
      </p>
    </div>

    <div>
      <p
        class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm xl:text-xs 2xl:text-xs"
      >
        Views
      </p>
      <p
        class="mt-0.5 text-base font-bold text-fg sm:text-2xl xl:mt-1 xl:text-xl 2xl:mt-0 2xl:text-xl"
      >
        {formatNumber(stats.pageviews)}
      </p>
      <p
        class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm xl:mt-1 xl:text-xs 2xl:mt-0 2xl:text-xs"
      >
        <span>{formatNumber(stats.prev_pageviews)}</span>
        <span class={trendColor(pageviewsTrend.direction)}>
          {pageviewsTrend.direction === 'up'
            ? '↑'
            : pageviewsTrend.direction === 'down'
              ? '↓'
              : '—'}
          {pageviewsTrend.percent.toFixed(1)}%
        </span>
      </p>
    </div>

    <div>
      <p
        class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm xl:text-xs 2xl:text-xs"
      >
        Bounce Rate
      </p>
      <p
        class="mt-0.5 text-base font-bold text-fg sm:text-2xl xl:mt-1 xl:text-xl 2xl:mt-0 2xl:text-xl"
      >
        {Math.round(bounceRate)}%
      </p>
      <p
        class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm xl:mt-1 xl:text-xs 2xl:mt-0 2xl:text-xs"
      >
        <span>{Math.round(prevBounceRate)}%</span>
        <span class={bounceRateTrendColor(bounceRateTrend.direction)}>
          {bounceRateTrend.direction === 'up'
            ? '↑'
            : bounceRateTrend.direction === 'down'
              ? '↓'
              : '—'}
          {bounceRateTrend.percent.toFixed(1)}%
        </span>
      </p>
    </div>

    <div class="hidden md:block">
      <p
        class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm xl:text-xs 2xl:text-xs"
      >
        Visit Duration
      </p>
      <p
        class="mt-0.5 text-base font-bold text-fg sm:text-2xl xl:mt-1 xl:text-xl 2xl:mt-0 2xl:text-xl"
      >
        {formatDuration(avgDurationPerVisitor)}
      </p>
      <p
        class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm xl:mt-1 xl:text-xs 2xl:mt-0 2xl:text-xs"
      >
        <span>{formatDuration(prevAvgDuration)}</span>
        <span class={trendColor(totaltimeTrend.direction)}>
          {totaltimeTrend.direction === 'up'
            ? '↑'
            : totaltimeTrend.direction === 'down'
              ? '↓'
              : '—'}
          {totaltimeTrend.percent.toFixed(1)}%
        </span>
      </p>
    </div>
  </div>
</div>

<style>
  :global(.lc-axis text) {
    fill: var(--color-fg);
    font-weight: normal;
    text-shadow: none;
    stroke: none;
  }
</style>
