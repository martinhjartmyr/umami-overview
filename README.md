# Umami Overview

A dashboard overview for Umami analytics. View all your websites' statistics at a glance, including visitors, pageviews, and active users.

## Features

- **Overview dashboard**: See key metrics for all your Umami websites in one view
- **Sortable views**: Sort data by name, visitors, or active users
- **Dark/light mode**: Automatic theme based on system preference
- **Persistent settings**: Your preferences are saved locally

## Try it out

Use the hosted version at **[umami-overview.novusy.com](https://umami-overview.novusy.com)** or [try the demo with mock data](https://umami-overview.novusy.com/?mock).

## Deploy your own

### Prerequisites

- Node.js 20+
- pnpm 8+
- A Umami instance with API access

### Clone and run locally

```bash
git clone https://github.com/martinhjartmyre/umami-overview.git
cd umami-overview
pnpm install
pnpm dev
```

### Build for production

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

### Configuration

On first launch, click the **Settings** button in the header to enter your Umami instance URL and API credentials. Settings are stored locally in your browser.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest
- **Language**: TypeScript

## License

MIT
