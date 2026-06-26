import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useFollow(followeeId: string) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user || user.id === followeeId) return

    const checkFollow = async () => {
      const { data } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('follower_id', user.id)
        .eq('followee_id', followeeId)
        .single()

      setFollowing(!!data)
    }

    checkFollow()
  }, [followeeId, user])

  const toggleFollow = async () => {
    if (!user || loading) return

    setLoading(true)
    setFollowing(prev => !prev)

    try {
      if (following) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followee_id', followeeId)
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, followee_id: followeeId })
      }
    } catch (err) {
      setFollowing(prev => !prev)
      console.error('Follow failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const isOwnProfile = user?.id === followeeId

  return { following, toggleFollow, loading, isOwnProfile }
}