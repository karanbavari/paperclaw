# Plugin Authoring Smoke Example

A PaperClaw plugin

## Development

```bash
pnpm install
pnpm dev            # watch builds
pnpm dev:ui         # local dev server with hot-reload events
pnpm test
```

## Install Into PaperClaw

```bash
pnpm paperclaw plugin install ./
```

## Build Options

- `pnpm build` uses esbuild presets from `@kesarcloud/plugin-sdk/bundlers`.
- `pnpm build:rollup` uses rollup presets from the same SDK.
