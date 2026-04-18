<script lang="ts">
  import type { Website, WebsiteStats, PageviewData } from '$lib/data-access/types.js'
  import {
    calcTrend,
    trendColor,
    bounceRateTrendColor,
    formatNumber,
    formatDuration,
  } from '$lib/utils/format.js'
  import { Area, Chart, Layer } from 'layerchart'
  import { dataStore } from '$lib/state/data.state.svelte.js'
  import { createHourlyBuckets } from '$lib/utils/chart.js'

  let {
    website,
    stats,
    active,
    pageviewData,
  }: { website: Website; stats: WebsiteStats; active: number; pageviewData: PageviewData } =
    $props()

  const chartData = $derived(createHourlyBuckets(pageviewData))

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
</script>

<tr
  class="cursor-pointer border-b border-border/50 transition-colors hover:bg-tertiary/50"
  onclick={() =>
    window.open(`${umamiBaseUrl}/websites/${website.id}`, '_blank', 'noopener,noreferrer')}
>
  <td class="px-4 py-3">
    <div class="flex min-w-0 items-center gap-3">
      <img
        src={faviconUrl}
        alt=""
        class="size-4 shrink-0 rounded-sm"
        onerror={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
        }}
      />
      <div class="min-w-0">
        <span class="block truncate text-sm font-semibold text-fg hover:underline">
          {website.name}
        </span>
        <a
          href="https://{website.domain}"
          target="_blank"
          rel="noopener noreferrer"
          class="block truncate text-xs text-fg-subtle hover:underline"
          onclick={(e) => e.stopPropagation()}
        >
          {website.domain}
        </a>
      </div>
    </div>
  </td>

  <td class="hidden w-32 px-4 py-3 sm:table-cell">
    <div class="h-10">
      <Chart data={chartData} x="hour" y="visitors" height={40} padding={0}>
        <Layer>
          <Area line={{ class: 'stroke-1 stroke-primary' }} class="fill-primary/20" />
        </Layer>
      </Chart>
    </div>
  </td>

  <td class="px-4 py-3 text-center">
    {#if active > 0}
      <span class="text-sm font-semibold text-positive">{active.toLocaleString()}</span>
    {/if}
  </td>

  <td class="px-4 py-3 text-right">
    <div class="text-sm">
      <span class="font-semibold text-fg">{formatNumber(stats.visitors)}</span>
      <span class="block text-xs sm:inline {trendColor(visitorsTrend.direction)}">
        {visitorsTrend.direction === 'up' ? '↑' : visitorsTrend.direction === 'down' ? '↓' : '—'}
        {visitorsTrend.percent.toFixed(0)}%
      </span>
    </div>
  </td>

  <td class="hidden px-4 py-3 md:table-cell">
    <div class="text-sm">
      <span class="font-semibold text-fg">{formatNumber(stats.visits)}</span>
      <span class="ml-1 text-xs {trendColor(visitsTrend.direction)}">
        {visitsTrend.direction === 'up' ? '↑' : visitsTrend.direction === 'down' ? '↓' : '—'}
        {visitsTrend.percent.toFixed(0)}%
      </span>
    </div>
  </td>

  <td class="hidden px-4 py-3 sm:table-cell">
    <div class="text-sm">
      <span class="font-semibold text-fg">{formatNumber(stats.pageviews)}</span>
      <span class="ml-1 text-xs {trendColor(pageviewsTrend.direction)}">
        {pageviewsTrend.direction === 'up' ? '↑' : pageviewsTrend.direction === 'down' ? '↓' : '—'}
        {pageviewsTrend.percent.toFixed(0)}%
      </span>
    </div>
  </td>

  <td class="hidden px-4 py-3 lg:table-cell">
    <div class="text-sm">
      <span class="font-semibold text-fg">{Math.round(bounceRate)}%</span>
      <span class="ml-1 text-xs {bounceRateTrendColor(bounceRateTrend.direction)}">
        {bounceRateTrend.direction === 'up'
          ? '↑'
          : bounceRateTrend.direction === 'down'
            ? '↓'
            : '—'}
        {bounceRateTrend.percent.toFixed(0)}%
      </span>
    </div>
  </td>

  <td class="hidden px-4 py-3 lg:table-cell">
    <div class="text-sm">
      <span class="font-semibold text-fg">{formatDuration(avgDurationPerVisitor)}</span>
      <span class="ml-1 text-xs {trendColor(totaltimeTrend.direction)}">
        {totaltimeTrend.direction === 'up' ? '↑' : totaltimeTrend.direction === 'down' ? '↓' : '—'}
        {totaltimeTrend.percent.toFixed(0)}%
      </span>
    </div>
  </td>
</tr>
