"""
encoder.py — turns a raw route polyline into a comparable representation.

Two routes almost never have the same number of points or the same point
spacing (one might be 2km through dense streets, another 8km on a highway).
To compare them fairly for "does this path overlap that path", we resample
each route to points spaced at a fixed real-world distance apart. That gives
us two point clouds we can compare point-to-point regardless of original
shape or length.
"""

import math

# Distance between resampled points along a route, in meters. Smaller = more
# precise overlap detection but more points to compare (slower). 150m is a
# reasonable granularity for city-street-level matching.
RESAMPLE_INTERVAL_M = 150.0

EARTH_RADIUS_M = 6_371_000.0


def haversine_m(p1: tuple[float, float], p2: tuple[float, float]) -> float:
    """Great-circle distance between two (lat, lng) points, in meters."""
    lat1, lng1 = p1
    lat2, lng2 = p2

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_M * c


def route_length_m(route: list[tuple[float, float]]) -> float:
    """Total length of a route polyline, in meters."""
    if len(route) < 2:
        return 0.0
    return sum(haversine_m(route[i], route[i + 1]) for i in range(len(route) - 1))


def resample_route(
    route: list[tuple[float, float]],
    interval_m: float = RESAMPLE_INTERVAL_M,
) -> list[tuple[float, float]]:
    """
    Resample a route polyline to points spaced ~interval_m apart.

    Walks along the polyline and linearly interpolates a new point every
    interval_m meters, regardless of how the original points were spaced.
    Always includes the route's start and end points.
    """
    if len(route) < 2:
        return list(route)

    resampled = [route[0]]
    carry_over = 0.0  # leftover distance from the previous segment

    for i in range(len(route) - 1):
        seg_start = route[i]
        seg_end = route[i + 1]
        seg_len = haversine_m(seg_start, seg_end)
        if seg_len == 0:
            continue

        # Position along this segment where the next sample point falls.
        dist_into_seg = interval_m - carry_over

        while dist_into_seg < seg_len:
            t = dist_into_seg / seg_len
            lat = seg_start[0] + (seg_end[0] - seg_start[0]) * t
            lng = seg_start[1] + (seg_end[1] - seg_start[1]) * t
            resampled.append((lat, lng))
            dist_into_seg += interval_m

        carry_over = seg_len - (dist_into_seg - interval_m)

    if resampled[-1] != route[-1]:
        resampled.append(route[-1])

    return resampled