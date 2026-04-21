<script lang="ts">
  import { dataStore, exportSettings, importSettings } from '$lib/state/data.state.svelte'

  let { onClose }: { onClose: () => void } = $props()

  let apiUrl = $state(dataStore.settings?.apiUrl ?? '')
  let username = $state(dataStore.settings?.username ?? '')
  let password = $state(dataStore.settings?.password ?? '')
  let refreshInterval = $state<number | null>(dataStore.refreshInterval ?? null)
  let isConnecting = $state(false)
  let localError = $state<string | null>(null)
  let showImportModal = $state(false)
  let importJson = $state('')
  let importError = $state<string | null>(null)
  let exportCopied = $state(false)

  const refreshOptions = [
    { value: null, label: 'Disabled' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
    { value: 3600, label: '1 hour' },
  ]

  const isConnected = $derived(dataStore.settings !== null)

  async function handleSave() {
    localError = null

    if (!apiUrl.trim()) {
      localError = 'API URL is required'
      return
    }

    const hasCredentials = username.trim() && password.trim()

    if (!hasCredentials) {
      localError = 'Username and password are required'
      return
    }

    isConnecting = true

    try {
      await dataStore.saveSettings(
        {
          apiUrl: apiUrl.trim(),
          username: username.trim() || undefined,
          password: password.trim() || undefined,
        },
        refreshInterval,
      )

      if (dataStore.error) {
        localError = dataStore.error
      } else {
        onClose()
      }
    } finally {
      isConnecting = false
    }
  }

  function handleReset() {
    dataStore.clearSettings()
    apiUrl = ''
    username = ''
    password = ''
    refreshInterval = null
    onClose()
  }

  function handleCancel() {
    onClose()
  }

  async function handleExport() {
    const json = exportSettings()
    await navigator.clipboard.writeText(json)
    exportCopied = true
    setTimeout(() => (exportCopied = false), 2000)
  }

  function handleImportClick() {
    showImportModal = true
    importJson = ''
    importError = null
  }

  async function handleImportConfirm() {
    const result = await importSettings(importJson)
    if (result.success) {
      showImportModal = false
      onClose()
    } else {
      importError = result.error ?? 'Import failed'
    }
  }

  function handleImportCancel() {
    showImportModal = false
    importJson = ''
    importError = null
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center"
  style="background-color: rgba(0,0,0,0.5);"
  onclick={onClose}
  onkeydown={(e) => e.key === 'Escape' && onClose()}
  role="presentation"
>
  <div
    class="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-primary px-6 py-6"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <h2 class="mb-6 text-xl font-semibold text-fg">Settings</h2>

    {#if localError}
      <div class="mb-4 rounded-md bg-negative/30 p-3 text-sm text-negative">
        {localError}
      </div>
    {/if}

    <form
      onsubmit={(e) => {
        e.preventDefault()
        handleSave()
      }}
      class="space-y-4"
    >
      <div>
        <label for="apiUrl" class="block text-sm font-medium text-fg-muted"> API URL </label>
        <input
          type="url"
          id="apiUrl"
          bind:value={apiUrl}
          placeholder="https://umami.example.com"
          class="mt-1 block w-full rounded-md border border-border bg-primary px-3 py-2 text-fg shadow-sm focus:border-indigo-500 focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:gap-4">
        <div class="flex-1">
          <label for="username" class="block text-sm font-medium text-fg-muted"> Username </label>
          <input
            type="text"
            id="username"
            bind:value={username}
            class="mt-1 block w-full rounded-md border border-border bg-primary px-3 py-2 text-fg shadow-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div class="flex-1">
          <label for="password" class="block text-sm font-medium text-fg-muted"> Password </label>
          <input
            type="password"
            id="password"
            bind:value={password}
            class="mt-1 block w-full rounded-md border border-border bg-primary px-3 py-2 text-fg shadow-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label for="refreshInterval" class="block text-sm font-medium text-fg-muted">
          Auto Refresh
        </label>
        <div class="relative mt-1">
          <select
            id="refreshInterval"
            bind:value={refreshInterval}
            class="block w-full appearance-none rounded-md border border-border bg-primary px-3 py-2 pr-10 text-fg shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            {#each refreshOptions as option (option.value)}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div class="mt-6 border-t border-border pt-4">
        <p class="block text-sm font-medium text-fg-muted">Import / Export</p>
        <div class="mt-2 flex gap-3">
          <button
            type="button"
            onclick={handleExport}
            class="rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-fg hover:bg-tertiary"
          >
            {exportCopied ? 'Copied!' : 'Export'}
          </button>
          <button
            type="button"
            onclick={handleImportClick}
            class="rounded-md border border-border bg-primary px-4 py-2 text-sm font-medium text-fg hover:bg-tertiary"
          >
            Import
          </button>
        </div>
      </div>

      <div class="mt-6 flex justify-between">
        {#if isConnected}
          <button
            type="button"
            onclick={handleReset}
            class="rounded-md px-4 py-2 text-sm font-medium"
            style="color: #f87171;"
          >
            Reset
          </button>
        {:else}
          <div></div>
        {/if}

        <div class="flex gap-3">
          <button
            type="button"
            onclick={handleCancel}
            class="rounded-md px-4 py-2 text-sm font-medium text-fg-muted hover:opacity-80"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isConnecting}
            class="rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            style="background-color: #4f46e5;"
          >
            {isConnecting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </form>

    {#if showImportModal}
      <div
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background-color: rgba(0,0,0,0.5);"
        onclick={handleImportCancel}
        onkeydown={(e) => e.key === 'Escape' && handleImportCancel()}
        role="presentation"
      >
        <div
          class="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-primary px-6 py-6"
          onclick={(e) => e.stopPropagation()}
          onkeydown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          tabindex="-1"
        >
          <h3 class="mb-4 text-lg font-semibold text-fg">Import Settings</h3>

          {#if importError}
            <div class="mb-4 rounded-md bg-negative/30 p-3 text-sm text-negative">
              {importError}
            </div>
          {/if}

          <label for="importJson" class="block text-sm font-medium text-fg-muted">
            Paste settings JSON
          </label>
          <textarea
            id="importJson"
            bind:value={importJson}
            rows={6}
            class="mt-1 block w-full rounded-md border border-border bg-primary px-3 py-2 text-fg shadow-sm focus:border-indigo-500 focus:outline-none"
            placeholder={'\'{"theme":"dark","umami":{"apiUrl":"https://..."},"sortBy":"visitors"}\''}
          ></textarea>

          <div class="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onclick={handleImportCancel}
              class="rounded-md px-4 py-2 text-sm font-medium text-fg-muted hover:opacity-80"
            >
              Cancel
            </button>
            <button
              type="button"
              onclick={handleImportConfirm}
              class="rounded-md px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              style="background-color: #4f46e5;"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
