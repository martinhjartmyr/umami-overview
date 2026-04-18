<script lang="ts">
  import type { Website, WebsiteStats, PageviewData } from '$lib/data-access/types.js'
  import WebsiteTableRow from './website-table-row.svelte'
  import WebsiteTableSkeleton from './website-table-skeleton.svelte'

  let {
    websites,
    stats,
    active,
    pageviews,
    loading = false,
  }: {
    websites: Website[]
    stats: Map<string, WebsiteStats>
    active: Map<string, number>
    pageviews: Map<string, PageviewData>
    loading?: boolean
  } = $props()
</script>

<div class="overflow-x-auto rounded-2xl border border-border bg-primary">
  <table class="w-full">
    <thead>
      <tr class="border-b border-border">
        <th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-fg-subtle uppercase"
          >Website</th
        >
        <th
          class="hidden w-32 px-4 py-3 text-left text-xs font-medium tracking-wide text-fg-subtle uppercase sm:table-cell"
        ></th>
        <th
          class="px-4 py-3 text-center text-xs font-medium tracking-wide text-fg-subtle uppercase sm:hidden"
        ></th>
        <th
          class="hidden px-4 py-3 text-center text-xs font-medium tracking-wide text-fg-subtle uppercase sm:table-cell"
          >Active</th
        >
        <th class="px-4 py-3 text-left text-xs font-medium tracking-wide text-fg-subtle uppercase"
          >Visitors</th
        >
        <th
          class="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-fg-subtle uppercase md:table-cell"
          >Visits</th
        >
        <th
          class="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-fg-subtle uppercase sm:table-cell"
          >Views</th
        >
        <th
          class="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-fg-subtle uppercase lg:table-cell"
          >Bounce Rate</th
        >
        <th
          class="hidden px-4 py-3 text-left text-xs font-medium tracking-wide text-fg-subtle uppercase lg:table-cell"
          >Visit Duration</th
        >
      </tr>
    </thead>
    <tbody>
      {#if loading}
        <WebsiteTableSkeleton />
      {:else}
        {#each websites as website (website.id)}
          {@const websiteStats = stats.get(website.id)}
          {@const activeCount = active.get(website.id) ?? 0}
          {@const websitePageviews = pageviews.get(website.id)}
          {#if websiteStats}
            <WebsiteTableRow
              {website}
              stats={websiteStats}
              active={activeCount}
              pageviewData={websitePageviews ?? { pageviews: [], sessions: [] }}
            />
          {/if}
        {/each}
      {/if}
    </tbody>
  </table>
</div>
