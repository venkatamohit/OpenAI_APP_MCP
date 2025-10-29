"""Skyward Rewards MCP server.

This server exposes flight offers via Model Context Protocol so that the app can
retrieve available itineraries and detailed pricing for cash vs. points redemptions.
"""

from __future__ import annotations

import datetime as dt
from dataclasses import dataclass
from typing import Dict, List

from dateutil import tz
from fastmcp import FastMCP, schema

mcp = FastMCP(app_id="skyward-rewards", version="0.1.0")


@dataclass
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


class FlightSummary(schema.BaseModel):
  id: str
  origin: str
  destination: str
  fare_class: str
  cash_price: int
  points_price: int
  duration_minutes: int
  departure_iso: str
  arrival_iso: str


class FlightDetail(FlightSummary):
  perks: List[str]


@mcp.tool()
def list_flights() -> List[FlightSummary]:
  """Return all available flight offers."""

  return [
    FlightSummary(
      id=flight.id,
      origin=flight.origin,
      destination=flight.destination,
      fare_class=flight.fare_class,
      cash_price=flight.cash_price,
      points_price=flight.points_price,
      duration_minutes=flight.duration_minutes,
      departure_iso=flight.departure.isoformat(),
      arrival_iso=flight.arrival.isoformat(),
    )
    for flight in FLIGHTS.values()
  ]


@mcp.tool()
def get_flight_detail(flight_id: str) -> FlightDetail:
  """Retrieve full pricing details for a flight."""

  flight = FLIGHTS.get(flight_id)
  if not flight:
    raise ValueError(f"Flight '{flight_id}' not found.")

  return FlightDetail(
    id=flight.id,
    origin=flight.origin,
    destination=flight.destination,
    fare_class=flight.fare_class,
    cash_price=flight.cash_price,
    points_price=flight.points_price,
    duration_minutes=flight.duration_minutes,
    departure_iso=flight.departure.isoformat(),
    arrival_iso=flight.arrival.isoformat(),
    perks=flight.perks,
  )


if __name__ == "__main__":
  mcp.run()
