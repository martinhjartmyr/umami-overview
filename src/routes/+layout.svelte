<script lang="ts">
  import './layout.css'
  import favicon from '$lib/assets/favicon.svg'
  import { themeState, STORAGE_KEY } from '$lib/state/theme.svelte.js'
  import ThemeToggle from '$lib/components/theme-toggle.svelte'
  import SettingsModal from '$lib/components/settings-modal.svelte'
  import { setContext } from 'svelte'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
  let showSettings = $state(false)
  let sortBy = $state<'name' | 'visitors' | 'active'>('visitors')

  setContext('sortBy', {
    get: () => sortBy,
    set: (value: 'name' | 'visitors' | 'active') => (sortBy = value),
  })

  $effect(() => {
    themeState.init()

    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { sortBy?: 'name' | 'visitors' | 'active' }
          if (parsed.sortBy && ['name', 'visitors', 'active'].includes(parsed.sortBy)) {
            sortBy = parsed.sortBy
          }
        } catch {
          // Use default
        }
      }
    }
  })

  $effect(() => {
    const currentSortBy = sortBy

    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      let existing: Record<string, unknown> = {}
      if (stored) {
        try {
          existing = JSON.parse(stored)
        } catch {
          // Use empty object
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, sortBy: currentSortBy }))
    }
  })
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col">
  <header class="border-b border-border bg-primary px-4 py-3">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-fg md:text-xl">Umami Overview</h1>
      <div class="flex items-center gap-3">
        <ThemeToggle />
        <button
          type="button"
          onclick={() => (showSettings = true)}
          class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border p-1 text-sm text-fg-muted transition-colors hover:bg-tertiary sm:w-auto sm:gap-2 sm:p-2 sm:px-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4 md:size-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            /><circle cx="12" cy="12" r="3" /></svg
          >
          <span class="hidden md:block">Settings</span>
        </button>
      </div>
    </div>
  </header>

  <main class="flex-1">
    {@render children()}
  </main>
</div>

{#if showSettings}
  <SettingsModal onClose={() => (showSettings = false)} />
{/if}
