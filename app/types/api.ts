export interface MeResponse {
    authenticated: boolean
    user_id?: number
    username?: string
    email?: string
}

export interface SearchResponse {
    message: string
    image_url: string
    video_url: string
}

export interface StreamSearchEvent {
    event?: string
    data: string
}
