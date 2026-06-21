"""
matcher.py — core route-similarity matching logic.

Grouping strategy ("loose overlap", as specified):
  Two passengers don't need similar pickup/destination points. What matters is
  whether a meaningful portion of their actual road paths overlap — e.g. one
  rider going Maadi -> Heliopolis and another going Zamalek -> Nasr City can
  still match if both routes pass through the same stretch of road downtown.

  We measure this by resampling both routes to evenly-spaced points (see
  encoder.py) and checking, for each point on route A, whether there's a
  point on route B within OVERLAP_DISTANCE_M of it. The overlap score is the
  fraction of route A's points that have such a "close enough" match on B
  (averaged with the reverse direction B->A, so the score is symmetric).

Safe Mode is enforced as a hard, non-negotiable filter: a Safe Mode request
will ONLY ever be grouped with passengers of the same gender. This check
happens before any route-similarity scoring, so it can never be "outvoted"
by a strong route match.
"""

from dataclasses import dataclass

from .encoder import haversine_m, resample_route, route_length_m
from .geocoder import get_route

# A point on route A counts as "overlapping" route B if some point on B falls
# within this many meters of it. ~120m is roughly "same street / adjacent
# parallel street" at city-driving scale.
OVERLAP_DISTANCE_M = 120.0

# Fraction of resampled points (0-1) that must overlap for two routes to be
# considered a viable match. Tunable: lower = looser matching, more groups;
# higher = stricter, fewer but more direct shared-route groups.
OVERLAP_THRESHOLD = 0.35

# Hard cap on passengers per ride (driver capacity), per product decision.
MAX_GROUP_SIZE = 4


@dataclass
class PassengerRequest:
    """Internal representation of a pending ride request for matching."""
    request_id: str
    passenger_id: str
    name: str
    rating: float
    gender: str  # 'MALE' | 'FEMALE' | 'OTHER'
    safe_mode: bool
    pickup: tuple[float, float]  # (lat, lng)
    destination: tuple[float, float]  # (lat, lng)
    scheduled_time: str  # ISO timestamp, used for coarse time-window filtering


@dataclass
class ScoredRoute:
    request: PassengerRequest
    route: list[tuple[float, float]]
    resampled: list[tuple[float, float]]
    length_m: float


def passes_safe_mode(a: PassengerRequest, b: PassengerRequest) -> bool:
    """
    Hard rule: if EITHER passenger has Safe Mode on, both must share the same
    gender. This is intentionally non-negotiable and independent of route
    score — it is checked first and short-circuits the match attempt.
    """
    if a.safe_mode or b.safe_mode:
        return a.gender == b.gender
    return True


def route_overlap_score(
    route_a: list[tuple[float, float]],
    route_b: list[tuple[float, float]],
) -> float:
    """
    Symmetric overlap score in [0, 1] between two resampled routes.

    1.0 means every sampled point on each route has a close match on the
    other route. 0.0 means no meaningful shared path at all.
    """
    if not route_a or not route_b:
        return 0.0

    def directional_overlap(src: list[tuple[float, float]], dst: list[tuple[float, float]]) -> float:
        if not src:
            return 0.0
        hits = 0
        for p in src:
            # Nearest-point check against dst. Routes are pre-resampled to a
            # bounded number of points (~city-trip length / 150m), so this
            # is fast enough without a spatial index for MVP scale.
            if any(haversine_m(p, q) <= OVERLAP_DISTANCE_M for q in dst):
                hits += 1
        return hits / len(src)

    a_to_b = directional_overlap(route_a, route_b)
    b_to_a = directional_overlap(route_b, route_a)
    return (a_to_b + b_to_a) / 2.0


async def score_request(request: PassengerRequest) -> ScoredRoute:
    """Fetch and resample a single passenger's route, ready for comparison."""
    route = await get_route(request.pickup, request.destination)
    resampled = resample_route(route)
    length = route_length_m(route)
    return ScoredRoute(request=request, route=route, resampled=resampled, length_m=length)


def _group_overlap_ok(candidate: ScoredRoute, group: list[ScoredRoute]) -> bool:
    """A candidate may join a group only if it overlaps sufficiently with
    EVERY existing member (not just one), so the whole group shares a
    reasonably common path rather than chaining loosely unrelated routes."""
    for member in group:
        if not passes_safe_mode(candidate.request, member.request):
            return False
        if route_overlap_score(candidate.resampled, member.resampled) < OVERLAP_THRESHOLD:
            return False
    return True


async def find_matches(
    new_request: PassengerRequest,
    pending_requests: list[PassengerRequest],
) -> list[PassengerRequest]:
    """
    Given a new ride request and the pool of other currently-pending requests,
    return the best group (including the new request) of up to MAX_GROUP_SIZE
    passengers whose routes overlap sufficiently and who pass Safe Mode.

    Returns an empty list if no viable group (size >= 2) is found — caller
    should treat that as "not matched yet, keep waiting".
    """
    new_scored = await score_request(new_request)

    candidates: list[ScoredRoute] = []
    for req in pending_requests:
        if req.request_id == new_request.request_id:
            continue
        if not passes_safe_mode(new_request, req):
            continue
        scored = await score_request(req)
        if route_overlap_score(new_scored.resampled, scored.resampled) >= OVERLAP_THRESHOLD:
            candidates.append(scored)

    # Sort candidates by overlap strength with the new request, strongest
    # first, so the group we build is centered on the best matches.
    candidates.sort(
        key=lambda c: route_overlap_score(new_scored.resampled, c.resampled),
        reverse=True,
    )

    group = [new_scored]
    for candidate in candidates:
        if len(group) >= MAX_GROUP_SIZE:
            break
        if _group_overlap_ok(candidate, group):
            group.append(candidate)

    if len(group) < 2:
        return []  # no viable match yet

    return [member.request for member in group]