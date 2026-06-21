"""
router.py — FastAPI routes for the Tripzy AI engine.

Wires together matcher.py, optimizer.py, pickup_suggester.py, and
destination_suggester.py into HTTP endpoints. Request/response shapes are
written to match frontend/types/index.ts exactly (AiMatchRequest,
AiMatchResponse) so the Next.js side in lib/ai-engine.ts needs no changes.

NOTE on state: this MVP keeps pending ride requests in an in-memory list
(see PENDING_REQUESTS below) for simplicity. That means matching only works
within a single running process and resets on restart. The real source of
truth for ride_requests is Supabase — wiring this engine to read live pending
requests from Supabase (instead of/alongside the in-memory list) is a
reasonable next step once you're ready, but is intentionally out of scope
here since it touches your DB credentials and schema directly.
"""

from datetime import datetime, timezone

from fastapi import APIRouter
from pydantic import BaseModel

from .matcher import PassengerRequest, find_matches
from .optimizer import PickupStop, optimize_pickup_order, estimate_total_detour_m
from .encoder import route_length_m
from .geocoder import get_route
from suggestions.pickup_suggester import suggest_pickup_meetup
from suggestions.destination_suggester import suggest_destination_meetup

router = APIRouter()

# In-memory pending request pool. See module docstring re: Supabase as the
# real next step. Cleared on server restart by design (no persistence claims).
PENDING_REQUESTS: list[PassengerRequest] = []


# ---- Request / response models (mirrors frontend/types/index.ts) ----------

class LocationIn(BaseModel):
    lat: float
    lng: float
    address: str


class AiMatchRequestIn(BaseModel):
    request_id: str
    pickup: LocationIn
    destination: LocationIn
    scheduled_time: str
    safe_mode: bool
    passenger_gender: str  # 'MALE' | 'FEMALE' | 'OTHER'
    passenger_name: str = "Passenger"
    passenger_rating: float = 5.0


class MatchedPassengerOut(BaseModel):
    passenger_id: str
    name: str
    rating: float
    pickup: LocationIn
    pickup_order: int
    fare_share: float


class AiMatchResponseOut(BaseModel):
    matched: bool
    group: list[MatchedPassengerOut]
    route_polyline: list[list[float]]
    pickup_order: list[MatchedPassengerOut]
    total_distance_km: float
    estimated_duration_min: float
    total_fare: float
    your_fare: float
    depart_at: str


class PointIn(BaseModel):
    lat: float
    lng: float


class SuggestMeetupIn(BaseModel):
    point_a: PointIn
    point_b: PointIn


class SuggestMeetupOut(BaseModel):
    lat: float
    lng: float
    label: str
    distance_from_a_m: float
    distance_from_b_m: float
    worth_suggesting: bool


class OptimizePickupPassenger(BaseModel):
    passenger_id: str
    pickup: PointIn


class OptimizePickupOrderIn(BaseModel):
    passengers: list[OptimizePickupPassenger]
    driver_location: PointIn


class OptimizePickupOrderOut(BaseModel):
    ordered_passenger_ids: list[str]
    total_detour_km: float


# ---- Fare estimation -------------------------------------------------------

# Simple flat-rate-per-km estimate split across the group. Replace with a
# real fare model (base fare + per-km + per-min + surge, etc.) when ready —
# kept intentionally simple here since fare strategy wasn't specified.
EGP_PER_KM = 4.0
BASE_FARE_EGP = 10.0


def _estimate_fare(total_distance_km: float, group_size: int) -> tuple[float, float]:
    total_fare = BASE_FARE_EGP + (EGP_PER_KM * total_distance_km)
    your_fare = total_fare / max(group_size, 1)
    return round(total_fare, 2), round(your_fare, 2)


# ---- Routes -----------------------------------------------------------------

