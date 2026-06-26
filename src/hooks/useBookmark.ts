import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useBookmark(postId: string) {
  const { user } = useAuth()
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return

    const checkBookmark = async () => {
      const { data } = await supabase
        .from('bookmarks')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      setBookmarked(!!data)
    }

    checkBookmark()
  }, [postId, user])

  const toggleBookmark = async () => {
    if (!user || loading) return

    setLoading(true)

    // Optimistic update
    setBookmarked(prev => !prev)

    try {
      if (bookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('bookmarks')
          .insert({ post_id: postId, user_id: user.id })
      }
    } catch (err) {
      // Revert on failure
      setBookmarked(prev => !prev)
      console.error('Bookmark failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return { bookmarked, toggleBookmark, loading }
}