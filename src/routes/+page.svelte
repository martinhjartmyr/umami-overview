<script lang="ts">
  import { onMount } from 'svelte'
  import { dataStore } from '$lib/state/data.state.svelte.js'
  import SettingsModal from '$lib/components/settings-modal.svelte'
  import WebsiteCard from '$lib/components/website-card.svelte'
  import AggregatedStatsCard from '$lib/components/aggregated-stats-card.svelte'
  import type { WebsiteStats } from '$lib/data-access/types.js'
  import { getContext } from 'svelte'

  let showSettings = $state(false)

  const sortContext = getContext<{ get: () => 'name' | 'visitors' | 'active' }>('sortBy')
  const sortBy = $derived(sortContext.get())

  onMount(() => {
    dataStore.init()
  })

  const sortedWebsites = $derived.by(() => {
    return [...dataStore.websites].sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'visitors') {
        const aStats = dataStore.stats.get(a.id)
        const bStats = dataStore.stats.get(b.id)
        return (bStats?.visitors ?? 0) - (aStats?.visitors ?? 0)
      }
      const aActive = dataStore.active.get(a.id) ?? 0
      const bActive = dataStore.active.get(b.id) ?? 0
      return bActive - aActive
    })
  })

  const aggregatedStats = $derived.by(() => {
    let visitors = 0
    let prev_visitors = 0
    let visits = 0
    let prev_visits = 0
    let pageviews = 0
    let prev_pageviews = 0
    let bounces = 0
    let prev_bounces = 0
    let active = 0

    for (const [id, stats] of dataStore.stats) {
      visitors += stats.visitors
      prev_visitors += stats.prev_visitors
      visits += stats.visits
      prev_visits += stats.prev_visits
      pageviews += stats.pageviews
      prev_pageviews += stats.prev_pageviews
      bounces += stats.bounces
      prev_bounces += stats.prev_bounces
      active += dataStore.active.get(id) ?? 0
    }

    return {
      visitors,
      prev_visitors,
      visits,
      prev_visits,
      pageviews,
      prev_pageviews,
      bounces,
      prev_bounces,
      active,
    } as WebsiteStats & { active: number }
  })
</script>

<div class="h-full p-3 sm:p-6">
  {#if dataStore.settings}
    {#if dataStore.isLoading}
      <p class="text-fg-subtle">Loading...</p>
    {:else if dataStore.error}
      <p style="color: #ef4444;">Error: {dataStore.error}</p>
    {:else if dataStore.websites.length > 0}
      <div class="space-y-3 sm:space-y-6">
        {#if dataStore.websites.length > 1}
          <AggregatedStatsCard stats={aggregatedStats} active={aggregatedStats.active} />
        {/if}
        <div class="website-grid grid gap-3 sm:gap-6" style="grid-template-columns: 1fr;">
          {#each sortedWebsites as website (website.id)}
            {@const stats = dataStore.stats.get(website.id)}
            {@const activeCount = dataStore.active.get(website.id) ?? 0}
            {#if stats}
              <WebsiteCard {website} {stats} active={activeCount} />
            {/if}
          {/each}
        </div>
      </div>
    {:else}
      <p class="text-fg-subtle">No websites found.</p>
    {/if}
  {:else}
    <div class="flex items-center justify-center py-12 sm:py-20">
      <div class="w-full max-w-md rounded-lg border border-border bg-primary px-6 py-8 text-center">
        <p class="mb-4 text-fg-subtle">Configure your Umami connection to get started.</p>
        <button
          type="button"
          onclick={() => (showSettings = true)}
          class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium text-fg-muted hover:bg-tertiary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            /><circle cx="12" cy="12" r="3" /></svg
          >
          <span>Settings</span>
        </button>
      </div>
    </div>
  {/if}
</div>

{#if showSettings}
  <SettingsModal onClose={() => (showSettings = false)} />
{/if}

<style>
  @media (min-width: 780px) {
    :global(.website-grid) {
      grid-template-columns: repeat(auto-fill, minmax(620px, 1fr)) !important;
    }
  }
</style>
