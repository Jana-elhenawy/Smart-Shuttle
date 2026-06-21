"""
poi_finder.py — finds a real, nameable place near a given coordinate.

A raw midpoint coordinate ("30.0421, 31.2287") means nothing to a passenger.
This module turns a coordinate into something a human can actually meet at —
e.g. "Mostafa Mahmoud Square" or the nearest named street/landmark — using
Nominatim's free reverse-geocoding API (same OpenStreetMap service already
used in the frontend's lib/nominatim.ts, kept consistent on purpose).

NOTE: Nominatim's public usage policy requires a descriptive User-Agent and
caps requests at ~1/second. Fine for MVP suggestion calls (low frequency,
one-off lookups), not meant for bulk geocoding.
"""

import httpx

REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"
USER_AGENT = "Tripzy/1.0 tripzy@app.com"  # matches frontend/lib/nominatim.ts
TIMEOUT_SECONDS = 5.0


async def find_nearby_place_name(point: tuple[float, float]) -> str:
    """
    Reverse-geocode a (lat, lng) point into a human-readable place name.

    Returns a short, displayable label (e.g. "Mostafa Mahmoud Square, Dokki")
    or a formatted coordinate string as a safe fallback if the lookup fails.
    """
    lat, lng = point
    params = {"lat": lat, "lon": lng, "format": "json"}

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            resp = await client.get(
                REVERSE_URL, params=params, headers={"User-Agent": USER_AGENT}
            )
            resp.raise_for_status()
            data = resp.json()
            return _format_label(data, fallback=(lat, lng))
    except (httpx.HTTPError, ValueError, KeyError):
        return f"{lat:.4f}, {lng:.4f}"


def _format_label(data: dict, fallback: tuple[float, float]) -> str:
    display_name = data.get("display_name")
    if not display_name:
        lat, lng = fallback
        return f"{lat:.4f}, {lng:.4f}"

    # display_name is usually a long comma-separated address; keep the first
    # 2 segments (e.g. "Mostafa Mahmoud Square, Dokki") for a clean label
    # instead of the full multi-part address.
    parts = [p.strip() for p in display_name.split(",")]
    return ", ".join(parts[:2])