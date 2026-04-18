<script lang="ts">
  import { getContext } from 'svelte'

  const sortContext = getContext<{
    get: () => 'name' | 'visitors' | 'active'
    set: (value: 'name' | 'visitors' | 'active') => void
  }>('sortBy')

  if (!sortContext) {
    throw new Error('sort-select must be used within a sortBy context')
  }

  const sortBy = $derived(sortContext.get())
</script>

<div
  class="inline-flex rounded-lg border border-border bg-primary p-0.5"
  aria-label="Sort websites by"
>
  <button
    type="button"
    class="rounded-md px-3 py-1.5 text-[10px] font-medium transition-colors sm:text-xs {sortBy ===
    'name'
      ? 'bg-tertiary text-fg'
      : 'text-fg-subtle hover:text-fg'}"
    onclick={() => sortContext.set('name')}
  >
    Name
  </button>
  <button
    type="button"
    class="rounded-md px-3 py-1.5 text-[10px] font-medium transition-colors sm:text-xs {sortBy ===
    'visitors'
      ? 'bg-tertiary text-fg'
      : 'text-fg-subtle hover:text-fg'}"
    onclick={() => sortContext.set('visitors')}
  >
    Visitors
  </button>
  <button
    type="button"
    class="rounded-md px-3 py-1.5 text-[10px] font-medium transition-colors sm:text-xs {sortBy ===
    'active'
      ? 'bg-tertiary text-fg'
      : 'text-fg-subtle hover:text-fg'}"
    onclick={() => sortContext.set('active')}
  >
    Active
  </button>
</div>
