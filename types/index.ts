export type College = {
    id: string
    name: string
    location: string
    state: string
    type: string
    fees_min: number
    fees_max: number
    rating: number
    total_reviews: number
    logo_url: string | null
    description: string | null
    placement_percent: number | null
    avg_package: number | null
    highest_package: number | null
    established: number | null
    affiliated_to: string | null
    approved_by: string | null
  }
  
  export type Course = {
    id: string
    college_id: string
    name: string
    duration: string
    fees: number
    seats: number | null
    degree_type: string
  }
  
  export type Review = {
    id: string
    college_id: string
    user_name: string
    rating: number
    review_text: string | null
    batch_year: number | null
  }