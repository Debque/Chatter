export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  twitter_handle: string | null
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  slug: string
  body: string
  excerpt: string | null
  cover_image_url: string | null
  tags: string[]
  status: 'draft' | 'published' | 'archived'
  reading_time: number | null
  published_at: string | null
  created_at: string
  updated_at: string
}