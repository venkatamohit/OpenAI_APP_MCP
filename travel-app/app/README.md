# Skyward Rewards Front-End (Vite + React)

The `app/` workspace provides the Skyward Rewards booking experience that mirrors the ChatGPT widget. It is a Vite-powered React application written in TypeScript and styled with Material UI primitives.

## Features

- Reward-flight catalog with cash vs. points pricing cards and fare-cabin filter.
- Guided checkout path: `Continue to checkout` opens a demo login (credentials `test` / `testpass`), followed by a confirmation view with balance math and actionable buttons.
- Responsive layout tuned for embedding inside the ChatGPT widget shell.
- Production bundle exported to `dist/` for consumption by the MCP server.

## Project Structure

```
app/
├── index.html           # Vite entry point that mounts the React app
├── src/
│   ├── App.tsx          # Top-level UI and checkout/auth state machine
│   ├── components/
│   │   └── FlightCard.tsx  # Presentational card for individual itineraries
│   ├── main.tsx         # React root bootstrapping
│   └── styles.css       # Global styling helpers
├── vite.config.ts       # Vite + React plugin configuration
├── tsconfig*.json       # TypeScript compiler settings
├── package.json         # Scripts and dependency definitions
└── dist/                # Generated production assets (HTML, JS, CSS)
```

## Scripts

The project supports both `npm` and `pnpm`. Replace the runner with your preference.

| Script | Description |
| ------ | ----------- |
| `npm run dev` / `pnpm run dev` | Start the Vite dev server with live reload. |
| `npm run build` / `pnpm run build` | Produce the optimized bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally for smoke testing. |
| `pnpm run serve` | Uses the `serve` CLI to statically host `dist/` with CORS (needed when embedding via MCP). |

> Note: `pnpm run serve` requires the `serve` package installed (already declared in `devDependencies`).

## UI Flow

1. **Browse flights:** Users land on the catalog filtered by “All cabins.” Selecting a fare cabin rewrites the grid to only show matching itineraries.
2. **Inspect cards:** Each card highlights duration, cash fare, points fare, and included perks, with CTA buttons.
3. **Authenticate:** Clicking `Continue to checkout` captures the chosen flight and transitions to a modal-like full-screen login. The demo accepts `test` / `testpass`; wrong credentials surface an inline error.
4. **Finalize:** Successful login reveals a checkout summary with points balance calculations, cash comparison, and confirmation actions. Completing the booking triggers a demo alert and returns to browsing.

## Development Notes

- When the UI changes, always re-run `npm run build` so the MCP server can inline the latest `dist/` assets.
- The initial flight data is sourced from the static array in `App.tsx`. Replace it with API calls when wiring to live data.
- Material UI’s `<Chip>` component powers the perk tags; tweak colors or typography in `FlightCard.tsx`.

## Environment

No environment variables are required for the sample. If you introduce real services (authentication, pricing APIs), add a `.env` file and configure Vite to expose the required keys via `import.meta.env`.

