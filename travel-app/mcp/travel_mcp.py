"""Skyward Rewards MCP server implemented with the Python FastMCP helper.

The server mirrors the travel sample UI and exposes widget-backed tools that
render the flight offers bundle. Each handler returns the built HTML shell via
an MCP resource and echoes the flight pricing data as structured content so the
ChatGPT client can hydrate the widget. The module also wires the handlers into
an HTTP/SSE stack so you can run the server with uvicorn on port 8000."""

from __future__ import annotations

import datetime as dt
import re
from copy import deepcopy
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

import mcp.types as types
from dateutil import tz
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, ConfigDict, Field, ValidationError


@dataclass(frozen=True)
class TravelWidget:
    identifier: str
    title: str
    template_uri: str
    invoking: str
    invoked: str
    asset_name: str
    html: str
    response_text: str


@dataclass(frozen=True)
class Flight:
    id: str
    origin: str
    destination: str
    departure: dt.datetime
    arrival: dt.datetime
    fare_class: str
    duration_minutes: int
    cash_price: int
    points_price: int
    perks: List[str]


ASSETS_DIR = Path(__file__).resolve().parent.parent / "app" / "dist"


@lru_cache(maxsize=None)
def _load_widget_html(component_name: str) -> str:
    html_path = ASSETS_DIR / f"{component_name}.html"
    if not html_path.exists():
        fallback_candidates = sorted(ASSETS_DIR.glob(f"{component_name}-*.html"))
        if fallback_candidates:
            html_path = fallback_candidates[-1]
        else:
            index_path = ASSETS_DIR / "index.html"
            if index_path.exists():
                html_path = index_path
            else:
                raise FileNotFoundError(
                    f'Widget HTML for "{component_name}" not found in {ASSETS_DIR}. '
                    "Run `pnpm run build` inside the app directory before starting the server."
                )

    html = html_path.read_text(encoding="utf8")
    return _inline_asset_references(html)


def _inline_asset_references(html: str) -> str:
    def _inline_script(match: re.Match[str]) -> str:
        src = match.group(1)
        asset_path = (ASSETS_DIR / src.lstrip("/")).resolve()
        if not asset_path.exists():
            return match.group(0)
        script = asset_path.read_text(encoding="utf8")
        return f'<script type="module">\n{script}\n</script>'

    def _inline_style(match: re.Match[str]) -> str:
        href = match.group(1)
        asset_path = (ASSETS_DIR / href.lstrip("/")).resolve()
        if not asset_path.exists():
            return match.group(0)
        css = asset_path.read_text(encoding="utf8")
        return f"<style>\n{css}\n</style>"

    html = re.sub(
        r'<script\s+type="module"\s+[^>]*src="([^"]+)"[^>]*></script>',
        _inline_script,
        html,
        flags=re.IGNORECASE,
    )
    html = re.sub(
        r'<link\s+[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*/?>',
        _inline_style,
        html,
        flags=re.IGNORECASE,
    )
    return html


widgets: List[TravelWidget] = [
    TravelWidget(
        identifier="skyward-flight-offers",
        title="Skyward Flight Offers",
        template_uri="ui://widget/skyward-flight-offers.html",
        invoking="Charting reward flights",
        invoked="Displayed reward flight offers",
        asset_name="index",
        html=_load_widget_html("index"),
        response_text="Rendered the Skyward Rewards flight explorer.",
    ),
]


MIME_TYPE = "text/html+skybridge"


WIDGETS_BY_ID: Dict[str, TravelWidget] = {widget.identifier: widget for widget in widgets}
WIDGETS_BY_URI: Dict[str, TravelWidget] = {widget.template_uri: widget for widget in widgets}


FLIGHTS: Dict[str, Flight] = {
    "SEA-JFK-001": Flight(
        id="SEA-JFK-001",
        origin="Seattle",
        destination="New York (JFK)",
        departure=dt.datetime(2024, 7, 12, 9, 30, tzinfo=tz.gettz("America/Los_Angeles")),
        arrival=dt.datetime(2024, 7, 12, 17, 50, tzinfo=tz.gettz("America/New_York")),
        fare_class="Business Flex",
        duration_minutes=320,
        cash_price=689,
        points_price=55200,
        perks=["2 checked bags", "Lounge access", "Priority boarding"],
    ),
    "SFO-CDG-101": Flight(
        id="SFO-CDG-101",
        origin="San Francisco",
        destination="Paris (CDG)",
        departure=dt.datetime(2024, 8, 4, 13, 5, tzinfo=tz.gettz("America/Los_Angeles")),
        arrival=dt.datetime(2024, 8, 5, 9, 35, tzinfo=tz.gettz("Europe/Paris")),
        fare_class="Premium Select",
        duration_minutes=640,
        cash_price=1149,
        points_price=86400,
        perks=["Lie-flat seat", "Fine dining", "Arrivals lounge access"],
    ),
    "ATL-CUN-207": Flight(
        id="ATL-CUN-207",
        origin="Atlanta",
        destination="Cancún (CUN)",
        departure=dt.datetime(2024, 6, 18, 7, 15, tzinfo=tz.gettz("America/New_York")),
        arrival=dt.datetime(2024, 6, 18, 10, 55, tzinfo=tz.gettz("America/Cancun")),
        fare_class="SkyComfort",
        duration_minutes=160,
        cash_price=289,
        points_price=22400,
        perks=["Extra legroom", "Welcome beverage"],
    ),
}


