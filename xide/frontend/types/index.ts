export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type UserType = 'PASSENGER' | 'DRIVER'

export interface User {
  user_id: string
  name: string
  email: string
  phone: string
  gender: Gender
  profile_pic_url?: string
  rating: number
  user_type: UserType
  is_active: boolean
  created_at: string
}

export interface Location {
  lat: number
  lng: number
  address: string
}

export type RequestStatus = 'PENDING' | 'MATCHED' | 'CONFIRMED' | 'CANCELLED'
export type RideStatus = 'SCHEDULED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'CARD' | 'WALLET' | 'CASH'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export interface RideRequest {
  request_id: string
  passenger_id: string
  pickup: Location
  destination: Location
  scheduled_time: string
  safe_mode: boolean
  status: RequestStatus
  fare?: number
  created_at: string
}

export interface MatchedPassenger {
  passenger_id: string
  name: string
  rating: number
  pickup: Location
  pickup_order: number
  fare_share: number
}

export interface DriverInfo {
  driver_id: string
  name: string
  rating: number
  phone: string
  vehicle: {
    make: string
    model: string
    color: string
    license_plate: string
  }
  current_location?: Location
  eta_minutes?: number
}

export interface MatchResult {
  request_id: string
  group: MatchedPassenger[]
  route_polyline: [number, number][]
  total_distance_km: number
  estimated_duration_min: number
  total_fare: number
  your_fare: number
  driver?: DriverInfo
  depart_at: string
}

export interface Ride {
  ride_id: string
  driver: DriverInfo
  status: RideStatus
  passengers: MatchedPassenger[]
  route_polyline: [number, number][]
  start_time?: string
  end_time?: string
  total_fare: number
}

export interface RideHistoryItem {
  ride_id: string
  pickup_address: string
  dest_address: string
  date: string
  fare_share: number
  status: RideStatus
  passenger_count: number
}

export interface AiMatchRequest {
  request_id: string
  pickup: Location
  destination: Location
  scheduled_time: string
  safe_mode: boolean
  passenger_gender: Gender
}

export interface AiMatchResponse {
  matched: boolean
  group: MatchedPassenger[]
  route_polyline: [number, number][]
  pickup_order: MatchedPassenger[]
  total_distance_km: number
  estimated_duration_min: number
  total_fare: number
  your_fare: number
  depart_at: string
}