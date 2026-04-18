<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
{#each Array(3) as _, i (i)}
  <tr class="border-b border-border/50">
    <td class="px-4 py-3">
      <div class="flex min-w-0 items-center gap-3">
        <div class="size-4 shrink-0 animate-pulse rounded-sm bg-tertiary"></div>
        <div class="min-w-0 space-y-2">
          <div class="h-4 max-w-24 animate-pulse rounded bg-tertiary"></div>
          <div class="h-3 max-w-36 animate-pulse rounded bg-tertiary"></div>
        </div>
      </div>
    </td>
    <td class="hidden w-32 px-4 py-3 sm:table-cell">
      <div class="h-10 animate-pulse rounded bg-tertiary"></div>
    </td>
    <td class="px-4 py-3 text-center sm:hidden">
      <div class="mx-auto h-4 w-8 animate-pulse rounded bg-tertiary"></div>
    </td>
    <td class="hidden px-4 py-3 text-center sm:table-cell">
      <div class="mx-auto h-4 w-8 animate-pulse rounded bg-tertiary"></div>
    </td>
    <td class="px-4 py-3 text-right">
      <div class="ml-auto h-4 w-10 animate-pulse rounded bg-tertiary"></div>
    </td>
    <td class="hidden px-4 py-3 md:table-cell">
      <div class="h-4 w-8 animate-pulse rounded bg-tertiary"></div>
    </td>
    <td class="hidden px-4 py-3 sm:table-cell">
      <div class="h-4 w-8 animate-pulse rounded bg-tertiary"></div>
    </td>
    <td class="hidden px-4 py-3 lg:table-cell">
      <div class="h-4 w-10 animate-pulse rounded bg-tertiary"></div>
    </td>
    <td class="hidden px-4 py-3 lg:table-cell">
      <div class="h-4 w-12 animate-pulse rounded bg-tertiary"></div>
    </td>
  </tr>
{/each}