class FlightQueryInput(BaseModel):
    """Schema for filtering the Skyward Rewards widget."""

    fare_cabin: Optional[str] = Field(
        default=None,
        alias="fareCabin",
        description="Optional cabin to filter results (e.g. Business Flex).",
    )

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


mcp = FastMCP(
    name="skyward-rewards",
    stateless_http=True,
)


TOOL_INPUT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "fareCabin": {
            "type": "string",
            "description": "Optional cabin to filter the flight offers.",
        }
    },
    "required": [],
    "additionalProperties": False,
}


def _resource_description(widget: TravelWidget) -> str:
    return f"{widget.title} widget markup"


def _tool_meta(widget: TravelWidget) -> Dict[str, Any]:
    return {
        "openai/outputTemplate": widget.template_uri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": True,
        "openai/resultCanProduceWidget": True,
    }


def _embedded_widget_resource(widget: TravelWidget) -> types.EmbeddedResource:
    return types.EmbeddedResource(
        type="resource",
        resource=types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            title=widget.title,
        ),
    )


def _available_cabins() -> List[str]:
    return sorted({flight.fare_class for flight in FLIGHTS.values()})


def _serialize_flight(flight: Flight) -> Dict[str, Any]:
    return {
        "id": flight.id,
        "origin": flight.origin,
        "destination": flight.destination,
        "departure": flight.departure.isoformat(),
        "arrival": flight.arrival.isoformat(),
        "durationMinutes": flight.duration_minutes,
        "fareClass": flight.fare_class,
        "cashPrice": flight.cash_price,
        "pointsPrice": flight.points_price,
        "perks": list(flight.perks),
    }


@mcp._mcp_server.list_tools()
async def _list_tools() -> List[types.Tool]:
    return [
        types.Tool(
            name=widget.identifier,
            title=widget.title,
            description=widget.title,
            inputSchema=deepcopy(TOOL_INPUT_SCHEMA),
            _meta=_tool_meta(widget),
            annotations={
                "destructiveHint": False,
                "openWorldHint": False,
                "readOnlyHint": True,
            },
        )
        for widget in widgets
    ]


@mcp._mcp_server.list_resources()
async def _list_resources() -> List[types.Resource]:
    return [
        types.Resource(
            name=widget.title,
            title=widget.title,
            uri=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


@mcp._mcp_server.list_resource_templates()
async def _list_resource_templates() -> List[types.ResourceTemplate]:
    return [
        types.ResourceTemplate(
            name=widget.title,
            title=widget.title,
            uriTemplate=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


async def _handle_read_resource(req: types.ReadResourceRequest) -> types.ServerResult:
    widget = WIDGETS_BY_URI.get(str(req.params.uri))
    if widget is None:
        return types.ServerResult(
            types.ReadResourceResult(
                contents=[],
                _meta={"error": f"Unknown resource: {req.params.uri}"},
            )
        )

    contents = [
        types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            _meta=_tool_meta(widget),
        )
    ]

    return types.ServerResult(types.ReadResourceResult(contents=contents))


async def _call_tool_request(req: types.CallToolRequest) -> types.ServerResult:
    widget = WIDGETS_BY_ID.get(req.params.name)
    if widget is None:
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Unknown tool: {req.params.name}",
                    )
                ],
                isError=True,
            )
        )

    arguments = req.params.arguments or {}
    try:
        payload = FlightQueryInput.model_validate(arguments)
    except ValidationError as exc:
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Input validation error: {exc.errors()}",
                    )
                ],
                isError=True,
            )
        )

    flights = list(FLIGHTS.values())
    if payload.fare_cabin:
        flights = [
            flight
            for flight in flights
            if flight.fare_class.lower() == payload.fare_cabin.lower()
        ]

    structured_content = {
        "flights": [_serialize_flight(flight) for flight in flights],
        "availableCabins": _available_cabins(),
        "selectedCabin": payload.fare_cabin or "All cabins",
    }

    widget_resource = _embedded_widget_resource(widget)
    meta: Dict[str, Any] = {
        "openai.com/widget": widget_resource.model_dump(mode="json"),
        "openai/outputTemplate": widget.template_uri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": True,
        "openai/resultCanProduceWidget": True,
    }

    return types.ServerResult(
        types.CallToolResult(
            content=[
                types.TextContent(
                    type="text",
                    text=widget.response_text,
                )
            ],
            structuredContent=structured_content,
            _meta=meta,
        )
    )


mcp._mcp_server.request_handlers[types.CallToolRequest] = _call_tool_request
mcp._mcp_server.request_handlers[types.ReadResourceRequest] = _handle_read_resource


app = mcp.streamable_http_app()

try:
    from starlette.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=False,
    )
except Exception:
    pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("travel_mcp:app", host="0.0.0.0", port=8000)
