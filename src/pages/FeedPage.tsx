import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Post } from '../types'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        if (error) throw error
        setPosts(data ?? [])
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load posts'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
          <Link
            to="/write"
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Write
          </Link>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">No posts yet. Be the first to write something.</p>
            <Link
              to="/write"
              className="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline"
            >
              Start writing →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                className="block bg-white border border-gray-100 rounded-xl p-6 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                {/* Title */}
                <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                  {post.title}
                </h2>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {post.reading_time && (
                    <span>{post.reading_time} min read</span>
                  )}
                  {post.published_at && (
                    <span>
                      {new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}