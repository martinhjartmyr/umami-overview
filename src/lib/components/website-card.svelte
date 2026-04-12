<script lang="ts">
  import { dataStore } from '$lib/state/data.state.svelte.js'
  import type { Website, WebsiteStats } from '$lib/data-access/types.js'
  import {
    calcTrend,
    trendColor,
    bounceRateTrendColor,
    formatNumber,
    formatDuration,
  } from '$lib/utils/format.js'

  let { website, stats, active }: { website: Website; stats: WebsiteStats; active: number } =
    $props()

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

<div class="w-full rounded-2xl bg-primary p-4 sm:p-6 lg:p-8">
  <div class="mb-4 flex items-start justify-between sm:mb-6 lg:mb-8">
    <div class="flex min-w-0 flex-col gap-1">
      <div class="flex min-w-0 items-center gap-2 sm:gap-3 lg:gap-4">
        <img
          src={faviconUrl}
          alt=""
          class="size-4 shrink-0 rounded-sm sm:size-6 lg:size-7"
          onerror={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <h2 class="min-w-0 truncate text-base font-bold text-fg sm:text-2xl lg:text-3xl">
          <a
            href="{umamiBaseUrl}/websites/{website.id}"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:underline">{website.name}</a
          >
        </h2>
      </div>
      <p class="text-xs text-fg-subtle sm:text-sm">
        {website.domain}
      </p>
    </div>

    {#if active > 0}
      <div class="text-right">
        <p class="text-base font-bold text-fg sm:text-2xl lg:text-3xl">
          {active.toLocaleString()}
        </p>
        <p class="mt-0.5 text-xs tracking-wide text-positive sm:text-sm lg:mt-2">Active</p>
      </div>
    {/if}
  </div>

  <div class="grid grid-cols-3 gap-4 sm:gap-6 lg:grid-cols-5 lg:gap-8">
    <div>
      <p class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm">
        Visitors
      </p>
      <p class="mt-0.5 text-base font-bold text-fg sm:text-2xl lg:mt-2 lg:text-3xl">
        {formatNumber(stats.visitors)}
      </p>
      <p class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm lg:mt-2">
        <span>{formatNumber(stats.prev_visitors)}</span>
        <span class={trendColor(visitorsTrend.direction)}>
          {visitorsTrend.direction === 'up' ? '↑' : visitorsTrend.direction === 'down' ? '↓' : '—'}
          {visitorsTrend.percent.toFixed(1)}%
        </span>
      </p>
    </div>

    <div class="hidden md:block">
      <p class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm">
        Visits
      </p>
      <p class="mt-0.5 text-base font-bold text-fg sm:text-2xl lg:mt-2 lg:text-3xl">
        {formatNumber(stats.visits)}
      </p>
      <p class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm lg:mt-2">
        <span>{formatNumber(stats.prev_visits)}</span>
        <span class={trendColor(visitsTrend.direction)}>
          {visitsTrend.direction === 'up' ? '↑' : visitsTrend.direction === 'down' ? '↓' : '—'}
          {visitsTrend.percent.toFixed(1)}%
        </span>
      </p>
    </div>

    <div>
      <p class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm">Views</p>
      <p class="mt-0.5 text-base font-bold text-fg sm:text-2xl lg:mt-2 lg:text-3xl">
        {formatNumber(stats.pageviews)}
      </p>
      <p class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm lg:mt-2">
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
      <p class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm">
        Bounce Rate
      </p>
      <p class="mt-0.5 text-base font-bold text-fg sm:text-2xl lg:mt-2 lg:text-3xl">
        {Math.round(bounceRate)}%
      </p>
      <p class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm lg:mt-2">
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
      <p class="text-[10px] font-medium tracking-wide text-fg-subtle uppercase sm:text-sm">
        Visit Duration
      </p>
      <p class="mt-0.5 text-base font-bold text-fg sm:text-2xl lg:mt-2 lg:text-3xl">
        {formatDuration(avgDurationPerVisitor)}
      </p>
      <p class="mt-0.5 text-[10px] font-medium text-fg-subtle sm:text-sm lg:mt-2">
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
