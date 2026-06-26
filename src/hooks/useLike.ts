import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useLike(postId: string) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchLikes = async () => {
      // Get total like count for this post
      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      setCount(likeCount ?? 0)

      // Check if current user has liked this post
      if (user) {
        const { data } = await supabase
          .from('likes')
          .select('user_id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single()

        setLiked(!!data)
      }
    }

    fetchLikes()
  }, [postId, user])

  const toggleLike = async () => {
    if (!user || loading) return

    setLoading(true)

    // Optimistic update
    setLiked(prev => !prev)
    setCount(prev => liked ? prev - 1 : prev + 1)

    try {
      if (liked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id })
      }
    } catch (err) {
      // Revert on failure
      setLiked(prev => !prev)
      setCount(prev => liked ? prev + 1 : prev - 1)
      console.error('Like failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return { liked, count, toggleLike, loading }
}