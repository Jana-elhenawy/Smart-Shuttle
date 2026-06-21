"""
geocoder.py — route geometry fetching via OSRM (Open Source Routing Machine).

We use OSRM's free public demo server (router.project-osrm.org) to get a real,
road-following polyline between two points instead of a straight line. This is
what makes "route overlap" matching meaningful (two people whose roads cross
through the same streets, not just whose endpoints happen to be near each other).

IMPORTANT: router.project-osrm.org is a free DEMO server. It is rate-limited
and explicitly NOT intended for production traffic. It's a great fit for an
MVP / hackathon build. Before any real launch, swap BASE_URL for either:
  - a self-hosted OSRM instance, or
  - a paid routing provider (Mapbox Directions, Google Directions, etc.)
with the same response shape adapted in `_parse_osrm_response`.
"""

import httpx

BASE_URL = "https://router.project-osrm.org/route/v1/driving"

# Network timeout for the routing call. Kept short so a slow/unavailable demo
# server degrades gracefully (see fallback in get_route) instead of hanging
# the whole match request.
TIMEOUT_SECONDS = 5.0


async def get_route(
    origin: tuple[float, float],
    destination: tuple[float, float],
) -> list[tuple[float, float]]:
    """
    Fetch a road-following route between origin and destination.

    Args:
        origin: (lat, lng)
        destination: (lat, lng)

    Returns:
        List of (lat, lng) points along the route, ordered from origin to
        destination. Falls back to a straight 2-point line if OSRM is
        unreachable or returns an error, so callers never have to special-case
        a missing route.
    """
    o_lat, o_lng = origin
    d_lat, d_lng = destination

    # OSRM expects lng,lat order in the URL (GeoJSON convention), not lat,lng.
    url = f"{BASE_URL}/{o_lng},{o_lat};{d_lng},{d_lat}"
    params = {"overview": "full", "geometries": "geojson"}

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            return _parse_osrm_response(data)
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        # Network hiccup, rate limit, or unexpected response shape — fall back
        # to a straight line so matching can still proceed approximately.
        return [origin, destination]


def _parse_osrm_response(data: dict) -> list[tuple[float, float]]:
    routes = data.get("routes", [])
    if not routes:
        raise ValueError("OSRM returned no routes")

    coords = routes[0]["geometry"]["coordinates"]  # list of [lng, lat]
    # Convert back to (lat, lng) to match the rest of the codebase's convention.
    return [(lat, lng) for lng, lat in coords]