<script lang="ts">
  import { themeState } from '$lib/state/theme.svelte'

  function cycleTheme() {
    const order: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto']
    const current = order.indexOf(themeState.theme)
    const next = order[(current + 1) % order.length]
    themeState.setTheme(next)
  }
</script>

<button
  onclick={cycleTheme}
  class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-border p-1 text-fg-muted transition-colors hover:bg-tertiary sm:p-2"
  title="Theme: {themeState.theme}"
>
  {#if themeState.theme === 'light'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="size-4 md:size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path
        d="m4.93 4.93 1.41 1.41"
      /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path
        d="m6.34 17.66-1.41 1.41"
      /><path d="m19.07 4.93-1.41 1.41" /></svg
    >
  {:else if themeState.theme === 'dark'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="size-4 md:size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
    >
  {:else}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="size-4 md:size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      ><rect width="20" height="14" x="2" y="3" rx="2" /><path d="M8 21h8" /><path
        d="M12 17v4"
      /></svg
    >
  {/if}
</button>
