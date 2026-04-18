<script lang="ts">
  import { getContext } from 'svelte'

  let { variant = 'icon' }: { variant?: 'icon' | 'segmented' } = $props()

  const viewContext = getContext<{
    get: () => 'cards' | 'table'
    set: (value: 'cards' | 'table') => void
  }>('viewMode')

  if (!viewContext) {
    throw new Error('view-toggle must be used within a viewMode context')
  }

  const viewMode = $derived(viewContext.get())
</script>

{#if variant === 'segmented'}
  <div class="inline-flex rounded-lg border border-border bg-primary p-0.5">
    <button
      type="button"
      class="rounded-md px-3 py-1.5 text-[10px] font-medium transition-colors sm:text-xs {viewMode ===
      'cards'
        ? 'bg-tertiary text-fg'
        : 'text-fg-subtle hover:text-fg'}"
      onclick={() => viewContext.set('cards')}
    >
      Cards
    </button>
    <button
      type="button"
      class="rounded-md px-3 py-1.5 text-[10px] font-medium transition-colors sm:text-xs {viewMode ===
      'table'
        ? 'bg-tertiary text-fg'
        : 'text-fg-subtle hover:text-fg'}"
      onclick={() => viewContext.set('table')}
    >
      Table
    </button>
  </div>
{:else}
  <div class="inline-flex rounded-lg border border-border bg-primary p-0.5">
    <button
      type="button"
      class="flex h-8 w-8 items-center justify-center rounded-md transition-colors {viewMode ===
      'cards'
        ? 'bg-tertiary text-fg'
        : 'text-fg-subtle hover:text-fg'}"
      onclick={() => viewContext.set('cards')}
      aria-label="Card view"
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
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    </button>
    <button
      type="button"
      class="flex h-8 w-8 items-center justify-center rounded-md transition-colors {viewMode ===
      'table'
        ? 'bg-tertiary text-fg'
        : 'text-fg-subtle hover:text-fg'}"
      onclick={() => viewContext.set('table')}
      aria-label="Table view"
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
        <path d="M12 3v18" />
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    </button>
  </div>
{/if}
