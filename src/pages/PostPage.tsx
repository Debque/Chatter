import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    let cancelled = false

    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single()

        if (cancelled) return

        if (error) throw error
        setPost(data)
      } catch (err: unknown) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Post not found'
        setError(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPost()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900">Post not found</h1>
          <p className="text-gray-500 mt-2">This post may have been removed or doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4">

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-10">
          {post.reading_time && (
            <span>{post.reading_time} min read</span>
          )}
          {post.published_at && (
            <span>
              {new Date(post.published_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Body */}
        <div
          className="prose prose-indigo max-w-none"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

      </div>
    </div>
  )
}