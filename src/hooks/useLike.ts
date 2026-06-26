import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useLike(postId: string, initialCount: number = 0) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  // Check if current user has liked this post
  useEffect(() => {
    if (!user) return

    const checkLike = async () => {
      const { data } = await supabase
        .from('likes')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      setLiked(!!data)
    }

    checkLike()
  }, [postId, user])

  const toggleLike = async () => {
    if (!user || loading) return

    setLoading(true)

    // Optimistic update — update UI instantly before Supabase responds
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