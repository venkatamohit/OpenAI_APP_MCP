# Skyward Rewards MCP Server (Python)

The `mcp/` workspace implements the Skyward Rewards Model Context Protocol (MCP) server using the Python `fastmcp` helper. It exposes the travel experience to ChatGPT clients through widget-backed tools.

## Features

- Serves the Vite bundle from `app/dist/` as a Skybridge-compatible widget resource.
- Provides a single tool (`skyward-flight-offers`) that returns flight listings, available cabins, and selected cabin metadata.
- Supports optional filtering via `fareCabin`, mirroring the UI dropdown.
- Ships with demo flight data, including cash and points pricing, for three curated itineraries.
- Exposes an HTTP/SSE app (`travel_mcp:app`) suitable for running under Uvicorn.

## Project Structure

```
mcp/
├── travel_mcp.py     # Main FastMCP implementation
├── requirements.txt  # Python dependencies
└── __pycache__/      # Bytecode artifacts (generated)
```

### Key Sections (`travel_mcp.py`)

- **Widget declarations:** `TravelWidget` dataclass plus the `widgets` list define the MCP tool metadata and template URIs.
- **Asset loading:** `_load_widget_html` and `_inline_asset_references` read `app/dist/index.html`, inline `<script>` / `<link>` assets, and cache them so the widget is self-contained.
- **Flight catalog:** `FLIGHTS` map stores sample itineraries; `_serialize_flight` converts them to JSON-serializable payloads.
- **Tool handlers:** `_call_tool_request` validates arguments with `FlightQueryInput`, filters flights, and returns structured content alongside the embedded widget resource.
- **Resource handlers:** `_list_resources`, `_list_tools`, `_handle_read_resource`, etc., describe the widget to the MCP runtime.
- **Transport setup:** `app = mcp.streamable_http_app()` plus the optional CORS middleware and `uvicorn.run` entry point provide the HTTP interface.

## Setup

```bash
cd mcp
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Ensure the front-end bundle exists before starting the server:

```bash
cd ../app
pnpm install         # or npm install
pnpm run build
cd ../mcp
uvicorn travel_mcp:app --port 8000
```

## Tool Contract

| Tool name | Input schema | Description |
| --------- | ------------ | ----------- |
| `skyward-flight-offers` | `{ "fareCabin": string? }` | Returns the widget markup and structured flight data filtered by the optional cabin. |

**Structured response fields**

- `flights`: Array of objects with `id`, `origin`, `destination`, `departure`, `arrival`, `durationMinutes`, `fareClass`, `cashPrice`, `pointsPrice`, and `perks`.
- `availableCabins`: Distinct list of cabin names.
- `selectedCabin`: Echo of the requested cabin, defaulting to `"All cabins"`.

## Extensibility

- Swap the static flights for live API calls by replacing the `FLIGHTS` dictionary and `_serialize_flight` logic.
- Add more tools or widgets by extending the `widgets` list and registering additional handlers.
- Customize CORS or transport behavior by adjusting the Starlette middleware configuration.

## Troubleshooting

- **Widget not updating:** Restart the MCP process after rebuilding the front-end to clear the `@lru_cache` around `_load_widget_html`.
- **Missing assets:** Confirm `app/dist/` exists and includes `index.html`. The server raises a descriptive error if the bundle is absent.

