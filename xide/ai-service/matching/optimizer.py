"""
optimizer.py — pickup order optimization.

Given a matched group (up to 4 passengers) and the driver's starting point,
find the order to pick everyone up that minimizes total travel distance
(driver start -> pickup 1 -> pickup 2 -> ... -> last pickup).

Group size is capped at MAX_GROUP_SIZE (4), so the number of possible pickup
orderings is at most 4! = 24. Brute-forcing every permutation and picking the
shortest is simpler and more reliable than a heuristic at this scale, with no
real performance cost.
"""

from dataclasses import dataclass
from itertools import permutations

from .encoder import haversine_m


@dataclass
class PickupStop:
    passenger_id: str
    location: tuple[float, float]  # (lat, lng)


def _route_distance(driver_start: tuple[float, float], ordered_stops: list[PickupStop]) -> float:
    total = 0.0
    current = driver_start
    for stop in ordered_stops:
        total += haversine_m(current, stop.location)
        current = stop.location
    return total


def optimize_pickup_order(
    driver_location: tuple[float, float],
    passengers: list[PickupStop],
) -> list[PickupStop]:
    """
    Returns passengers re-ordered into the sequence that minimizes total
    pickup-leg distance starting from driver_location.

    Brute-force over all permutations — fine for group sizes up to 4
    (max 24 permutations). Falls back to the original order for 0-1
    passengers (nothing to optimize).
    """
    if len(passengers) <= 1:
        return list(passengers)

    best_order: list[PickupStop] = list(passengers)
    best_distance = float("inf")

    for perm in permutations(passengers):
        dist = _route_distance(driver_location, list(perm))
        if dist < best_distance:
            best_distance = dist
            best_order = list(perm)

    return best_order


def estimate_total_detour_m(
    driver_location: tuple[float, float],
    optimized_stops: list[PickupStop],
) -> float:
    """Total distance the driver covers picking everyone up, in the optimized order."""
    return _route_distance(driver_location, optimized_stops)