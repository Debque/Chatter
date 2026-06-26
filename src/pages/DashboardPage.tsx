import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Heart, MessageCircle, Bookmark, PenLine } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Post } from '../types'

interface Stats {
  views: number
  likes: number
  comments: number
  bookmarks: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats>({ views: 0, likes: 0, comments: 0, bookmarks: 0 })
  const [loading, setLoading] = useState(true)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.email?.split('@')[0] ?? 'there'

  useEffect(() => {
    if (!user) return
    let cancelled = false

    const fetchData = async () => {
      try {
        // Fetch published posts
        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', user.id)
          .eq('status', 'published')
          .order('published_at', { ascending: false })

        if (cancelled) return
        const myPosts = postsData ?? []
        setPosts(myPosts)

        if (myPosts.length === 0) {
          setLoading(false)
          return
        }

        const postIds = myPosts.map(p => p.id)

        // Fetch views count
        const { count: viewCount } = await supabase
          .from('post_views')
          .select('*', { count: 'exact', head: true })
          .in('post_id', postIds)

        // Fetch likes count
        const { count: likeCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('post_id', postIds)

        // Fetch comments count
        const { count: commentCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .in('post_id', postIds)

        // Fetch bookmarks count
        const { count: bookmarkCount } = await supabase
          .from('bookmarks')
          .select('*', { count: 'exact', head: true })
          .in('post_id', postIds)

        if (cancelled) return

        setStats({
          views: viewCount ?? 0,
          likes: likeCount ?? 0,
          comments: commentCount ?? 0,
          bookmarks: bookmarkCount ?? 0,
        })
      } catch (err) {
        console.error('Dashboard fetch failed:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [user])

  const statCards = [
    { label: 'Views', value: stats.views, icon: <Eye size={20} className="text-indigo-500" />, color: 'bg-indigo-50' },
    { label: 'Likes', value: stats.likes, icon: <Heart size={20} className="text-red-500" />, color: 'bg-red-50' },
    { label: 'Comments', value: stats.comments, icon: <MessageCircle size={20} className="text-green-500" />, color: 'bg-green-50' },
    { label: 'Bookmarks', value: stats.bookmarks, icon: <Bookmark size={20} className="text-yellow-500" />, color: 'bg-yellow-50' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {firstName}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your content today.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {statCards.map(card => (
            <div
              key={card.label}
              className="bg-white border border-gray-100 rounded-2xl p-5"
            >
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Top Articles */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-900">Your Posts</h2>
            <Link
              to="/write"
              className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
            >
              <PenLine size={14} />
              Write new
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No published posts yet.</p>
              <Link
                to="/write"
                className="inline-block mt-3 text-indigo-600 text-sm font-medium hover:underline"
              >
                Write your first post →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-50">
              {posts.map(post => (
                <Link
                  key={post.id}
                  to={`/post/${post.slug}`}
                  className="flex items-center justify-between py-4 hover:opacity-70 transition-opacity"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {post.published_at && new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                      {post.reading_time && ` · ${post.reading_time} min read`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}