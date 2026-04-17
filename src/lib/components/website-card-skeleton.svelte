<div class="grid w-full rounded-2xl bg-primary p-4 sm:p-6 lg:gap-3 xl:p-6 2xl:p-5">
  <div class="mb-4 flex items-start justify-between sm:mb-6 xl:mb-6 2xl:mb-5">
    <div class="flex min-w-0 flex-col gap-1">
      <div class="flex min-w-0 items-center gap-2 sm:gap-3 xl:gap-3 2xl:gap-2">
        <div
          class="size-4 shrink-0 animate-pulse rounded-sm bg-tertiary sm:size-6 xl:size-6 2xl:size-5"
        ></div>
        <div
          class="h-5 w-32 animate-pulse rounded bg-tertiary sm:h-7 sm:w-40 xl:h-7 xl:w-48 2xl:h-7 2xl:w-44"
        ></div>
      </div>
      <div
        class="h-3 w-48 animate-pulse rounded bg-tertiary sm:h-4 sm:w-56 xl:h-4 xl:w-64 2xl:h-4 2xl:w-52"
      ></div>
    </div>
    <div class="text-right">
      <div
        class="ml-auto h-5 w-12 animate-pulse rounded bg-tertiary sm:h-7 sm:w-16 xl:h-7 xl:w-14 2xl:h-6 2xl:w-12"
      ></div>
      <div
        class="mt-1 ml-auto h-2 w-10 animate-pulse rounded bg-tertiary sm:h-3 sm:w-12 xl:h-2 xl:w-10 2xl:h-2 2xl:w-8"
      ></div>
    </div>
  </div>

  <div class="mb-4 h-[100px] animate-pulse rounded bg-tertiary"></div>

  <div class="grid grid-cols-3 gap-4 sm:gap-6 xl:grid-cols-5 xl:gap-5 2xl:gap-4">
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array(5) as _, i (i)}
      <div class="{i >= 3 ? 'hidden xl:block' : ''} {i === 1 || i === 4 ? 'hidden md:block' : ''}">
        <div
          class="h-2 w-16 animate-pulse rounded bg-tertiary sm:h-3 sm:w-20 xl:h-2 xl:w-18 2xl:h-2 2xl:w-16"
        ></div>
        <div
          class="mt-2 h-5 w-12 animate-pulse rounded bg-tertiary sm:h-7 sm:w-16 xl:h-6 xl:w-14 2xl:h-6 2xl:w-12"
        ></div>
        <div
          class="mt-1 h-2 w-20 animate-pulse rounded bg-tertiary sm:h-3 sm:w-24 xl:h-2 xl:w-20 2xl:h-2 2xl:w-18"
        ></div>
      </div>
    {/each}
  </div>
</div>
