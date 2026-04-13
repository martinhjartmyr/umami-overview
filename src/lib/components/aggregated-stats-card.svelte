<script lang="ts">
  import type { WebsiteStats } from '$lib/data-access/types.js'
  import { calcTrend, trendColor, bounceRateTrendColor, formatNumber } from '$lib/utils/format.js'

  let {
    stats,
    active,
  }: {
    stats: WebsiteStats
    active: number
  } = $props()

  const bounceRate = $derived(stats.visits > 0 ? (stats.bounces / stats.visits) * 100 : 0)
  const prevBounceRate = $derived(
    stats.prev_visits > 0 ? (stats.prev_bounces / stats.prev_visits) * 100 : 0,
  )
  const bounceRateTrend = $derived(calcTrend(bounceRate, prevBounceRate))

  const visitorsTrend = $derived(calcTrend(stats.visitors, stats.prev_visitors))
  const visitsTrend = $derived(calcTrend(stats.visits, stats.prev_visits))
  const pageviewsTrend = $derived(calcTrend(stats.pageviews, stats.prev_pageviews))
</script>

<div class="rounded-2xl bg-primary p-4 sm:p-6 xl:p-6 2xl:p-5">
  <header class="mb-4 flex items-start justify-between gap-4 sm:mb-6 xl:mb-6 2xl:mb-5">
    <div class="flex min-w-0 flex-col gap-1">
      <h2 class="text-base font-bold text-fg sm:text-2xl xl:text-2xl 2xl:text-2xl">All Websites</h2>
      <p class="text-xs text-fg-subtle sm:text-sm xl:text-xs 2xl:text-xs">Aggregated statistics</p>
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
  </header>

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
  </div>
</div>
