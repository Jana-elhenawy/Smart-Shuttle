"""
destination_suggester.py — suggests a fair meetup/drop-off point between two
nearby (but not identical) destinations.

Same approach as pickup_suggester.py, applied to drop-off points: if two
matched passengers are headed to slightly different destinations, suggest a
shared drop-off spot that's a fair, real, named compromise rather than making
the driver zigzag between two separate addresses.
"""

from dataclasses import dataclass

from matching.encoder import haversine_m
from matching.geocoder import get_route
from .poi_finder import find_nearby_place_name

MIN_DISTANCE_FOR_SUGGESTION_M = 100.0
MAX_DISTANCE_FOR_SUGGESTION_M = 1500.0


@dataclass
class DropoffSuggestion:
    location: tuple[float, float]
    label: str
    distance_from_a_m: float
    distance_from_b_m: float
    worth_suggesting: bool


def _geographic_midpoint(a: tuple[float, float], b: tuple[float, float]) -> tuple[float, float]:
    return ((a[0] + b[0]) / 2.0, (a[1] + b[1]) / 2.0)


async def suggest_destination_meetup(
    point_a: tuple[float, float],
    point_b: tuple[float, float],
) -> DropoffSuggestion:
    """
    Suggest a shared drop-off point between two passengers' destinations.
    Mirrors suggest_pickup_meetup's logic: snap the midpoint onto the actual
    road route between the two points, then resolve a real place name.
    """
    raw_distance = haversine_m(point_a, point_b)

    if raw_distance < MIN_DISTANCE_FOR_SUGGESTION_M:
        label = await find_nearby_place_name(point_a)
        return DropoffSuggestion(
            location=point_a,
            label=label,
            distance_from_a_m=0.0,
            distance_from_b_m=raw_distance,
            worth_suggesting=False,
        )

    if raw_distance > MAX_DISTANCE_FOR_SUGGESTION_M:
        midpoint = _geographic_midpoint(point_a, point_b)
        label = await find_nearby_place_name(midpoint)
        return DropoffSuggestion(
            location=midpoint,
            label=label,
            distance_from_a_m=haversine_m(point_a, midpoint),
            distance_from_b_m=haversine_m(point_b, midpoint),
            worth_suggesting=False,
        )

    route = await get_route(point_a, point_b)
    snapped = route[len(route) // 2] if route else _geographic_midpoint(point_a, point_b)

    label = await find_nearby_place_name(snapped)

    return DropoffSuggestion(
        location=snapped,
        label=label,
        distance_from_a_m=haversine_m(point_a, snapped),
        distance_from_b_m=haversine_m(point_b, snapped),
        worth_suggesting=True,
    )