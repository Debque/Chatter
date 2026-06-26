import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Heart, Bookmark, UserPlus, UserCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useLike } from '../hooks/useLike'
import { useBookmark } from '../hooks/useBookmark'
import { useFollow } from '../hooks/useFollow'
import CommentSection from '../components/comments/CommentSection'
import type { Post } from '../types'

function LikeButton({ postId }: { postId: string }) {
  const { liked, count, toggleLike, loading } = useLike(postId)

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
        liked
          ? 'bg-red-50 border-red-200 text-red-500'
          : 'bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400'
      }`}
    >
      <Heart size={15} className={liked ? 'fill-red-500' : ''} />
      <span>{count}</span>
    </button>
  )
}

function BookmarkButton({ postId }: { postId: string }) {
  const { bookmarked, toggleBookmark, loading } = useBookmark(postId)

  return (
    <button
      onClick={toggleBookmark}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
        bookmarked
          ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
          : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-400'
      }`}
    >
      <Bookmark size={15} className={bookmarked ? 'fill-indigo-600' : ''} />
      <span>{bookmarked ? 'Saved' : 'Save'}</span>
    </button>
  )
}

function FollowButton({ authorId }: { authorId: string }) {
  const { following, toggleFollow, loading, isOwnProfile } = useFollow(authorId)

  if (isOwnProfile) return null

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
        following
          ? 'bg-gray-50 border-gray-200 text-gray-600'
          : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {following
        ? <><UserCheck size={15} /> Following</>
        : <><UserPlus size={15} /> Follow</>
      }
    </button>
  )
}

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
    return () => { cancelled = true }
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

        {/* Meta + Follow */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3 text-sm text-gray-400">
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
          <FollowButton authorId={post.author_id} />
        </div>

        {/* Body */}
        <div
          className="prose prose-indigo max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Actions */}
        <div className="border-t border-gray-100 pt-8 mb-4 flex items-center gap-3">
          <LikeButton postId={post.id} />
          <BookmarkButton postId={post.id} />
        </div>

        {/* Comments */}
        <CommentSection postId={post.id} />

      </div>
    </div>
  )
}