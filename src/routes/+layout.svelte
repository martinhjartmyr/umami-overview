<script lang="ts">
  import './layout.css'
  import { dev } from '$app/environment'
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

<svelte:head>
  <title>Umami Overview</title>
  {#if !dev}
    <script
      defer
      src="https://stats.novusy.com/script.js"
      data-website-id="ff13f097-7df5-4839-8882-5a5f2815afe4"
    ></script>
  {/if}
</svelte:head>

<div class="flex min-h-screen flex-col">
  <header class="border-b border-border bg-primary px-4 py-3">
    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-fg md:text-xl">Umami Overview</h1>
      <div class="flex items-center gap-3">
        <a
          href="https://github.com/martinhjartmyr/umami-overview"
          target="_blank"
          rel="noopener noreferrer"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-border p-1 text-fg-muted transition-colors hover:text-fg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4 md:size-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            />
          </svg>
        </a>
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
