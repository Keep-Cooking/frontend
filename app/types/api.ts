export interface MeResponse {
    authenticated: boolean
    user_id?: number
    username?: string
    email?: string
    points?: number
    level?: number
    admin?: boolean
}

export interface SearchResponse {
    post_id: number
    title: string
    message: string
    image_url: string
    video_url: string
}

export interface Post {
    id: number
    recipe: {
        title: string
        message: string
        image_url: string | null
        video_url: string | null
    }
    image_url: string | null
    rating: number | null
    username: string
    date_posted: string
}

export interface MyPost {
    id: number
    title: string
    image_url: string | null
    rating: number | null
    hidden: boolean
}

export interface PostDetail {
    id: number
    user_id: number
    username: string
    recipe: {
        title: string
        message: string
        image_url: string | null
        video_url: string | null
    }
    image_url: string | null
    rating: number | null
    hidden: boolean
    date_posted: string
}

export interface PostsResponse {
    page: number
    page_size: number
    total_pages: number
    total_items: number
    items: Post[]
}

export interface RatingResponse {
    message: string
    post_id: number
    image_url: string
    rating: number
    user_points: number
    user_level: number
    level_up: boolean
}