@router.post("/match", response_model=AiMatchResponseOut)
async def match_passengers(body: AiMatchRequestIn) -> AiMatchResponseOut:
    new_request = PassengerRequest(
        request_id=body.request_id,
        passenger_id=body.request_id,  # MVP: request_id doubles as passenger ref
        name=body.passenger_name,
        rating=body.passenger_rating,
        gender=body.passenger_gender,
        safe_mode=body.safe_mode,
        pickup=(body.pickup.lat, body.pickup.lng),
        destination=(body.destination.lat, body.destination.lng),
        scheduled_time=body.scheduled_time,
    )

    matched_group = await find_matches(new_request, PENDING_REQUESTS)

    if not matched_group:
        # No match yet — add this request to the pending pool so future
        # requests can match against it, and tell the frontend to keep waiting.
        PENDING_REQUESTS.append(new_request)
        return AiMatchResponseOut(
            matched=False,
            group=[],
            route_polyline=[],
            pickup_order=[],
            total_distance_km=0.0,
            estimated_duration_min=0.0,
            total_fare=0.0,
            your_fare=0.0,
            depart_at=body.scheduled_time,
        )

    # A match was found — remove matched passengers from the pending pool.
    matched_ids = {p.request_id for p in matched_group}
    PENDING_REQUESTS[:] = [p for p in PENDING_REQUESTS if p.request_id not in matched_ids]

    # Optimize pickup order using the first passenger's pickup as a stand-in
    # driver start point (MVP: no real driver-assignment flow wired up yet,
    # so we optimize relative to the group's own pickups).
    stops = [PickupStop(passenger_id=p.passenger_id, location=p.pickup) for p in matched_group]
    driver_start = stops[0].location
    ordered_stops = optimize_pickup_order(driver_start, stops)
    order_index = {s.passenger_id: i for i, s in enumerate(ordered_stops)}

    # Build the combined route polyline by chaining each passenger's
    # pickup->destination route in pickup order (simple MVP approximation of
    # the full multi-stop trip geometry).
    full_polyline: list[list[float]] = []
    total_distance_km = 0.0

    for p in matched_group:
        leg = await get_route(p.pickup, p.destination)
        full_polyline.extend([[lat, lng] for lat, lng in leg])
        total_distance_km += route_length_m(leg) / 1000.0

    total_fare, your_fare = _estimate_fare(total_distance_km, len(matched_group))
    estimated_duration_min = (total_distance_km / 30.0) * 60.0  # ~30 km/h avg city speed

    group_out = [
        MatchedPassengerOut(
            passenger_id=p.passenger_id,
            name=p.name,
            rating=p.rating,
            pickup=LocationIn(lat=p.pickup[0], lng=p.pickup[1], address=""),
            pickup_order=order_index.get(p.passenger_id, i),
            fare_share=your_fare,
        )
        for i, p in enumerate(matched_group)
    ]
    pickup_order_out = sorted(group_out, key=lambda g: g.pickup_order)

    is_requester = next((p for p in matched_group if p.request_id == body.request_id), None)
    requester_fare = your_fare  # equal split for MVP

    return AiMatchResponseOut(
        matched=True,
        group=group_out,
        route_polyline=full_polyline,
        pickup_order=pickup_order_out,
        total_distance_km=round(total_distance_km, 2),
        estimated_duration_min=round(estimated_duration_min, 1),
        total_fare=total_fare,
        your_fare=requester_fare,
        depart_at=body.scheduled_time,
    )


@router.post("/suggest/pickup", response_model=SuggestMeetupOut)
async def suggest_pickup(body: SuggestMeetupIn) -> SuggestMeetupOut:
    suggestion = await suggest_pickup_meetup(
        (body.point_a.lat, body.point_a.lng),
        (body.point_b.lat, body.point_b.lng),
    )
    return SuggestMeetupOut(
        lat=suggestion.location[0],
        lng=suggestion.location[1],
        label=suggestion.label,
        distance_from_a_m=round(suggestion.distance_from_a_m, 1),
        distance_from_b_m=round(suggestion.distance_from_b_m, 1),
        worth_suggesting=suggestion.worth_suggesting,
    )


@router.post("/suggest/destination", response_model=SuggestMeetupOut)
async def suggest_destination(body: SuggestMeetupIn) -> SuggestMeetupOut:
    suggestion = await suggest_destination_meetup(
        (body.point_a.lat, body.point_a.lng),
        (body.point_b.lat, body.point_b.lng),
    )
    return SuggestMeetupOut(
        lat=suggestion.location[0],
        lng=suggestion.location[1],
        label=suggestion.label,
        distance_from_a_m=round(suggestion.distance_from_a_m, 1),
        distance_from_b_m=round(suggestion.distance_from_b_m, 1),
        worth_suggesting=suggestion.worth_suggesting,
    )


@router.post("/optimize/pickup-order", response_model=OptimizePickupOrderOut)
async def optimize_pickup_order_route(body: OptimizePickupOrderIn) -> OptimizePickupOrderOut:
    stops = [
        PickupStop(passenger_id=p.passenger_id, location=(p.pickup.lat, p.pickup.lng))
        for p in body.passengers
    ]
    driver_loc = (body.driver_location.lat, body.driver_location.lng)
    ordered = optimize_pickup_order(driver_loc, stops)

    detour_km = estimate_total_detour_m(driver_loc, ordered) / 1000.0

    return OptimizePickupOrderOut(
        ordered_passenger_ids=[s.passenger_id for s in ordered],
        total_detour_km=round(detour_km, 2),
    )