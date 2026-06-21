"""
pickup_suggester.py — suggests a fair meetup point between two nearby (but
not identical) pickup locations.

When two matched passengers' pickup points are close but not the same, asking
the driver to stop at both individually adds detour time. This suggests a
single midpoint meetup spot that's roughly fair to both (geographic midpoint,
nudged onto the actual road network) and gives it a real, readable name.
"""

from dataclasses import dataclass

from matching.encoder import haversine_m
from matching.geocoder import get_route
from .poi_finder import find_nearby_place_name

# If two pickup points are already within this distance, there's no point
# suggesting a meetup spot — they're effectively the same location.
MIN_DISTANCE_FOR_SUGGESTION_M = 100.0

# Beyond this distance, a "walk to a shared meetup point" stops being
# reasonable for either passenger — better to just have the driver pick up
# both separately.
MAX_DISTANCE_FOR_SUGGESTION_M = 1500.0


@dataclass
class MeetupSuggestion:
    location: tuple[float, float]
    label: str
    distance_from_a_m: float
    distance_from_b_m: float
    worth_suggesting: bool


def _geographic_midpoint(a: tuple[float, float], b: tuple[float, float]) -> tuple[float, float]:
    return ((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0)


async def suggest_pickup_meetup(
    point_a: tuple[float, float],
    point_b: tuple[float, float],
) -> MeetupSuggestion:
    """
    Suggest a meetup point between two passengers' pickup locations.

    Strategy:
      1. Compute the geographic midpoint.
      2. Snap it onto the actual road network by requesting a route from A to
         B via OSRM and taking the route's own midpoint — this avoids
         suggesting a spot in the middle of a building block or canal.
      3. Look up a real place name for that snapped point.
    """
    raw_distance = haversine_m(point_a, point_b)

    if raw_distance < MIN_DISTANCE_FOR_SUGGESTION_M:
        # Already close enough — no separate meetup needed.
        label = await find_nearby_place_name(point_a)
        return MeetupSuggestion(
            location=point_a,
            label=label,
            distance_from_a_m=0.0,
            distance_from_b_m=raw_distance,
            worth_suggesting=False,
        )

    if raw_distance > MAX_DISTANCE_FOR_SUGGESTION_M:
        midpoint = _geographic_midpoint(point_a, point_b)
        label = await find_nearby_place_name(midpoint)
        return MeetupSuggestion(
            location=midpoint,
            label=label,
            distance_from_a_m=haversine_m(point_a, midpoint),
            distance_from_b_m=haversine_m(point_b, midpoint),
            worth_suggesting=False,  # too far apart to be a fair ask
        )

    # Snap the midpoint onto a real road by taking the midpoint of the
    # actual driving route between the two points, not a straight-line average.
    route = await get_route(point_a, point_b)
    snapped = route[len(route) // 2] if route else _geographic_midpoint(point_a, point_b)

    label = await find_nearby_place_name(snapped)

    return MeetupSuggestion(
        location=snapped,
        label=label,
        distance_from_a_m=haversine_m(point_a, snapped),
        distance_from_b_m=haversine_m(point_b, snapped),
        worth_suggesting=True,
    )